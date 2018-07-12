const {
  Moderator,
} = require('./../../database/models');

const common = require('./common.js');

const {
  sendError,
  dbError,
  genDbError,
  errors,
  config,
} = require('./../helper.js');

const validationConfig = {
  modelName: 'Moderator',
  errorPrefix: 'moderator',
  sessionPrefix: 'mod',
}
module.exports = {
  config: validationConfig,
  ...common.group.user,
};
