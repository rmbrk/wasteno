const { types, methods } = require('./common.js');
const config = require('./../../config.js');

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
    } 
  }
};
