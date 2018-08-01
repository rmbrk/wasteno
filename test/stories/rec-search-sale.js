const data = require('./data.js');

module.exports = async () => {
  console.error(data.baseSaleSearch)
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

  console.error(res.data)
}
