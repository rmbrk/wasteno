const data = require('./data.js');

module.exports = async () => {
  assertRes('create', await request(
    'moderator/create',
    pluck(data.baseMod, [
      'username',
      'password',
      'email',
      'phone',
    ]),
  ));
}
