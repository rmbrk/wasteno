const {
  Receiver,
  ReceiverLocation,
} = require('./../../database/models');

const {
  errors,
  config,
  sendError,
  ok,
  genOk,
  dbError,
  genDbError,
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  model: Receiver,
  locationModel: ReceiverLocation,
  sessionPrefix: 'rec',
  errorPrefix: 'receiver',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,
  ...common.group.locationOwner,
};
