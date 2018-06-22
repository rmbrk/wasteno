const { ref } = require('./helper.js');

module.exports = {
  schema: {
    name: String,
    verifiedBy: ref('Moderator'),
    contact: {
      email: String,
      phone: String,
    },
    username: String,
    hash: String,
    locations: [ref('ProviderLocation')],
    foods: [ref('Food')],
    hasPackers: Boolean,
  },
};
