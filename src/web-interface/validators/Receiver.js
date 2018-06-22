const {
  check,
  validator,
  handleRequestValidation,
} = require('./helper.js');

const {
  sendError,
  errors,
  config,
} = require('./../helper.js');

const { validatorFns: commonValidators } = require('./Common.js');

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

module.exports = {
  loggedIn(req, res, next) {
    if (!req.session.recAuthed) {
      sendError(res, {
        error: errors.common_login_no,
      });
      return;
    }

    if (req.session.recAuthed && req.session.recAuthedEndMS < Date.now()) {
      sendError(res, {
        error: errors.receiver_auth_expired,
        details: {
          config: config.receiver.auth,
        },
      });
      return;
    }
    next();
  },
  notLoggedIn(req, res, next) {
    if (req.session.recAuthed) {
      sendError(res, {
        error: errors.common_login_yes,
      });
      return;
    }

    next();
  },
  locations(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: validateLocations,
      property: 'locations',
    }]);
  },
};
