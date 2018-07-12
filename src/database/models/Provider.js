const bcrypt = require('bcrypt');
const { types, methods } = require('./common.js');

const { models } = require('./helper.js');

const methodConfig = {
  modelName: 'Provider',
  locationCollection: 'ProviderLocations',
  locationModel: 'ProviderLocation'
}
module.exports = {
  schema: {
    ...types.group.contact,
    ...types.group.login,
    hasPackers: [['boolean']],
  },
  references: {
    verifiedBy: 'Moderator',
  },
  associations: {
    hasMany: {
      locations: 'ProviderLocation.parent',
      sales: 'Sale.provider',
      orders: 'Order.provider',
    },
    belongsTo: {
      verifier: 'Moderator via verifiedBy',
    },
  },
  methods: {
    config: methodConfig,
    ...methods.group.locationOwner,
    ...methods.group.user,
    initialize() {
      this.constructor.__super__.initialize.apply(this, arguments);
      this.userInit();
    },
    async addSales(opts) {
      const {
        sales,
      } = opts;

      // for some reason the code breaks otherwise
      if (sales.length === 0) {
        return;
      }

      const usableSales = sales.map((sale) => {
        const {
          name,
          description,
          inStock,
          photoUrl,
          category,
        } = sale;

        return {
          name,
          description,
          inStock,
          photoUrl,
          category,
          parent: this.id,
        };
      });

      return new models.Sales(usableSales)
        .invokeThen('save');
    },
  },
};
