const data = require('./data.js');

module.exports = async () => {
  assertRes('verify transporter', await request(
    'moderator/verify/transporter',
    pluck(data.baseTrsp, [
      'username'
    ]),
  ));

  const checkRes = assertRes('check verification', await request(
    'transporter/by-username',
    pluck(data.baseTrsp, [
      'username',
    ]),
  ));

  assert.ok(checkRes.data.transporter.verifiedBy, 'not verified');
}
