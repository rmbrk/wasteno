const data = require('./data.js');

module.exports = async () => {
  assertRes('create', await request(
    'receiver/create',
    pluck(data.baseRec, [
      'username',
      'password',
      'email',
      'phone',
    ]),
  ));
}
