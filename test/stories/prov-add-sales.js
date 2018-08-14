const data = require('./data.js');

module.exports = async () => {
  assertRes('add sales', await request(
    'sales/add',
    {
      sales: mapPluck(data.baseProvSales, [
        'name',
        'description',
        'eid',
        'category',
        'priceAmount',
        'priceCurrency',
      ]),
    }
  ))
}
