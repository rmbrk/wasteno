const data = require('./data.js');

module.exports = async () => {
  const res = assertRes('get locations', await request(
    'provider/locations',
    pluck(data.baseProv, ['username']),
  ));

  const dbLocations = res.data.locations;
  const localLocations = data.baseProvLocations;
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
  });
};
