const {
  Moderator,
  Receiver,
  Provider,
  Transporter,
} = require('./../../db/models');

const {
  errors,
  config,
  sendError,
  ok,
  genOk,
  dbError,
  genDbError,
} = require('./../helper.js');

const {
  hash,
} = require('./../../utils.js');

const common = require('./common.js');

const getVerify = model => (req, res) => {
  const {
    username,
  } = req.body;

  const {
    modMid,
  } = req.session;

  new model({ username })
    .verify({ modMid })
    .then(genOk(res))
    .catch(genDbError(res));
};
const getDelete = model => (req, res) => {
  const {
    username,
  } = req.body;

  new model({ username })
    .destroy({ require: false })
    .then(genOk(res))
    .catch(genDbError(res));
}

const controllerConfig = {
  model: Moderator,
  sessionPrefix: 'mod',
  errorPrefix: 'moderator',
  dataName: 'moderator',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,

  create(req, res) {
    const {
      name,
      email,
      phone,
      username,
      password,
    } = req.body;

    const parent = req.session.modId;

    new Moderator({ username })
      .fetch()
      .then((mod) => {
        if (mod) {
          sendError(res, {
            error: errors.common_username_exists,
          });
          return;
        }

        return new Moderator({
          isOrigin: false,
          parent,
          name,
          email,
          phone,
          username,
          password,
        })
          .save()
          .then(genOk(res));
      })
      .catch(genDbError(res));
  },
  delete(req, res) {
    if (req.mod.get('isOrigin')) {
      sendError(res, {
        error: errors.moderator_is_origin,
      });
      return;
    }

    req.session.modAuthed = false;

    req.mod.destroy()
      .then(genOk(res))
      .catch(genDbError(res));
  },
  deleteModerator(req, res) {
    const {
      username,
    } = req.body;

    new Moderator({ username })
      .fetch((mod) => {
        if (!mod) {
          sendError(res, {
            error: errors.moderator_not_exists,
          });
          return;
        }

        if (mod.isOrigin) {
          sendError(res, {
            error: errors.moderator_is_origin,
          });
          return;
        }

        return mod.destroy()
          .then(genOk(res));
      })
      .catch(genDbError(res));
  },

  verifyReceiver: getVerify(Receiver),
  deleteReceiver: getDelete(Receiver),

  verifyProvider: getVerify(Provider),
  deleteProvider: getDelete(Provider),

  verifyTransporter: getVerify(Transporter),
  deleteTransporter: getDelete(Transporter),
};
