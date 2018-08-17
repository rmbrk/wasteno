const validator = require('validator');

const {
  affirm,
  affirmInternal,
  affirmMany,
  config,
} = require('./../helper.js');

const {
  prefixProxy,
  isInt,
  isInRange,
} = require('./../../utils.js');

const models = require('./../../db/models/');

const validateLen = (str, opts = {}) => {
  const {
    min,
    max,
    errors,
  } = opts;

  affirm(str.length >= min, errors.small);
  affirm(str.length <= max, errors.large);
};
const validateCharset = (str, opts = {}) => {
  const {
    charset,
    errors,
  } = opts;

  str.split('')
    .forEach(char =>
      affirm(charset.includes(char), errors.charset));
};
const validateString = (str, opts = {}) => {
  const {
    required = false,
    config: strConfig,
    errors,
  } = opts;

  if (!str) {
    affirm(!required, errors.missing);
    return;
  }

  affirm(typeof str === 'string', errors.charset);

  validateLen(str, {
    min: strConfig.minSize,
    max: strConfig.maxSize,
    errors,
  });

  validateCharset(str, {
    charset: strConfig.charset,
    errors,
  });
};
const validateName = (name, opts = {}) => {
  const {
    required = false,
    nameConfig = config.common.name,
  } = opts;

  validateString(name, {
    required,
    config: nameConfig,
    errors: {
      missing: 'name_missing',
      charset: 'name_out_of_charset',
      short: 'name_length_short',
      long: 'name_length_long',
    },
  });
};

const validateUsername = (username, opts = {}) => {
  const {
    required = true,
  } = opts;

  validateString(username, {
    required,
    config: config.common.username,
    errors: {
      missing: 'username_missing',
      charset: 'username_out_of_charset',
      short: 'username_length_short',
      long: 'username_length_long',
    },
  });
};

const validatePassword = (password, opts = {}) => {
  const {
    required = true,
  } = opts;

  validateString(password, {
    required,
    config: config.common.password,
    errors: {
      missing: 'password_missing',
      charset: 'password_out_of_charset',
      short: 'password_length_short',
      long: 'password_length_long',
    },
  });
};

const validateEmail = (email, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!email) {
    return required
      ? errors.email_missing
      : false;
  }

  if (typeof email !== 'string') {
    return errors.email_invalid;
  }

  if (!validator.isEmail(email)) {
    return errors.email_invalid;
  }

  if (email.length > config.common.email.maxSize) {
    return errors.email_length_long;
  }
};

const validatePhone = (phone, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!phone) {
    return required
      ? errors.phone_missing
      : false;
  }

  if (typeof phone !== 'string') {
    return errors.phone_invalid;
  }

  if (!validator.isMobilePhone(phone, 'any')) {
    return errors.phone_invalid;
  }

  if (phone.length > config.common.phone.maxSize) {
    return errors.phone_invalid;
  }
};

const validateLon = (lon, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!lon) {
    affirm(!required, 'lon_missing');
    return;
  }

  affirm(
    typeof lon === 'number' && isInRange(lon, -180, 180),
    'lon_invalid',
  );
};
const validateLat = (lat, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!lat) {
    affirm(!required, 'lat_missing');
    return;
  }

  affirm(
    typeof lat === 'number' && isInRange(lat, -90, 90),
    'lat_invalid',
  );
};

