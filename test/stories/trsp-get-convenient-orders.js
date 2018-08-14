const data = require('./data.js');

module.exports = async () => {
  assertRes('get convenient orders', await request(
    'transporter/order/by-convenience',
    pluck(data.baseConvenienceOrderSearch, [
      'maxDist',
      'isLast',
    ])
  ));
}
