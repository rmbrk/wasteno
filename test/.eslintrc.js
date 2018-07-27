const globals = [
  'wait',
  'request',
  'setKeepCookie',
  'genString',
  'write',
  'start',
  'getStats',
  'assert',
  'assertSamples',
  'assertRes',
  'pluck',
];

module.exports = {
  "extends": "airbnb",
  globals: globals.reduce((acc, item) => ({ ...acc, [item]: true }), {}),
};
