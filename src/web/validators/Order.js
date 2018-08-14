const {
  isInt,
  isInRange,
  dissectBuyerEid,
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

const validationConfig = {
  modelName: 'Order',
};
module.exports = {
  config: validationConfig,

  orderPagination: common.generators.pagination(config.order.pagination),
  
  items(req, res, next) {
    // TODO (db validation should happen here)
    next();
  },

  eid(req, res, next) {
    // TODO
    next();
  },

  recOwnsEid(req, res, next) {
    const {
      eid,
    } = req.body;

    if (dissectBuyerEid(eid).receiver !== req.rec.attributes.eid) {
      sendError(res, {
        error: errors.order_eid_not_matching_receiver,
      });
      return;
    }

    next();
  }
}
