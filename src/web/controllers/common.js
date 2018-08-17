const {
  affirm,
  affirmError,
  config,
} = require('./../helper.js');

const {
  prefixProxy,
  pluck,
} = require('./../../utils.js');

const models = require('./../../db/models');

module.exports = {
  group: {
    user: {
      async create({ input }) {
        const {
          username,
        } = input;

        const additionalProperties =
          this.config.additionalUserProperties || [];

        const transferProperties = [
          'name',
          'email',
          'phone',
          'username',
          'password',
          ...additionalProperties,
        ];

        const usernameExists = await this.Model.exists({ username });
        affirm(!usernameExists, 'common_username_exists');

        await new this.Model(pluck(
          input,
          transferProperties,
        ))
          .save();

        return {};
      },
      async login({ input, session }) {
        const {
          username,
          password,
        } = input;

        const now = Date.now();

        if (session.loginBanEndMS) {
          affirm(now > session.loginBanEndMS, 'common_login_before_ban_end');
        }

        const user = await new this.Model({ username })
          .checkLogin({ password });

        if (!user || !user.passwordsMatched) {
          if (!session.loginTries) {
            session.loginTries = 0;
          }

          if (!session.loginLastTry
              || now - session.loginLastTry > config.common.login.intervalMS) {
            session.loginLastTry = Date.now();
            session.loginTries = 0;
          }

          session.loginTries++;

          if (session.loginTries >= config.common.login.tries) {
            session.loginBanEndMS = now + config.common.login.intervalMS;
          }

          affirmError('common_login_invalid');
        }

        session.authed = true;
        session.user = user;
        session.loginTries = 0;
        session.authedEndMS = now + config.common.auth.intervalMS;

        return {};
      },
      logout({ session }) {
        session.authed = false;

        return {};
      },
      async delete({ session, user }) {
        await this.Model({ id: user.id })
          .destroy({ require: false });

        session.authed = false;

        return {};
      },
      async getByUsername({ input }) {
        const { username } = input;

        const model = await new this.Model({ username }).fetch();

        return {
          [this.config.dataName]: model,
        };
      },
    },
    locationOwner: {
      async getLocations({ input }) {
        const {
          username,
        } = input;

        const user = await new this.Model({ username })
          .fetch({ withRelated: 'locations' });

        affirm(user, this.error('not_exists'));

        return {
          locations: user.related('locations').models,
        };
      },
      async addLocations({ input, user }) {
        const {
          locations,
        } = input;

        const locNames = locations.map(loc => loc.name);

        const childLocationWithNameExists =
          await this.LocationModel.exists({
            parent: user.id,
            query: q => q.whereIn('name', locNames),
          });

        affirm(!childLocationWithNameExists, 'location_name_exists');

        await user.addLocations({ locations });

        return {};
      },
    },
  },
};
