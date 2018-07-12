const {
  check,
  validator,
  handleRequestValidation,
} = require('./helper.js');

const {
  sendError,
  errors,
  genDbError,
  config,
} = require('./../helper.js');

const {
  prefixProxy,
} = require('./../../utils.js');

const models = require('./../../database/models/');

const validateName = (name, opts = {}) => {
  const {
    exists = false,
    nameConfig = config.common.name,
  } = opts;

  if (!name) {
    return exists
      ? errors.common_name_missing
      : false;
  }

  if (typeof name !== 'string') {
    return errors.common_name_out_of_charset;
  }

  const lengthError = check.len(name, {
    min: nameConfig.minSize,
    max: nameConfig.maxSize,
    minError: errors.common_name_length_short,
    maxError: errors.common_name_length_long,
  });
  if (lengthError) {
    return lengthError;
  }

  const charsetError = check.charset(name, {
    charset: nameConfig.charset,
    charserError: errors.common_name_out_of_charset,
  });
  if (charsetError) {
    return charsetError;
  }

  return false;
};

const validateUsername = (username, opts = {}) => {
  const {
    exists = true,
  } = opts;

  if (!username) {
    return exists
      ? errors.common_username_missing
      : false;
  }

  if (typeof username !== 'string') {
    return errors.common_username_out_of_charset;
  }

  const lengthError = check.len(username, {
    min: config.common.username.minSize,
    max: config.common.username.maxSize,
    minError: errors.common_username_length_short,
    maxError: errors.common_username_length_long,
  });
  if (lengthError) {
    return lengthError;
  }

  const charsetError = check.charset(username, {
    charset: config.common.username.charset,
    charserError: errors.common_username_out_of_charset,
  });
  if (charsetError) {
    return charsetError;
  }

  return false;
};

const validatePassword = (password, opts = {}) => {
  const {
    exists = true,
  } = opts;

  if (!password) {
    return errors.common_password_missing;
  }

  if (typeof password !== 'string') {
    return errors.common_password_out_of_charset;
  }

  const lengthError = check.len(password, {
    min: config.common.password.minSize,
    max: config.common.password.maxSize,
    minError: errors.common_password_length_short,
    maxError: errors.common_password_length_long,
  });
  if (lengthError) {
    return lengthError;
  }

  const charsetError = check.charset(password, {
    charset: config.common.password.charset,
    charserError: errors.common_password_out_of_charset,
  });
  if (charsetError) {
    return charsetError;
  }
};

const validateEmail = (email, opts = {}) => {
  const {
    exists = true,
  } = opts;

  if (!email) {
    return exists
      ? errors.common_email_missing
      : false;
  }

  if (typeof email !== 'string') {
    return errors.common_email_invalid;
  }

  if (!validator.isEmail(email)) {
    return errors.common_email_invalid;
  }
};

const validatePhone = (phone, opts = {}) => {
  const {
    exists = true,
  } = opts;

  if (!phone) {
    return exists
      ? errors.common_phone_missing
      : false;
  }

  if (typeof phone !== 'string') {
    return errors.common_phone_invalid;
  }

  if (!validator.isMobilePhone(phone, 'any')) {
    return errors.common_phone_invalid;
  }
};

const validateLon = (lon, opts = {}) => {
  const {
    exists = false,
  } = opts;

  if (!lon) {
    return exists
      ? errors.common_lon_missing
      : false;
  }

  if (typeof lon !== 'number' || lon < -180 || lon > 180) {
    return errors.common_lon_invalid;
  }
};
const validateLat = (lat, opts = {}) => {
  const {
    exists = false,
  } = opts;

  if (!lat) {
    return exists
      ? errors.common_lat_missing
      : false;
  }

  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    return errors.common_lat_invalid;
  }
};

const validateAddress = (address) => {
  if (!address) {
    return errors.common_address_missing;
  }

  if (typeof address !== 'string') {
    return errors.common_address_invalid;
  }
};

const validateLocation = (location) => {
  const {
    name,
    lon,
    lat,
    email,
    phone,
    address,
  } = location;

  const addressError = validateAddress(address);
  if (addressError) {
    return addressError;
  }

  const nameError = validateName(name, { exists: true });
  if (nameError) {
    return nameError;
  }

  const lonError = validateLon(lon);
  if (lonError) {
    return lonError;
  }

  const latError = validateLat(lat);
  if (latError) {
    return latError;
  }

  const emailError = validateEmail(email, { exists: false });
  if (emailError) {
    return emailError;
  }

  const phoneError = validatePhone(phone, { exists: false });
  if (phoneError) {
    return phoneError;
  }
};

const validateLocations = (locations) => {
  if (!locations) {
    return errors.common_object_missing;
  }

  let isAnyMain = false;
  for (let i = 0; i < locations.length; ++i) {
    const location = locations[i];

    if (location.isMain) {
      if (isAnyMain) {
        return [errors.common_location_multiple_main, { index: i }];
      }

      isAnyMain = true;
    }

    const locationError = validateLocation(location);
    if (locationError) {
      return [locationError, { index: i }];
    }
  }
};
const validatePagination = (offset, amount, paginationConfig) => {
  const {
    maxAmount,
  } = paginationConfig;

  if (!offset) {
    return errors.common_offset_missing;
  }

  if (typeof offset !== 'number') {
    return errors.common_offset_invalid;
  }

  if (!amount) {
    return errors.common_amount_missing;
  }

  if (typeof amount !== 'number') {
    return errors.common_amount_invalid;
  }

  if (amount >= maxAmount) {
    return errors.common_amount_invalid;
  }
};

module.exports = {
  validatorFns: {
    validateName,
    validateUsername,
    validatePassword,
    validateEmail,
    validatePhone,
    validateLon,
    validateLat,
    validateAddress,
    validateLocation,
    validatePagination,
  },
  group: {
    user: {
      loggedIn(req, res, next) {
        const session = prefixProxy(this.config.sessionPrefix, req.session);
        const modelErrors = prefixProxy(`${this.config.errorPrefix}_`, errors);

        if (!session.authed) {
          sendError(res, {
            error: errors.common_login_no,
          });
          return;
        }

        if (session.authed && session.authedEndMS < Date.now()) {
          sendError(res, {
            error: errors.common_auth_expired,
            details: {
              config: config.common.auth,
            },
          });
          return;
        }

        new models[this.config.modelName]({ id: session.id })
          .fetch()
          .then((model) => {
            if (!model) {
              sendError(res, {
                error: modelErrors.not_exists,
              });
              return;
            }

            req[this.config.sessionPrefix] = model;
            next();
          })
          .catch(genDbError(res));
      },
      notLoggedIn(req, res, next) {
        const session = prefixProxy(this.config.sessionPrefix, req.session);

        if (session.authed) {
          sendError(res, {
            error: errors.common_login_yes,
          });
          return;
        }

        next();
      },
      name(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validateName,
          property: 'name',
          details: {
            config: config.common.name,
          },
        }]);
      },
      username(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validateUsername,
          property: 'username',
          details: {
            config: config.common.username,
          },
        }]);
      },
      password(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validatePassword,
          property: 'password',
          details: {
            config: config.common.password,
          },
        }]);
      },
      email(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validateEmail,
          property: 'email',
        }]);
      },
      phone(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validatePhone,
          property: 'phone',
        }]);
      },
    },
    locationOwner: {
      locations(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validateLocations,
          property: 'locations',
        }]) 
      } 
    }
  },
};
