const { types } = require('./common.js');

const { models } = require('./helper.js');

module.exports = {
  schema: {
    ...types.group.price,
    eid: types.eid,

    // receiver
    paid: types.date,

    completed: 'boolean',
  },
  references: {
    sourceLocation: 'ReceiverLocation',
  },
  associations: {
    hasMany: {
      orderedSales: 'OrderedSale.order',
    },
    belongsTo: {
      transporter: 'Transporter',
      receiverLocation: 'ReceiverLocation',
    },
    belongsToMany: {
      providerLocations: 'ProviderLocation',
    },
  },
  methods: {
    addItems(items) {
      return new models.OrderedSale.Collection(items.map(item => ({
        ...item,
        order: this.id,
      })))
        .invokeThen('save');
    },
    pay() {
      this.set('paid', Date.now());
      return this.save();
    }
  },
};
