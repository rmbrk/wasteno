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
  genDbError,
  errors,
  config,
} = require('./../helper.js');

const common = require('./common.js');

const { validatorFns: commonValidators } = common;

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

const validateSaleEid = (saleName) => {
  if (!saleName) {
    return errors.sale_eid_missing;
  }
};

const validateSaleInstance = (saleInstance) => {
  const {
    eid,
    quantity,
    expiry,
  } = saleInstance;

  if (quantity) {
    if (typeof quantity !== 'number'
      || Math.floor(quantity) !== quantity
      || quantity < 1
      || quantity > config.saleInstance.quantity.max) {
      return errors.sale_instance_quantity_invalid;
    }
  }

  if (expiry) {
    if (typeof expiry !== 'number') {
      return errors.sale_instance_expiry_invalid;
    }
  }
};

const validateSaleInstances = (saleInstances) => {
  if (!saleInstances) {
    return errors.common_object_missing;
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
      details: {
        config: config.sale,
      },
    }]);
  },
  saleEid(req, res, next) {
    handleRequestValidation(req, res, next, [{
      fn: validateSaleEid,
      property: 'saleEid',
      details: {
        config: config.sale,
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
