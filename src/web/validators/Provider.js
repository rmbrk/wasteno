const {
  Provider,
} = require('./../../db/models');

const {
  affirm,
} = require('./../helper.js');

const common = require('./common.js');

const {
  validateSellerEid,
} = common;

const validationConfig = {
  Model: Provider,
  errorPrefix: 'provider',
  sessionPrefix: 'prov',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  eid({ input }) {
    validateSellerEid(input.eid, 'provider');
  },
};
