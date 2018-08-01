const data = require('./data.js');

module.exports = async () => {
  assertRes('create', await request(
    'transporter/create',
    pluck(data.baseTrsp, [
      'username',
      'password',
      'phone',
      'email',
    ]),
  ));
}
