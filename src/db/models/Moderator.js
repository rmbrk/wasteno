const bcrypt = require('bcrypt');
const { types, methods } = require('./common.js');

const methodConfig = {
  modelName: 'Moderator',
};
module.exports = {
  schema: {
    isOrigin: [['boolean']],
    ...types.group.contact,
    ...types.group.login,
  },
  references: {
    parent: 'Moderator',
  },
  associations: {
    hasMany: {
      children: 'Moderator.parent',
      verifiedProviders: 'Provider.verifiedBy',
      verifiedReceivers: 'Receiver.verifiedBy',
      verifiedTransporters: 'Transporter.verifiedBy',
    },
    belongsTo: {
      parent: 'Moderator.parent',
    },
  },
  methods: {
    config: methodConfig,
    ...methods.group.user,
    initialize() {
      this.constructor.__super__.initialize.apply(this, arguments);
      this.userInit(); 
    }
  },
};
