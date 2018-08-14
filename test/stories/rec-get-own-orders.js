const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get own order', await request('receiver/orders'));
  assert.ok(res.data.orders.length > 0, 'orders are empty');
}
