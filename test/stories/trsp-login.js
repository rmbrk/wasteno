const data = require('./data.js');

module.exports = async () => {
  assertRes('login', await request(
    'transporter/login',
    pluck(data.baseTrsp, [
      'username',
      'password',
    ]),
  ));
}
