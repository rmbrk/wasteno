const {
  Moderator,
} = require('./../../db/models');

const common = require('./common.js');

const {
  sendError,
  dbError,
  genDbError,
  errors,
  config,
} = require('./../helper.js');

const validationConfig = {
  Model: Moderator,
  errorPrefix: 'moderator',
  sessionPrefix: 'mod',
}
module.exports = {
  config: validationConfig,
  ...common.group.user,
};
