const { types } = require('./common.js');

module.exports = {
  schema: {
    ...types.group.price,
    quantity: [['integer']],
    maxExpiry: types.date,

    accepted: types.date,
    estimatedPickup: types.date,
    pickedUp: types.date,
    estimatedArrival: types.date,
    arrived: types.date,
  },
  references: {
    parent: 'Sale',
    sourceLocation: 'ProviderLocation',
    destLocation: 'ReceiverLocation',
    order: 'Order',
    transporter: 'Transporter',
  },
  associations: {
    belongsTo: {
      parent: 'Sale via parent',
      sourceLocation: 'ProviderLocation via sourceLocation',
      destLocation: 'ReceiverLocation via destLocation',
      order: 'Order via order',
    },
  },
};
