const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('search', await request(
    'sales/search',
    pluck(data.baseSaleSearch, [
      'offset',
      'amount',
      'term',
      'maxPrice',
      'maxExpiry',
      'minAmount',
      'categories',
    ]),
  ));

  assert.ok(res.data.sales.length > 0, 'sales are empty')
}
