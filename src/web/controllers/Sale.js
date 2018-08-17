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
  async search({ input }) {
    const {
      offset = 0,
      amount = config.sale.pagination.maxAmount,
      term,
      eidStart,
      maxPrice,
      currency,
      maxExpiry,
      minAmount = 1,
      categories = config.sale.categories,
    } = input;

    const sales = await new Sale()
    //.query(q => q.select('* as sale'))
      .query(q => eidStart
        // shouldn't be a problem, as long as eidStart is validated
        ? q.where('Sale.eid', 'like', `${eidStart}%`)
        : q)
      .query((q) => {
        if (currency) {
          q = q
            .where('Sale.priceCurrency', '=', currency);
          if (maxPrice) {
            q = q
              .andWhere('Sale.priceAmount', '<=', maxPrice);
          }
        }
        return q;
      })
      .query((q) => {
        if (categories && categories.length > 0) {
          q = q.where('Sale.category', 'in', categories);
        }
        return q;
      })
      .query(q => q
        .orderByRaw('1 * ("Sale"."name" <-> ?) + .5 * ("Sale"."description" <-> ?)', [
          term,
          term,
        ]))
      .query(q => q
        .join('Provider', 'parent', '=', 'Provider.id')
      )
      .query(q => q.whereNotNull('Provider.verifiedBy'))
      .query(q => q.offset(offset).limit(amount))
      .fetchAll();

    return { sales };
  },
};
