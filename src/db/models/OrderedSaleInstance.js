const { types } = require('./common.js');

module.exports = {
  schema: {
    ...types.group.price,
    quantity: [['integer']],
    minExpiry: [['date']],
  },
  references: {
    parent: 'Sale',
    location: 'ProviderLocation',
    order: 'Order',
  },
  associations: {
    belongsTo: {
      parent: 'Sale via parent',
      location: 'ProviderLocation via location',
      order: 'Order via order',
    },
  },
};
