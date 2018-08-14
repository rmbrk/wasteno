const {
  isInt,
  isInRange,
} = require('./../../utils.js');

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

  const eidError = commonValidators.validateSellerEid(eid, 'sale');
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
    locationName,
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

  const locationNameErr = commonValidators.validateString(locationName, {
    exists: true,
    config: config.location.name,
    missingErr: errors.sale_instance_location_name_missing,
    shortErr: errors.sale_instance_location_name_length_short,
    longErr: errors.sale_instance_location_name_length_long,
    charsetErr: errors.sale_instance_location_name_out_of_charset,
  });
  if (locationNameErr) {
    return locationNameErr; 
  }

  return commonValidators.validateSellerEid(eid, 'instance');
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
  modelName: 'Sale',
};
module.exports = {
  config: validationConfig,

  salePagination: common.generators.pagination(config.sale.pagination),
  instancePagination: common.generators.pagination(config.saleInstance.pagination),
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
      fn: saleEid => commonValidators.validateSellerEid(saleEid, 'sale'),
      property: 'saleEid',
      details: {
        config: config.sale.eid,
      },
    }]);
  },
  instances(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: validateSaleInstances,
      property: 'saleInstances',
      details: {
        config: config.saleInstance,
      },
    }]);
  },
  search(req, res, next) {
    const baseError = commonValidators.validateSearch(req.body, {
      paginationConfig: config.sale.pagination,
      termConfig: {
        exists: true,
        config: config.sale.search.term,
        charsetErr: errors.sale_search_term_out_of_charset,
        missingErr: errors.sale_search_term_missing,
        longErr: errors.sale_search_term_length_long,
        shortErr: errors.sale_search_term_length_short,
      }
    });
    if (baseError) {
      sendError(res, {
        error: baseError,
        details: {
          config: config.sale,
        },
      });
    }
    // TODO
    next();
  }
}
