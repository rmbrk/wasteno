const {
  Transporter,
} = require('./../../db/models/');

const {
  sendError,
  dbError,
  errors,
  config,
} = require('./../helper.js');

const common = require('./common.js');
const { 
  validateLon,
  validateLat,
} = common;

const validationConfig = {
  Model: Transporter,
  errorPrefix: 'transporter',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,

  coords({ input, session }) {
    const {
      lon,
      lat
    } = input;

    validateLon(lon);
    validateLat(lat);
  },

  convenienceOrderSearch({ input, session }) {
    // TODO
  }
};
