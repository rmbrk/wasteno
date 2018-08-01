const data = require('./data.js');

module.exports = async () => {
  assertRes('login', await request(
    'receiver/login',
    pluck(data.baseRec, [
      'username',
      'password',
    ])
  ));
};