const validateAddress = (address, opts = {}) => {
  const {
    required = true,
  } = opts;

  validateString(address, {
    config: config.location.address,
    errors: {
      missing: 'address_missing',
      charset: 'address_out_of_charset',
      short: 'address_length_short',
      long: 'address_length_long',
    },
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

  validateAddress(address);

  validateName(name, {
    required: true,
    config: config.location.name,
  });

  validateLon(lon, { required: false });
  validateLat(lat, { required: false });

  validateEmail(email, { required: false });
  validatePhone(phone, { required: false });
};

const validateLocations = (locations, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!locations) {
    affirm(!required, 'object_missing');
    return;
  }

  locations.reduce((isAnyMain, location, i) => {
    if (location.isMain) {
      affirm(!isAnyMain, {
        error: 'location_multiple_main',
        details: { index: i },
      });

      return true;
    }

    return isAnyMain;
  }, false);

  affirmMany(validateLocation, locations);
};
const validatePagination = (offset = 0, amount, paginationConfig) => {
  const {
    items: {
      maxAmount,
    },
  } = paginationConfig;

  affirm(typeof offset === 'number' && isInt(offset), 'offset_invalid');

  if (amount === undefined) {
    return;
  }

  affirm(
    typeof amount === 'number'
      && isInt(amount)
      && amount < maxAmount,
    'amount_invalid',
  );
};

const validateEid = (eid, type, opts = {}) => {
  const {
    required = true,
    types,
    confs,
  } = opts;

  if (!eid) {
    affirm(!required, 'eid_missing');
    return;
  }

  const eids = confs.map(({ eid }) => eid);
  const sizes = eids.map(({ size }) => size);

  const typeIndex = types.indexOf(type);

  affirmInternal(typeIndex > -1, `unrecognized type ${type} among ${types}`);

  // sum all sizes up to (typeIndex) and including (+ 1) index
  const size = sizes
    .slice(0, typeIndex + 1)
    .reduce((a, b) => a + b);

  validateLen(eid, {
    min: size,
    max: size,
    errors: {
      min: 'eid_length_short',
      max: 'eid_length_long',
    },
  });

  const localValidate = (offset, conf) => {
    validateString(eid.substr(offset, conf.size), {
      config: {
        minSize: conf.size,
        maxSize: conf.size,
        charset: conf.charset,
      },
      required,
      errors: {
        missing: 'eid_portion_missing',
        charset: 'eid_portion_out_of_charset',
        short: 'eid_portion_length_short',
        long: 'eid_portion_length_long',
      },
    });
  };
  switch (type) {
    // intentional cascade
    case types[2]:
      localValidate(sizes[0] + sizes[1], eids[2]);
    case types[1]:
      localValidate(sizes[0], eids[1]);
    case types[0]:
      localValidate(0, eids[0]);
      break;
  }
};
const validateBuyerEid = (eid, type, opts = {}) => {
  validateEid(eid, type, {
    confs: [
      config.receiver,
      config.receiver.location,
      config.order,
    ],
    types: [
      'receiver',
      'location',
      'order',
    ],
    ...opts,
  });
};
const validateSellerEid = (eid, type, opts = {}) => {
  validateEid(eid, type, {
    confs: [
      config.provider,
      config.sale,
      config.saleInstance,
    ],
    types: [
      'provider',
      'sale',
      'instance',
    ],
    ...opts,
  });
};

const validateSearch = (search, opts = {}) => {
  const {
    offset,
    amount,
    term,
  } = search;

  validatePagination(offset, amount, opts.paginationConfig);
  validateString(term, opts.termConfig);
};

module.exports = {
  validateLen,
  validateCharset,
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
  validateBuyerEid,
  validateSellerEid,

  validateSearch,

  generators: {
    pagination: paginationConfig => function ({ input }) {
      const {
        offset,
        amount,
      } = input;

      validatePagination(offset, amount, paginationConfig);
    },
  },
  group: {
    user: {
      async loggedIn({ session, self }) {
        affirm(session.authed, 'login_no');

        const now = Date.now();
        affirm(now < session.authedEndMS, 'auth_expired');

        const user = await new this.Model({ id: session.user.id })
          .fetch();

        affirm(user, this.error('not_required'));

        self.user = user;
      },
      notLoggedIn({ session }) {
        affirm(!session.authed, 'login_yes');
      },
      verified({ session, user }) {
        affirm(session.authed, 'login_no');

        affirm(user.isVerified(), 'not_verified');
      },
      name({ input }) {
        validateName(input.name);
      },
      username({ input }) {
        validateUsername(input.username);
      },
      password({ input }) {
        validatePassword(input.password);
      },
      email({ input }) {
        validateEmail(input.email);
      },
      phone({ input }) {
        validatePhone(input.phone);
      },
    },
    locationOwner: {
      locations({ input }) {
        validateLocations(input.locations);
      },
    },
  },
};
