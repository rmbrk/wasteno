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
  extractData(fetchResult) {
    if (Array.isArray(fetchResult)) {
      return fetchResult.models.map(({ attributes }) => attributes);
    }
    
    return fetchResult
      ? fetchResult.attributes
      : null;
  }
};

