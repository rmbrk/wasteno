module.exports = {
  models: new Proxy({}, {
    get(obj, prop) {
      return require('.')[prop];
    },
  }),
  createRelation(a, b) {
    return ({
      schema: {},
      reference: {
        [a]: a,
        [b]: b,
      },
    });
  },
};

