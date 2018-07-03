const { ref, unique } = require('./helper.js');

module.exports = {
  schema: {
    name: unique(String),
    description: String,
    inStock: Boolean,
    photoUrl: String,
    instances: [ref('SaleInstance')],
    parentId: ref('Provider'),
    category: {
      type: String,
      enum: ['FMCG', 'durable'],
    },
  },
};
