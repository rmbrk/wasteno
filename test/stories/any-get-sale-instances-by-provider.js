const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get sale instances by provider', await request(
    'sales/instances',
    pluck(data.baseSaleInstanceLookup, [
      'username',
      'offset',
      'amount',
      'saleEid',
    ]),
  ));

  assert.ok(res.data.saleInstances.length > 0, 'empty sale instances');
};
