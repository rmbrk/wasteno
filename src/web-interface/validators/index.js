const fs = require('fs');

const { isUpperCase, pascalToCamel } = require('./../../utils.js');

const validators = fs.readdirSync('./web-interface/validators')
  .filter(validator => isUpperCase(validator[0]) && !validator.startsWith('.'));

module.exports = validators.reduce((out, controllerName) => ({
  ...out,
  [pascalToCamel(controllerName.split('.')[0])]: require(`./${controllerName}`),
}), {});
