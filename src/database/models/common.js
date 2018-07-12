const bcrypt = require('bcrypt');

const { models } = require('./helper.js');

const methods = {
  group: {
    user: {
      userInit() {
        this.on('saving', this.hash);
      },
      async hash() {
        if (this.get('password')) {
          const hash = await bcrypt.hash(
            this.get('password'),
            Number(process.env.BCRYPT_SALT_ROUNDS),
          );
          this.set('hash', hash);
          this.unset('password');
        }

        return this;
      },
      async checkLogin({ password }) {
        const mod = await this.fetch();

        if (mod) {
          mod.passwordsMatched = await bcrypt.compare(
            password,
            mod.get('hash'),
          );
        }

        return mod;
      },
      async verify({ modId }) {
        return this.save({
          verifiedBy: modId,
        }, {
          method: 'update',
          require: false,
        });
      },
    },
    locationOwner: {
      async addLocations(opts) {
        const {
          locations,
        } = opts;

        let isAnyMain = false;
        const usableLocations = locations.map((location) => {
          const {
            isMain = false,
            phone = this.phone,
            email = this.email,
            name,
            address,
            lon,
            lat,
          } = location;

          if (isMain) {
            isAnyMain = true;
          }

          return {
            isMain,
            phone,
            email,
            lon,
            lat,
            name,
            address,
            parent: this.id,
          };
        });

        if (isAnyMain) {
          await new models[this.config.locationModel]({ parent: this.id, isMain: true })
            .save({ isMain: false });
        }

        return new models[this.config.locationCollection](usableLocations)
          .invokeThen('save');
      },
    },
  },
};

const types = {
  eid: [['string'], 'unique'],
  group: {
    location: {
      address: [['string']],
      lon: [['decimal']],
      lat: [['decimal']],
    },
    contact: {
      name: [['string']],
      email: [['string']],
      phone: [['string']],
    },
    login: {
      username: [['string']],
      hash: [['string']],
    },
    price: {
      // 2 fractional digits
      // 10 total digits (8-2=6: up to 999,999.99, <1M)
      priceAmount: [['decimal', 8, 2]],
      priceCurrency: [['enum', ['eur', 'czk', 'gbp', 'usd']]],
    },
  },
};

module.exports = {
  types,
  methods,
};
