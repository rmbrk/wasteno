const data = require('./data.js');

module.exports = async () => {
  assertRes('get available orders', await request(
    'transporter/order/by-convenience',
    {
      offset: 0,
      amount: 20,
    }
  ));
}
