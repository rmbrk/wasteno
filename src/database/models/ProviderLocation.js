const { ref, types: { Point } } = require('./helper.js');

module.exports = {
  schema: {
    parent: ref('Provider'),
    isMain: Boolean,
    screenName: String,
    address: String,
    coordinates: Point,
    contact: {
      email: String,
      phone: String,
    },
  },
};
