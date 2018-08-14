const data = require('./data.js');

module.exports = async () => {
  assertRes('pay order', await request(
    'receiver/order/pay',
    pluck(data.baseOrder, [
      'eid'
    ]),
  ));
}
