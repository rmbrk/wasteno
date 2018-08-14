const { types } = require('./common.js');

module.exports = {
  schema: {
    isMain: [['boolean']],
    ...types.group.contact,
    ...types.group.location,

    eid: types.eid,
  },
  references: {
    parent: 'Receiver',
  },
  associations: {
    hasMany: {
      orders: 'Order.receiverLocation',
    },
    belongsTo: {
      parent: 'Receiver',
    },
  },
};
