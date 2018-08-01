const {} = require('./../../utils.js');

const {
  Sale,
} = require('./../../db/models');

const {
  errors,
  config,
  sendError,
  ok,
  genOk,
  dbError,
  genDbError,
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {};

module.exports = {
  config: controllerConfig,
  search(req, res) {
    const {
      offset = 0,
      amount = config.sale.pagination.maxAmount,
      term,
      maxPrice,
      currency,
      maxExpiry,
      minAmount = 1,
      categories = config.sale.categories,
    } = req.body;

    new Sale()
      .query((q) => {
        if (currency) {
          q = q
            .where('priceCurrency', '=', currency);
          if (maxPrice) {
            q = q
              .andWhere('priceAmount', '<=', maxPrice);
          }
        }
        return q;
      })
      .query((q) => {
        if (categories && categories.length > 0) {
          q = q.where('category', 'in', categories);
        }
        return q;
      })
      .query(q => q
        .orderByRaw('eid <-> ?', [term])
        .orderByRaw('name <-> ?', [term])
        .orderByRaw('description <-> ?', [term]))
      .query(q => q.offset(offset).limit(amount))
      .fetchAll()
      .then((sales) => {
        ok(res, { sales });
      })
      .catch(genDbError(res));
  },
};
