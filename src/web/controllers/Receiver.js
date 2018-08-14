const {
  remapAsync,
  dissectBuyerEid,
} = require('./../../utils.js');

const {
  Receiver,
  ReceiverLocation,
  Order,
  OrderedSale,
  SaleInstance,
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

const controllerConfig = {
  model: Receiver,
  locationModel: ReceiverLocation,
  additionalUserProperties: ['eid'],
  sessionPrefix: 'rec',
  errorPrefix: 'receiver',
  dataName: 'receiver',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  async addOrder(req, res) {
    // already validated
    const {
      items,
      eid,
    } = req.body;

    if (await req.rec.hasMaxOrders()) {
      sendError(res, {
        error: errors.receiver_too_many_orders,
        details: config.receiver,
      });
    }

    const saleModels = await Sale.fetchByEids(items.map(item => item.saleEid));

    const centPrices = saleModels.map((saleModel, i) => {
      const sale = saleModel.attributes;
      // TODO figure out logic for pricing change on expiry date
      const item = items[i];
      return (+sale.priceAmount * 100) * item.amount;
    });

    const totalPrice = centPrices.reduce((total, price) => total + price) / 100;

    const locationEid = dissectBuyerEid(eid).location;

    const locationId = await req.rec.fetchLocationIdByEid(locationEid);

    if (!locationId) {
      sendError(res, {
        error: errors.location_eid_not_exists,
      });
      return;
    }

    const order = await new Order({
      priceAmount: totalPrice,
      receiverLocation: locationId,
      eid,
    })
      .save();

    await order.addItems(items.map((item, i) => {
      const {
        quantity = 1,
        maxExpiry,
      } = item;

      return {
        quantity,
        maxExpiry,
        priceAmount: centPrices[i] / 100,
      };
    }));

    ok(res);
  },
  async getOrder(req, res) {
    const {
      eid,
    } = req.body;

    const order = await new Order({ eid }).fetch();

    if (!order) {
      sendError(res, {
        error: errors.order_eid_not_exists,
      });
      return;
    }

    ok(res, { order });
  },
  async getOrders(req, res) {
    const orders = await req.rec.fetchOrders();

    ok(res, { orders });
  },

  async payOrder(req, res) {
    // TODO figure out how to actually get paid
    const {
      eid,
    } = req.body;

    const order = await new Order({ eid }).fetch();

    if (!order) {
      sendError(res, {
        error: errors.order_eid_not_exists,
      });
      return;
    }

    await order.pay();

    ok(res);
  }
};
