const data = require('./data.js');

module.exports = async () => {
  assertRes('send coords', await request(
    'transporter/send-coords',
    pluck(data.baseTrsp, [
      'lon',
      'lat',
    ]),
  ));
}
