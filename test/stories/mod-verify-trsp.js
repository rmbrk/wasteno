const data = require('./data.js');

module.exports = async () => {
  assertRes('verify transporter', await request(
    'moderator/verify/transporter',
    pluck(data.baseTrsp, [
      'username'
    ]),
  ));
}
