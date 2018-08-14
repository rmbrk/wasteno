const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get order', await request(
    'receiver/order',
    pluck(data.baseOrder, [
      'eid'
    ]),
  ));

  assert.ok(res.data.order.paid !== null, 'order not paid');
}
