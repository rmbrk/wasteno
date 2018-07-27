const {
  Transporter,
} = require('./../../db/models');

const {
  ok
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  model: Transporter,
  sessionPrefix: 'trsp',
  errorPrefix: 'transporter',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,
}
