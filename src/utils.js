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

module.exports = {
  isArray,
  flattenOne,
  flatten,

  isObject,
  flattenPropertiesOne,
  flattenProperties,

  isUpperCase,
  pascalToCamel,
};
