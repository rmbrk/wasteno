const { ref } = require('./helper.js');

module.exports = {
  schema: {
    parent: ref('Food'),
    price: Number,
    currency: {
      type: String,
      enum: ['eur', 'czk'],
    },
    quantity: Number,
    expires: Date,
    location: ref('ProviderLocation'),
  },
};
