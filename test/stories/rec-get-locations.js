
const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get locations', await request(
    'receiver/locations',
    pluck(data.baseRec, ['username']),
  ));

  const dbLocations = res.data.locations;
  const localLocations = data.baseRecLocations;
  assert.equal(
    dbLocations.length,
    localLocations.length,
    'mismatching lengths'
  );
  localLocations.forEach((location) => {
    assert.ok(
      dbLocations.find(dbLocation => dbLocation.name === location.name),
      'missing name'
    );
    assert.ok(location.eid.length > 0, 'missing eid');
  });
};
