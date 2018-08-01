const { types } = require('./common.js');

module.exports = {
  schema: {
    eid: types.eid,
    quantity: [['integer']],
    expiry: [['bigInteger']], // MS
  },
  references: {
    location: 'ProviderLocation',
    parent: 'Sale',
  },
  associations: {
    belongsTo: {
      parent: 'Sale via parent',
      location: 'ProviderLocation via location',
    },
  },
};
