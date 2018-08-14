const data = require('./data.js');

module.exports = async () => {
  assertRes('place order', await request(
    'receiver/order/add',
    data.baseOrder,
  ));
}
