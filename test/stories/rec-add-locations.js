const data = require('./data.js');

module.exports = async () => {
  assertRes('create location', await request('receiver/locations/add', {
    locations: mapPluck(data.baseRecLocations, [
      'name',
      'address',
      'isMain',
      'eid',
    ]),
  }));
}
