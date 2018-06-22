const fs = require('fs');

const { isUpperCase, pascalToCamel } = require('./../../utils.js');

const controllers = fs.readdirSync('./web-interface/controllers')
  .filter(controller => isUpperCase(controller[0]) && !controller.startsWith('.'));

module.exports = controllers.reduce((out, controllerName) => ({
  ...out,
  [pascalToCamel(controllerName.split('.')[0])]: require(`./${controllerName}`),
}), {});
