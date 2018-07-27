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

const models = require('./../../db/models/');

const validateString = (str, opts = {}) => {
  const {
    exists = false,
    config: strConfig,
    missingErr,
    charsetErr,
    shortErr,
    longErr,
  } = opts;

  if (!str) {
    return exists
      ? missingErr
      : false;
  }

  if (typeof str !== 'string') {
    return charsetErr;
  }

  const lengthError = check.len(str, {
    min: strConfig.minSize,
    max: strConfig.maxSize,
    minError: shortErr,
    maxError: longErr,
  });
  if (lengthError) {
    return lengthError;
  }

  const charsetError = check.charset(str, {
    charset: strConfig.charset,
    charsetError: charsetErr,
  });
  if (charsetError) {
    return charsetError;
  }

  return false;
};
const validateName = (name, opts = {}) => {
  const {
    exists = false,
    nameConfig = config.common.name,
  } = opts;

  return validateString(name, {
    exists,
    config: nameConfig,
    missingErr: errors.common_name_missing,
    charsetErr: errors.common_name_out_of_charset,
    shortErr: errors.common_name_length_short,
    longError: errors.common_name_length_long,
  });
};

const validateUsername = (username, opts = {}) => {
  const {
    exists = true,
  } = opts;

  return validateString(username, {
    exists,
    config: config.common.username,
    missingErr: errors.common_username_missing,
    charsetErr: errors.common_username_out_of_charset,
    shortErr: errors.common_username_length_short,
    longError: errors.common_username_length_long,
  });
};

const validatePassword = (password, opts = {}) => {
  const {
    exists = true,
  } = opts;

  return validateString(password, {
    exists,
    config: config.common.password,
    missingErr: errors.common_password_missing,
    charsetErr: errors.common_password_out_of_charset,
    shortErr: errors.common_password_length_short,
    longError: errors.common_password_length_long,
  });
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

  if (email.length > config.common.email.maxSize) {
    return errors.common_email_length_long;
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

  if (phone.length > config.common.phone.maxSize) {
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

const validateAddress = (address, opts = {}) => {
  const {
    exists = true,
  } = opts;

  return validateString(address, {
    config: config.location.address,
    missingErr: errors.common_address_missing,
    charsetErr: errors.common_address_out_of_charset,
    shortErr: errors.common_address_length_short,
    longErr: errors.common_address_length_long,
  });
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

const validateEid = (eid, type, opts = {}) => {
  const {
    exists = true,
  } = opts;

  if (!eid) {
    return exists
      ? errors.common_eid_missing
      : false;
  }

  const provEid = config.provider.eid;
  const saleEid = config.sale.eid;
  const instEid = config.saleInstance.eid;

  let err = false;

  const localLenValidate = size => check.len(eid, {
    min: size,
    max: size,
    minError: errors.common_eid_length_short,
    maxError: errors.common_eid_length_long,
  });
  switch (type) {
    case 'instance':
      err = localLenValidate(provEid.size + saleEid.size + instEid.size);
      if (err) {
        return err;
      }
      break;
    case 'sale':
      err = localLenValidate(provEid.size + saleEid.size);
      if (err) {
        return err;
      }
      break;
    case 'provider':
      err = localLenValidate(provEid.size);
      if (err) {
        return err;
      }
      break;
    default:
      console.error(`unrecognized sale type ${type}`);
      return true;
  }

  const localValidate = (offset, conf) =>
    validateString(eid.substr(offset, conf.size), {
      config: {
        minSize: conf.size,
        maxSize: conf.size,
        charset: conf.charset,
      },
      exists,
      missingErr: errors.common_eid_portion_missing,
      charsetErr: errors.common_eid_portion_out_of_charset,
      shortErr: errors.common_eid_portion_length_short,
      longErr: errors.common_eid_portion_length_long,
    });
  switch (type) {
    // intentional cascade
    case 'instance':
      err = localValidate(provEid.size + saleEid.size, instEid);
      if (err) {
        return err;
      }
    case 'sale':
      err = localValidate(provEid.size, saleEid);
      if (err) {
        return err;
      }
    case 'provider':
      err = localValidate(0, provEid);
      if (err) {
        return err;
      }
      break;
  }
};

module.exports = {
  validatorFns: {
    validateString,
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
    validateEid,
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

        new models[this.config.modelName]({ id: session.mid })
          .fetch()
          .then((model) => {
            if (!model) {
              sendError(res, {
                error: modelErrors.not_exists,
              });
              return;
            }

            req[this.config.sessionPrefix] = model;
            req.session.save(next);
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
          details: {
            config: config.common.email,
          },
        }]);
      },
      phone(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validatePhone,
          property: 'phone',
          details: {
            config: config.common.phone,
          },
        }]);
      },
    },
    locationOwner: {
      locations(req, res, next) {
        handleRequestValidation(req, res, next, [{
          fn: validateLocations,
          property: 'locations',
          details: {
            config: config.location,
          },
        }]);
      },
    },
  },
};
