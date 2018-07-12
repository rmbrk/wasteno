const {
  sendError,
  ok,
  genOk,
  genDbError,
  errors,
  config,
} = require('./../helper.js');

const {
  prefixProxy,
} = require('./../../utils.js');

const models = require('./../../database/models');

module.exports = {
  group: {
    user: {
      create(req, res) {
        const {
          name,
          email,
          phone,
          username,
          password,
        } = req.body;

        new this.config.model({ username })
          .fetch()
          .then((model) => {
            if (model) {
              sendError(res, {
                error: errors.common_username_exists,
              });
              return;
            }

            return new this.config.model({
              name,
              email,
              phone,
              username,
              password,
            })
              .save()
              .then(genOk(res));
          })
          .catch(genDbError(res));
      },
      login(req, res) {
        const {
          username,
          password,
        } = req.body;

        const session = prefixProxy(this.config.sessionPrefix, req.session);

        const now = Date.now();

        if (now < session.loginBanEndMS) {
          return sendError(res, {
            error: errors.common_login_before_ban_end,
            details: config.common.login,
          });
        }

        new this.config.model({ username })
          .checkLogin({ password })
          .then((model) => {
            if (!model || !model.passwordsMatched) {
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

              return sendError(res, {
                error: errors.common_login_invalid,
              });
            }

            session.authed = true;
            session.id = model.id;
            session.loginTries = 0;
            session.authedEndMS = now + config.common.auth.intervalMS;

            ok(res);
          })
          .catch(genDbError(res));
      },
      logout(req, res) {
        const session = prefixProxy(this.config.sessionPrefix, req.session);
        session.authed = false;

        ok(res);
      },
      delete(req, res) {
        const session = prefixProxy(this.config.sessionPrefix, req.session);

        new this.config.model({ id: session.id })
          .destroy({ require: false })
          .then(() => {
            session.authed = false;

            ok(res);
          })
          .catch(genDbError(res));
      },
    },
    locationOwner: {
      getLocations(req, res) {
        const {
          username,
        } = req.body;

        const modelErrors = prefixProxy(`${this.config.errorPrefix}_`, errors, {
          isUppercase: false,
        });

        new this.config.model({ username })
          .fetch({ withRelated: ['locations'] })
          .then((model) => {
            if (!model) {
              sendError(res, {
                error: modelErrors.not_exists,
              });
              return;
            }

            ok(res, {
              locations: model.related('locations').models,
            });
          })
          .catch(genDbError(res));
      },
      addLocations(req, res) {
        const {
          locations,
        } = req.body;

        const session = prefixProxy(this.config.sessionPrefix, req.session);

        const locNames = locations.map(loc => loc.name);
        new this.config.locationModel({ parent: session.id })
          .where('name', 'in', locNames)
          .fetch()
          .then((loc) => {
            if (loc) {
              sendError(res, {
                error: errors.common_location_name_exists,
                details: {
                  index: locNames.indexOf(loc.get('name')),
                },
              });
              return;
            }

            return req[this.config.sessionPrefix]
              .addLocations({ locations })
              .then(genOk(res));
          })
          .catch(genDbError(res));
      },
    },
  },
};
