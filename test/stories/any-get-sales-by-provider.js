const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get sales', await request(
    'sales/by-provider',
    {
      username: data.baseProv.username,
    },
  ));
  assert.ok(res.data.sales.length > 0, 'no actual sales')
  assert.ok(res.data.sales.length < data.config.sale.pagination.items.maxAmount, 'sales over max amount');
}
