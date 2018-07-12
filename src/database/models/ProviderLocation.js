const { types } = require('./common.js');

module.exports = {
  schema: {
    isMain: [['boolean']],
    ...types.group.contact,
    ...types.group.location,
  },
  references: {
    parent: 'Provider',
  },
  associations: {
    hasMany: {
      saleInstances: 'SaleInstance.location',
      orderedSaleInstances: 'OrderedSaleInstance.location',
    },
    belongsTo: {
      parent: 'Provider',
    },
    belongsToMany: {
      orders: 'Order',
    },
  },
};
