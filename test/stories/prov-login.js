const data = require('./data.js');

module.exports = async () => {
  assertRes('login', await request(
    'provider/login',
    pluck(data.baseProv, [
      'username',
      'password',
    ]),
  ));
}
