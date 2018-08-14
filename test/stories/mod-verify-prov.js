const data = require('./data.js');

module.exports = async () => {
  assertRes('verify provider', await request(
    'moderator/verify/provider',
    pluck(data.baseProv, [
      'username',
    ]),
  ));

  const checkRes = assertRes('check verification', await request(
    'provider/by-username',
    pluck(data.baseProv, [
      'username',
    ]),
  ));

  assert.ok(checkRes.data.provider.verifiedBy, 'not verified');
};
