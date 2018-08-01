const data = require('./data.js');

module.exports = async () => {
  assertRes('verify provider', await request(
    'moderator/verify/provider',
    pluck(data.baseProv, [
      'username'
    ]),
  ));
}
