const bcrypt = require('bcrypt');
const { types, methods } = require('./common.js');

const methodConfig = {
  modelName: 'Receiver',
  locationCollection: 'ReceiverLocations',
  locationModel: 'ReceiverLocation',
};
module.exports = {
  schema: {
    ...types.group.login,
    ...types.group.contact,
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
    config: methodConfig,
    ...methods.group.locationOwner,
    ...methods.group.user,
    initialize() {
      this.constructor.__super__.initialize.apply(this, arguments);
      this.inituser();
    },
  },
};
