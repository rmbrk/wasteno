const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get convenient orders', await request(
    'transporter/order/by-convenience',
    pluck(data.baseConvenienceOrderSearch, [
      'maxStartDist',
      'maxEndDist',
      'maxTravelDist',
      'minGain',
    ])
  ));
  assert.ok(res.data.orders, 'order not exists');
  assert.ok(res.data.orders.length > 0, 'orders are empty');
}
