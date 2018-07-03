const { ref, price } = require('./helper.js');

module.exports = {
  schema: {
    items: [{
      food: ref('Sale'),
      price,
      location: ref('ProviderLocation'),
      amount: Number,
      maxExpiry: Date,
    }],
    price: Number,
    driver: ref('Transporter'),
    clientLocation: ref('ReceiverLocation'),
    at: Date,
    status: {
      formed: {
        at: Date,
        value: Boolean,
      },
      paid: {
        at: Date,
        value: Boolean,
      },
      accepted: {
        at: Date,
        value: Boolean,
      },
      pickedUp: {
        at: Date,
        value: Boolean,
      },
      underWay: {
        at: Date,
        value: Boolean,
      },
      arrived: {
        at: Date,
        value: Boolean,
      },
    },
  },
};
