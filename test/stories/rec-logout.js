const data = require('./data.js');

module.exports = async () => {
  assertRes('logout', await request('receiver/logout'));
};
