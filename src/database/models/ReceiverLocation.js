const { ref, types: { Point } } = require('./helper.js');

module.exports = {
  schema: {
    isMain: Boolean,
    name: String,
    address: String,
    coordinates: Point,
    email: String,
    phone: String,
    token: String,
  },
};
