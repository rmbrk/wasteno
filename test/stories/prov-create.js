const data = require('./data.js');

module.exports = async () => {
  assertRes('create', await request(
    'provider/create',
    pluck(data.baseProv, [
      'username',
      'password',
      'email',
      'phone',
      'eid',
    ])
  ))
}
