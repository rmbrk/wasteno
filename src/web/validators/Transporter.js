const {
  sendError,
  dbError,
  errors,
  config,
} = require('./../helper.js');

const common = require('./common.js');
const { 
  validatorFns: {
    validateLon,
    validateLat,
  } 
} = common;

const validationConfig = {
  modelName: 'Transporter',
  errorPrefix: 'transporter',
  sessionPrefix: 'trsp',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,

  coords(req, res, next) {
    const {
      lon,
      lat
    } = req.body;

    const lonErr = validateLon(lon, { exists: true });
    if (lonErr) {
      sendError(res, {
        error: lonErr,
      });
      return;
    }

    const latErr = validateLat(lat, { exists: true });
    if (latErr) {
      sendError(res, {
        error: latErr,
      })
      return;
    }

    next();
  },

  convenienceOrderSearch(req, res, next) {
    // TODO
    next();
  }
};
