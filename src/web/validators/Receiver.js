const {
  Receiver,
} = require('./../../db/models');

const {
  check,
  validator,
  handleRequestValidation,
} = require('./helper.js');

const {
  sendError,
  dbError,
  errors,
  config,
} = require('./../helper.js');

const common = require('./common.js');
const { validatorFns: commonValidators } = common;

const validateLocations = (locations) => {
  if (!locations) {
    return errors.common_object_missing;
  }

  for (let i = 0; i < locations.length; ++i) {
    const location = locations[i];

    const locationError = commonValidators.validateLocation(location);
    if (locationError) {
      return [locationError, { index: i }];
    }
  }
};

const validationConfig = {
  modelName: 'Receiver',
  errorPrefix: 'receiver',
  sessionPrefix: 'rec',
};
module.exports = {
  config: validationConfig,
  ...common.group.user,
  ...common.group.locationOwner,
};
