const bcrypt = require('bcrypt');

const {
  getDifference,
  mapExtract,
  extractor,
  extract,
  getUnique,
  genGroupByProperties,
} = require('./../../utils.js');

const { types, methods } = require('./common.js');

const { models } = require('./helper.js');

const methodConfig = {
  modelName: 'Provider',
  locationCollection: 'ProviderLocations',
  locationModel: 'ProviderLocation',
};
module.exports = {
  schema: {
    ...types.group.contact,
    ...types.group.login,
    ...types.group.locationOwner,
    eid: types.eid,
    hasPackers: [['boolean']],
  },
  references: {
    verifiedBy: 'Moderator',
  },
  associations: {
    hasMany: {
      locations: 'ProviderLocation.parent',
      sales: 'Sale.parent',
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
    addSales(opts) {
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
          eid,
          priceAmount,
        } = sale;

        return {
          name,
          description,
          inStock,
          photoUrl,
          category,
          eid,
          priceAmount,
          parent: this.id,
        };
      });

      return new models.Sales(usableSales)
        .invokeThen('save');
    },
    salesByEids(eids) {
      const uniqueEids = getUnique(eids);
      return new models.Sale({ parent: this.id })
        .query(q => q.whereIn('eid', uniqueEids));
    },
    fetchAlreadyExistingSaleEids(eids) {
      const uniqueEids = getUnique(eids);
      return new models.Sale({ parent: this.id })
        .query(q => q.whereIn('eid', uniqueEids).select('eid'))
        .fetchAll()
        .then(extractor('models'))
        .then(mapExtract('attributes.eid'));
    },
    fetchInexistentSaleEids(eids) {
      const uniqueEids = getUnique(eids);
      return this.fetchAlreadyExistingSaleEids(eids)
        .then(saleEids => getDifference(saleEids, uniqueEids));
    },
    addSaleInstances(opts) {
      const {
        saleInstances,
      } = opts;

      // for some reason the code breaks otherwise
      if (saleInstances.length === 0) {
        return;
      }

      const locationIndices = extract(saleInstances, 'location');

      const usableSales = saleInstances.map((saleInstance) => {
        const {
          eid,
          expiry,
          quantity = 1,
          location,
        } = saleInstance;

        return {
          eid,
          expiry,
          quantity,
          location,
          parent: this.id,
        };
      });

      return new models.SaleInstances(usableSales)
        .invokeThen('save');
    },
    saleInstancesByEids(eids) {
      const uniqueEids = getUnique(eids);
      return new models.SaleInstance({ parent: this.id })
        .query(q => q.whereIn('eid', eids));
    },
    fetchAlreadyExistingSaleInstanceEids(eids) {
      const uniqueEids = getUnique(eids);
      return this.saleInstancesByEids(uniqueEids)
        .query(q => q.select('eid'))
        .fetchAll()
        .then(mapExtract('eid'));
    },
    fetchInexistentSaleInstanceEids(eids) {
      return this.fetchAlreadyExistingSaleInstanceEids(eids)
        .then(saleInstanceEids => getDifference(saleInstanceEids, eids));
    },
  },
};
