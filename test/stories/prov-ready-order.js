const data = require('./data.js');

module.exports = async () => {
  assertRes('ready order', await request(
    'provider/order/ready',
    pluck(data.baseOrder, [
      'eid',
    ]),
  ));
}
