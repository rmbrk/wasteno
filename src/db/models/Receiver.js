const bcrypt = require('bcrypt');
const { types, methods } = require('./common.js');

const { models, extractData } = require('./helper.js');

const config = require('./../../config.js');

const modelConfig = {
  models: {
    Model: 'Receiver',
    LocationModel: 'ReceiverLocation',
  },
  additionalLocationFields: ['eid'],
};
module.exports = {
  config: modelConfig,
  schema: {
    ...types.group.login,
    ...types.group.contact,

    eid: types.eid,
  },
  references: {
    verifiedBy: 'Moderator',
  },
  associations: {
    hasMany: {
      locations: 'ReceiverLocation.parent',
      orders: 'Order.receiver',
    },
    belongsTo: {
      verifier: 'Moderator via verifiedBy',
    },
  },
  methods: {
    ...methods.group.locationOwner,
    ...methods.group.user,
    initialize() {
      this.constructor.__super__.initialize.apply(this, arguments);
      this.userInit();
    },
    addOrders(orders) {
      return new models.OrderedSale.Collection(orders.map((order) => {
        return {
          ...order,
          provider: this.id,
        }
      }))
        .invokeThen('save')
    },
    getOrders() {
      return new models.Order({ provider: this.id });
    },
    hasMaxOrders() {
      return this.getOrders().count() > config.receiver.maxOrders;
    },
    fetchOrders() {
      return this.getOrders().fetchAll();
    }
  },
};
