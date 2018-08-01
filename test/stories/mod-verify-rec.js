const data = require('./data.js');

module.exports = async () => {
  assertRes('verify receiver', await request(
    'moderator/verify/receiver',
    pluck(data.baseRec, [
      'username'
    ]),
  ));
}
