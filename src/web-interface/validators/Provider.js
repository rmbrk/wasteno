const {
  Provider,
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

const validateDescription = (description) => {
  const {
    minLength,
    maxLength,
    charset,
  } = config.sale.description;

  if (!description) {
    return;
  }

  if (description.length < minLength) {
    return errors.sale_description_length_short;
  }

  if (description.length > maxLength) {
    return errors.sale_description_length_long;
  }

  const charsetError = check.charset(description, {
    charset: config.provider.sale.description.charset,
    charserError: errors.sale_description_out_of_charset,
  });
  if (charsetError) {
    return charsetError;
  }
};
const validateSale = (sale) => {
  const {
    name,
    description,
    inStock,
    photoUrl,
    category,
  } = sale;

  const nameError = commonValidators.validateName(name);
  if (nameError) {
    return nameError;
  }

  const descriptionError = validateDescription(description);
  if (descriptionError) {
    return descriptionError;
  }
};
const validateSales = (sales) => {
  if (!sales) {
    return errors.common_object_missing;
  }

  for (let i = 0; i < sales.length; ++i) {
    const sale = sales[i];

    const saleError = validateSale(sale);
    if (saleError) {
      return [saleError, { index: i }];
    }
  }
};

module.exports = {
  loggedIn(req, res, next) {
    const {
      provAuthed,
      provAuthedEndMS,
      provId,
    } = req.session;

    if (!provAuthed) {
      sendError(res, {
        error: errors.common_login_no,
      });
      return;
    }

    if (provAuthed && provAuthedEndMS < Date.now()) {
      sendError(res, {
        error: errors.proveiver_auth_expired,
        details: {
          config: config.proveiver.auth,
        },
      });
      return;
    }

    Provider.findById(provId, (err, prov) => {
      if (err) {
        dbError(res, err);
        return;
      }

      if (!prov) {
        sendError(res, {
          error: errors.provider_not_exists,
        });
        return;
      }

      req.prov = prov;
      next();
    });
  },
  notLoggedIn(req, res, next) {
    if (req.session.provAuthed) {
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
  salePagination(req, res, next) {
    const {
      offset,
      amount,
    } = req.body;
    
    const paginationError = commonValidators.validatePagination(offset, amount, config.sale.pagination);
    if (paginationError) {
      sendError(res, {
        error: paginationError, 
        details: config.sale.pagination,
      });
      return;
    }

    next();
  },
  sales(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: validateSales,
      property: 'sales',
    }]);
  },
};
