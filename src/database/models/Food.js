const { ref } = require('./helper.js');

module.exports = {
  schema: {
    name: String,
    provider: ref('Provider'),
    items: [ref('FoodItem')],
    category: {
      type: String,
      enum: ['FMCG', 'durable'],
    },
  },
};
