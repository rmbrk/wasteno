const {
  isInt,
  isInRange,
} = require('./../../utils.js');

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

const validateSaleDescription = (description, opts = {}) => {
  const {
    exists = false,
  } = opts;

  return commonValidators.validateString(description, {
    exists,
    config: config.sale.description,
    missingErr: errors.sale_description_missing,
    shortErr: errors.sale_description_length_short,
    longErr: errors.sale_description_length_long,
    charsetErr: errors.sale_description_out_of_charset,
  });
};
const validateSale = (sale) => {
  const {
    name,
    description,
    eid,
    inStock = false,
    photoUrl,
    category,
  } = sale;

  const nameError = commonValidators.validateName(name, { exists: true });
  if (nameError) {
    return nameError;
  }

  const descriptionError = validateSaleDescription(description, { exists: true });
  if (descriptionError) {
    return descriptionError;
  }

  const eidError = commonValidators.validateEid(eid, 'sale');
  if (eidError) {
    return eidError;
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

const validateSaleInstance = (saleInstance) => {
  const {
    eid,
    quantity,
    expiry,
    locationIndex,
  } = saleInstance;

  if (quantity) {
    if (!isInt(quantity)
        || !isInRange(quantity, 1, config.saleInstance.quantity.max)) {
      return errors.sale_instance_quantity_invalid;
    }
  }

  if (!expiry) {
    return errors.sale_instance_expiry_missing;
  }
  if (!isInt(expiry)) {
    return errors.sale_instance_expiry_invalid;
  }
  if (expiry < Date.now()) {
    return errors.ale_instance_expiry_passed;
  }

  if (!saleInstance.hasOwnProperty('locationIndex')) {
    return errors.sale_instance_location_index_missing;
  }

  if (!isInt(locationIndex)) {
    return errors.sale_instance_location_index_invalid;
  }

  return commonValidators.validateEid(eid, 'instance');
};

const validateSaleInstances = (saleInstances) => {
  if (!saleInstances) {
    return errors.common_object_missing;
  }

  if (!Array.isArray(saleInstances)) {
    return errors.common_object_not_array;
  }

  for (let i = 0; i < saleInstances.length; ++i) {
    const saleInstance = saleInstances[i];

    const saleInstanceError = validateSaleInstance(saleInstance);
    if (saleInstanceError) {
      return [saleInstanceError, { index: i }];
    }
  }
};

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
  salePagination(req, res, next) {
    const {
      offset,
      amount,
    } = req.body;

    const paginationError =
      commonValidators.validatePagination(offset, amount, config.sale.pagination);
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
      details: {
        config: {
          ...config.sale,
          eid: config.sale.eid,
        },
      },
    }]);
  },
  saleEid(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: saleEid => commonValidators.validateEid(saleEid, 'sale'),
      property: 'saleEid',
      details: {
        config: config.sale.eid,
      },
    }]);
  },
  saleInstances(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: validateSaleInstances,
      property: 'saleInstances',
      details: {
        config: config.saleInstance,
      },
    }]);
  },
};
