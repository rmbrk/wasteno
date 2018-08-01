const data = require('./data.js');

module.exports = async () => {
  assertRes('create location', await request('provider/locations/add', {
    locations: mapPluck(data.baseProvLocations, [
      'name',
      'address',
      'isMain',
    ]),
  }));
}
