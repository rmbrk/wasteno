const {
  sendError,
  dbError,
  errors,
  config,
} = require('./../helper.js');

const common = require('./common.js');

const validationConfig = {
  modelName: 'Transporter',
  errorPrefix: 'transporter',
  sessionPrefix: 'trsp',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,
  ...common.group.locationOwner,
};
