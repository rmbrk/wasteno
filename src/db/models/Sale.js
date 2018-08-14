const { types, methods } = require('./common.js');
const config = require('./../../config.js');

const {
  models,
  extractData,
} = require('./helper.js');

const {
  remap,
  getUnique,
  mapExtract,
} = require('./../../utils.js');

module.exports = {
  schema: {
    ...types.group.price,
    eid: types.eid,
    name: 'string',
    description: 'string',
    inStock: 'boolean',
    photoUrl: 'string',
    category: [['enum', config.sale.categories]],
  },
  references: {
    parent: 'Provider',
  },
  associations: {
    belongsTo: {
      provider: 'Provider via parent',
    },
    hasMany: {
      instances: 'SaleInstance.parent',
      ordered: 'OrderedSale.parent',
    },
  },
  statics: {
    byEids(eids) {
      const uniqueEids = getUnique(eids);
      return new models.Sale()
        .query(q => q.whereIn('eid', uniqueEids));
    },
    idsByEids(eids) {
      const uniqueEids = getUnique(eids);
      return this.byEids(uniqueEids)
        .query(q => q.select('id', 'eid'));
    },
    fetchIdsByEids(eids) {
      const uniqueEids = getUnique(eids);
      return this.idsByEids(uniqueEids)
        .fetchAll()
        .then(extractData)
        .then(sales =>
          remap(eids, sales, (eid, sale) =>
            sale.eid === eid))
        .then(mapExtract('id'));
    },
    fetchByEids(eids) {
      const uniqueEids = getUnique(eids);
      return this.byEids(uniqueEids)
        .fetchAll();
    },
  },
};
