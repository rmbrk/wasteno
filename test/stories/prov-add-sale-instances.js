const data = require('./data.js');

module.exports = async () => {
  assertRes('add sale instances', await request(
    'sales/instances/add',
    {
      saleInstances: mapPluck(data.baseProvSaleInstances, [
        'eid',
        'expiry',
        'locationName',
      ]),
    }
  ));
}
