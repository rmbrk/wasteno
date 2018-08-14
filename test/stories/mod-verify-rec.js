const data = require('./data.js');

module.exports = async () => {
  assertRes('verify receiver', await request(
    'moderator/verify/receiver',
    pluck(data.baseRec, [
      'username',
    ]),
  ));

  const checkRes = assertRes('check verification', await request(
    'receiver/by-username',
    pluck(data.baseRec, [
      'username',
    ]),
  ));

  assert.ok(checkRes.data.receiver.verifiedBy, 'not verified');
};
