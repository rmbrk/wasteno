const {
  Receiver,
  ReceiverLocation,
} = require('./../../db/models');

const {
  config,
  affirm,
} = require('./../helper.js');

const common = require('./common.js');

const {
  validateBuyerEid,
} = common;

const validationConfig = {
  Model: Receiver,
  LocationModel: ReceiverLocation,
  errorPrefix: 'receiver',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  eid({ input }) {
    validateBuyerEid(input.eid, 'receiver');
  },
};
