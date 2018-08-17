const {
  isInt,
  isInRange,
  extract,
  dissectSellerEid,
} = require('./../../utils.js');

const {
  config,
  affirm,
  affirmMany,
} = require('./../helper.js');

const common = require('./common.js');

const {
  validateString,
  validateName,
  validateSellerEid,
  validateSearch,
} = common;

const validateSaleDescription = (description, opts = {}) => {
  const {
    required = true,
  } = opts;

  return validateString(description, {
    required,
    config: config.sale.description,
    errors: {
      missing: 'sale_description_missing',
      short: 'sale_description_length_short',
      long: 'sale_description_length_long',
      charset: 'sale_description_out_of_charset',
    },
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

  validateName(name);
  validateSaleDescription(description);
  validateSellerEid(eid, 'sale');
};
const validateSales = (sales, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!sales) {
    affirm(!required, 'object_missing');
    return;
  }


  affirmMany(validateSale, sales);
};

const validateSaleInstance = (saleInstance) => {
  const {
    eid,
    quantity,
    expiry,
    locationName,
  } = saleInstance;


  if (quantity) {
    affirm(isInt(quantity)
        && isInRange(quantity, 1, config.saleInstance.quantity.max),
      'sale_instance_quantity_invalid');
  }

  affirm(expiry, 'sale_instance_expiry_missing');
  affirm(isInt(expiry), 'sale_instance_expiry_invalid');
  affirm(expiry > Date.now(), 'sale_instance_expiry_passed');

  validateString(locationName, {
    required: true,
    config: config.location.name,
    errors: {
      missing: 'sale_instance_location_name_missing',
      short: 'sale_instance_location_name_length_short',
      long: 'sale_instance_location_name_length_long',
      charset: 'sale_instance_location_name_out_of_charset',
    }
  });

  validateSellerEid(eid, 'instance');
};

const validateSaleInstances = (saleInstances, opts = {}) => {
  const {
    required = true,
  } = opts;

  if (!saleInstances) {
    affirm(!required, 'object_missing');
    return;
  }

  affirm(Array.isArray(saleInstances), 'object_not_array');

  affirmMany(validateSaleInstance, saleInstances);
};

const validationConfig = {
  modelName: 'Sale',
};
module.exports = {
  config: validationConfig,

  salePagination: common.generators.pagination(config.sale.pagination),
  instancePagination: common.generators.pagination(config.saleInstance.pagination),
  sales({ input }) {
    validateSales(input.sales);
  },
  eidMatchesProvider({ input, user }) {
    const saleEids = extract(input.sales, 'eid');
    const dissectedSaleEids = saleEids.map(dissectSellerEid);

    affirmMany(
      (eid) => {
        affirm(
          eid.provider === user.attributes.eid,
          'provider_eid_not_matching',
        );
      },
      dissectedSaleEids);
  },
  saleEid({ input }) {
    validateSellerEid(input.saleEid, 'sale');
  },
  instances({ input }) {
    validateSaleInstances(input.saleInstances);
  },
  search({ input }) {
    validateSearch(input, {
      paginationConfig: config.sale.pagination,
      termConfig: {
        required: true,
        config: config.sale.search.term,
        errors: {
          charset: 'sale_search_term_out_of_charset',
          missing: 'sale_search_term_missing',
          long: 'sale_search_term_length_long',
          short: 'sale_search_term_length_short',
        },
      },
    });

    // TODO semantic validation
  },
};
