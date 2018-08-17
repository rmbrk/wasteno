const {
  isInt,
  isInRange,
  dissectBuyerEid,
} = require('./../../utils.js');

const {
  config,
  affirm,
} = require('./../helper.js');

const common = require('./common.js');

const validationConfig = {
  modelName: 'Order',
};
module.exports = {
  config: validationConfig,

  orderPagination: common.generators.pagination(config.order.pagination),
  
  items({ input }) {
    // TODO (db validation should happen here)
  },

  eid({ input }) {
    // TODO
  },

  recOwnsEid({ input, user }) {
    affirm(dissectBuyerEid(input.eid).receiver === user.attributes.eid,
      'order_eid_not_matching_receiver');
  }
}
