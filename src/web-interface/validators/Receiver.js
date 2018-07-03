const {
  Receiver,
} = require('./../../database/models');

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
    const {
      recAuthed,
      recAuthedEndMS,
      recId,
    } = req.session;

    if (!recAuthed) {
      sendError(res, {
        error: errors.common_login_no,
      });
      return;
    }

    if (recAuthed && recAuthedEndMS < Date.now()) {
      sendError(res, {
        error: errors.receiver_auth_expired,
        details: {
          config: config.receiver.auth,
        },
      });
      return;
    }

    Receiver.findById(recId, (err, rec) => {
      if (err) {
        dbError(res, err);
        return;
      }

      if (!rec) {
        sendError(res, {
          error: errors.receiver_not_exists,
        });
        return;
      }

      req.rec = rec;
      next();
    });
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
