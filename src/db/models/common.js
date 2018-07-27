const bcrypt = require('bcrypt');

const { models } = require('./helper.js');

const {
  getUnique,
  extractor,
  mapExtract,
  genGroupByProperties,
} = require('./../../utils.js');

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
        const model = await this.fetch();

        if (model) {
          model.passwordsMatched = await bcrypt.compare(
            password,
            model.get('hash'),
          );
        }

        return model;
      },
      async verify({ modMid }) {
        return this.fetch((model) => {
          this.set('verifiedBy',  modMid);
          return this.save();
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
            phone = this.attributes.phone,
            email = this.attributes.email,
            name,
            address,
            lon,
            lat,
            index,
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
            index,
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
      locationsByIndices(indices) {
        const uniqueIndices = getUnique(indices);

        return new models[this.config.locationModel]({ parent: this.id })
          .query(q => q.whereIn('index', uniqueIndices));
      },
      fetchLocationIdsByIndices(indices) {
        const uniqueIndices = getUnique(indices);
        return this.locationsByIndices(uniqueIndices)
          .query(q => q.select('id', 'index'))
          .fetchAll()
          .then(extractor('models'))
          .then(mapExtract('attributes'))
          .then(genGroupByProperties('id', 'index'))
          // items coming back might not be in the right order
          // so to mirror the original array you need to
          // compare multiple indices.
          // I'm so not sure how to make this more readable
          .then(({ id: ids, index: dbIndices }) =>
            indices.map((localIndex) => {
              const localLookupIndex = uniqueIndices.indexOf(localIndex);

              const dbLookupIndex = dbIndices.indexOf(
                uniqueIndices[localLookupIndex]);

              return dbLookupIndex > -1
                ? ids[dbLookupIndex]
                : false;
            }));
      },
    },
  },
};

const types = {
  eid: [['string'], 'unique'],
  group: {
    locationOwner: {
      locationIndexCount: [['integer']],
    },
    location: {
      address: [['string']],
      lon: [['decimal']],
      lat: [['decimal']],
      index: [['integer']],
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
