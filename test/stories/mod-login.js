const data = require('./data.js');

module.exports = async () => {
  assertRes('login', await request(
    'moderator/login',
    pluck(data.baseMod, [
      'username',
      'password',
    ]),
  ));
}
