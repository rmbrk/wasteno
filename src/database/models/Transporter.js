const { types } = require('./common.js');

module.exports = {
  schema: {
    ...types.group.contact,
    ...types.group.login,
    ...types.group.location,
    active: 'boolean',
    isRegular: 'boolean',
    isPackerOnly: 'boolean',
    isPacker: 'boolean',
    isReceiverSpecific: 'boolean',
    isReceiverLocationSpecific: 'boolean',
  },
  references: {
    verifiedBy: 'Moderator',
  },
  associations: {
    belongsTo: {
      verifier: 'Moderator via verifiedBy', 
    },
    hasMany: {
      orders: 'Order.transporter', 
    }
  }
};
