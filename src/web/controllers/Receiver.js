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
  config,
  affirm,
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  Model: Receiver,
  LocationModel: ReceiverLocation,
  additionalUserProperties: ['eid'],
  errorPrefix: 'receiver',
  dataName: 'receiver',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  async addOrder({ input, user }) {
    // already validated
    const {
      items,
      eid,
    } = input;

    affirm(!await user.hasMaxOrders(), 'receiver_too_many_orders');

    const saleModels = await Sale.fetchByEids(items.map(item => item.saleEid));

    const centPrices = saleModels.map((saleModel, i) => {
      const sale = saleModel.attributes;
      // TODO figure out logic for pricing change on expiry date
      const item = items[i];
      return (+sale.priceAmount * 100) * item.amount;
    });

    const totalPrice = centPrices.reduce((total, price) => total + price) / 100;

    const locationEid = dissectBuyerEid(eid).location;

    const locationId = await user.fetchLocationIdByEid(locationEid);

    affirm(locationId, 'location_eid_not_exists');

    const order = await new Order({
      priceAmount: totalPrice,
      sourceLocation: locationId,
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

    return {};
  },
  async getOrder({ input }) {
    const {
      eid,
    } = input;

    const order = await new Order({ eid }).fetch();

    affirm(order, 'order_eid_not_exists');

    return { order };
  },
  async getOrders({ user }) {
    const orders = await user.fetchOrders();

    return { orders };
  },

  async payOrder({ input, session }) {
    // TODO figure out how to actually get paid
    const {
      eid,
    } = input;

    const order = await new Order({ eid }).fetch();

    affirm(order, 'order_eid_not_exists');

    await order.pay();

    return {};
  }
};
