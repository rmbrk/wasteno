const { ref } = require('./helper.js');

module.exports = {
  schema: {
    name: String,
    verified: Boolean,
    verifiedBy: ref('Moderator'),
    homeAddress: String,
    homeCoordinates: {
      lon: Number,
      lat: Number,
    },
    coordinates: {
      lon: Number,
      lat: Number,
    },
    status: {
      active: Boolean,
      currentOrders: [ref('Order')],
    },
    username: String,
    hash: String,
    isRegular: Boolean,
    isPackerOnly: Boolean,
    isPacker: Boolean,
    isReceiverSpecific: Boolean,
    parentReceiver: ref('Receiver'),
    isReceiverLocationSpecific: Boolean,
    parentReceiverLocation: ref('ReceiverLocation'),
    isOccasional: Boolean,
    cars: [{
      name: String,
      color: String,
      tag: String,
      hasRefrigerator: String,
      imageUrl: String,
    }],
    acceptedOrders: [ref('Order')],
  },
};
