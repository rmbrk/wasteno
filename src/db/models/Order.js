const { types } = require('./common.js');

module.exports = {
  schema: {
    ...types.group.price,

    formed: 'boolean',
    formedAt: 'date',

    paid: 'date',
    accepted: 'date',
    pickedUp: 'date',
    underWay: 'date',
    arrived: 'date'
  },
  references: {
    transporter: 'Transporter',
    receiverLocation: 'ReceiverLocation',
  },
  associations: {
    hasMany: {
      orderedSaleInstances: 'OrderedSaleInstance.order',
    },
    belongsTo: {
      transporter: 'Transporter',
      receiverLocation: 'ReceiverLocation',
    },
    belongsToMany: {
      providerLocations: 'ProviderLocation',
    }
  },
};
