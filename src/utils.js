const config = require('./config');

const flattenOne = array =>
  [].concat(...array);

const flatten = array =>
  (array.find(Array.isArray)
    ? flatten(flattenOne(array))
    : array);

const isUpperCase = str => str.toUpperCase() === str;

const pascalToCamel = (str) => {
  const [firstLetter, ...rest] = str.split('');
  return firstLetter.toLowerCase() + rest.join('');
};

const uniquify = (array) => {
  for (let i = 0; i < array.length; ++i) {
    if (array.indexOf(array[i]) !== i) {
      array.splice(i, 1);
      --i;
    }
  }
  return array;
};

const getUnique = array => uniquify([...array]);

const getDifference = (arr1, arr2) =>
  arr2.filter(item => !arr1.includes(item));

const extractor = propPath => obj => propPath.split('.')
  .reduce((acc, prop) => acc[prop], obj);
const extract = (arr, propPath) => arr.map(extractor(propPath));
const mapExtract = propPath => arr => extract(arr, propPath);

const findAllIndices = (arr, fn) => arr
  .map((val, i) => [val, i])
  .filter(([val, i]) => fn(val, i))
  .map(([val, i]) => i);

const groupByProperties = (arr, ...properties) => {
  const grouper = properties.reduce((acc, property) => ({
    ...acc,
    [property]: [],
  }), {});

  arr.forEach((obj) => {
    properties.forEach((property) => {
      grouper[property].push(obj[property]);
    });
  });

  return grouper;
};
const genGroupByProperties = (...properties) => arr => groupByProperties(arr, ...properties);

const pluck = (obj, attributes, defaultValue = undefined) =>
  attributes.reduce((acc, attribute) =>
    ({
      ...acc,
      [attribute]: (obj.hasOwnProperty(attribute)
        ? obj[attribute]
        : defaultValue),
    }), {});

const getPrefixProxyAccessor = (prefix, attribute, isUpperCase) => {
  const [first, ...rest] = attribute.split('');
  const firstChar = isUpperCase
    ? first.toUpperCase()
    : first;
  return `${prefix}${firstChar}${rest.join('')}`;
};
// possible leak
const prefixProxy = (prefix, base, opts = {}) => {
  const {
    isUpperCase = true,
  } = opts;

  return new Proxy(base, {
    get(obj, attribute) {
      const property = getPrefixProxyAccessor(prefix, attribute, isUpperCase);
      return obj[property];
    },
    set(obj, attribute, value) {
      const property = getPrefixProxyAccessor(prefix, attribute, isUpperCase);
      obj[property] = value;
      return true;
    },
  });
};

const dissectEid = (eid) => {
  const provSize = config.provider.eid.size;
  const saleSize = config.sale.eid.size;
  const instSize = config.saleInstance.eid.size;

  const fullSaleSize = provSize + saleSize;
  const fullInstSize = fullSaleSize + instSize;

  const containsSale = eid.length >= fullSaleSize;
  const containsInst = eid.length >= fullInstSize;

  return {
    provider: eid.substr(0, provSize),
    sale: containsSale && eid.substr(0, fullSaleSize),
    partialSale: containsSale && eid.substr(provSize, saleSize),
    instance: containsInst && eid.substr(0, fullInstSize),
    partialInstance: containsInst && eid.substr(fullSaleSize, instSize),
  };
};

const isInt = x => Math.floor(x) === x;
const isInRange = (x, min, max) => !(x < min || x > max);

module.exports = {
  flattenOne,
  flatten,

  getUnique,
  uniquify,
  getDifference,
  extractor,
  extract,
  mapExtract,
  findAllIndices,
  groupByProperties,
  genGroupByProperties,

  pluck,

  isUpperCase,
  pascalToCamel,

  prefixProxy,
  dissectEid,

  isInt,
  isInRange,
};
