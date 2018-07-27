const { types, methods } = require('./common.js');

module.exports = {
  schema: {
    eid: types.eid,
    name: 'string',
    description: 'string',
    inStock: 'boolean',
    photoUrl: 'string',
    category: [['enum', ['FMCG', 'durable']]],
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
