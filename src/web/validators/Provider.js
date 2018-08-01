const {
  Provider,
} = require('./../../db/models');

const {
  check,
  validator,
  handleRequestValidation,
} = require('./helper.js');

const {
  sendError,
  genDbError,
  errors,
  config,
} = require('./../helper.js');

const common = require('./common.js');

const { validatorFns: commonValidators } = common;

const validationConfig = {
  modelName: 'Provider',
  errorPrefix: 'provider',
  sessionPrefix: 'prov',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  eid(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: eid => commonValidators.validateEid(eid, 'provider'),
      property: 'eid',
      details: {
        config: config.provider.eid,
      },
    }]);
  },
};
