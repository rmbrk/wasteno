const { ref, price } = require('./helper.js');

module.exports = {
  schema: {
    price,
    quantity: Number,
    expiry: Date,
    location: ref('ProviderLocation'),
  }
}
