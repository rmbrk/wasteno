const { ref } = require('./helper.js');

module.exports = {
  schema: {
    items: [{
      food: ref('FoodItem'),
      amount: Number,
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
      payed: {
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
