const { types, methods } = require('./common.js');

const modelConfig = {
  models: {
    Model: 'Transporter',
  },
};
module.exports = {
  config: modelConfig,
  schema: {
    ...types.group.contact,
    ...types.group.login,
    ...types.group.location,
    active: 'boolean',
  },
  references: {
    verifiedBy: 'Moderator',
  },
  associations: {
    belongsTo: {
      verifier: 'Moderator via verifiedBy',
    },
    hasMany: {
      orderedSales: 'OrderedSale.transporter',
    },
  },
  methods: {
    ...methods.group.user,
    initialize() {
      this.constructor.__super__.initialize.apply(this, arguments);
      this.userInit();
    },
  },
};
