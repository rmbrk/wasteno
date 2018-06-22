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

const validateName = (name, { exists }) => {
  if (!name) {
    return exists
      ? errors.common_name_missing
      : false;
  }

  if (typeof name !== 'string') {
    return error.common_name_out_of_charset;
  }

  const lengthError = check.len(name, {
    min: config.common.name.minSize,
    max: config.common.name.maxSize,
    minError: errors.common_name_length_short,
    maxError: errors.common_name_length_long,
  });
  if (lengthError) {
    return lengthError;
  }

  const charsetError = check.charset(name, {
    charset: config.common.name.charset,
    charserError: errors.common_name_out_of_charset,
  });
  if (charsetError) {
    return charsetError;
  }

  return false;
};

const validateUsername = (username) => {
  if (!username) {
    return errors.common_username_missing;
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

const validatePassword = (password) => {
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

const validateEmail = (email, { exists = true }) => {
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

const validatePhone = (phone, { exists = true }) => {
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

const validateLon = (lon) => {
  if (lon) {
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
      return errors.common_lon_invalid;
    }
  }
};
const validateLat = (lat) => {
  if (lat) {
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return errors.common_lat_invalid;
    }
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
};
