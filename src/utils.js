const isArray = val => val instanceof Array;

const flattenOne = array =>
  [].concat(...array);

const flatten = array =>
  (array.find(isArray)
    ? flatten(flattenOne(array))
    : array);

const isObject = val => val instanceof Object && !isArray(val);

const flattenPropertiesOne = (object) => {
  const newObj = {};

  Object.entries(object)
    .forEach(([key, value]) =>
      (isObject(value)
        ? Object.entries(value)
          .forEach(([subKey, subValue]) =>
            newObj[`${key}.${subKey}`] = subValue)
        : newObj[key] = value));

  return newObj;
};

const flattenProperties = object =>
  (Object.values(object).find(isObject)
    ? flattenProperties(flattenPropertiesOne(object))
    : object);

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

const getPrefixProxyAccessor = (prefix, attribute, isUppercase) => {
  const [first, ...rest] = attribute.split('');
  const firstChar = isUppercase
    ? first.toUppercase()
    : first;
  return `${prefix}${firstChar}${rest.join('')}`;
};
// possible leak
const prefixProxy = (prefix, base, opts = {}) => {
  const {
    isUppercase = true,
  } = opts;
  new Proxy(base, {
    get(obj, attribute) {
      return obj[getPrefixProxyAccessor(prefix, attribute, isUppercase)];
    },
    set(obj, attribute, value) {
      return obj[getPrefixProxyAccessor(prefix, attribute, isUppercase)] = value;
    },
  });
};

module.exports = {
  isArray,
  flattenOne,
  flatten,

  getUnique,
  uniquify,

  isObject,
  flattenPropertiesOne,
  flattenProperties,

  isUpperCase,
  pascalToCamel,

  prefixProxy,
};
