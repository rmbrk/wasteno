const {
  Moderator,
  Receiver,
  Provider,
  Transporter,
} = require('./../../db/models');

const {
  affirm,
  affirmError,
} = require('./../helper.js');

const {
  hash,
} = require('./../../utils.js');

const common = require('./common.js');

const getVerify = Model => async ({ input, user }) => {
  const {
    username,
  } = input;


  await new Model({ username })
    .verify({ modId: user.id });

  return {}
};
const getDelete = Model => async ({ input }) => {
  const {
    username,
  } = input;

  await new Model({ username })
    .destroy({ require: false })

  return {}
}

const controllerConfig = {
  Model: Moderator,
  sessionPrefix: 'mod',
  errorPrefix: 'moderator',
  dataName: 'moderator',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,

  async create({ input, session, user }) {
    const {
      name,
      email,
      phone,
      username,
      password,
    } = input;

    const usernameExists = await Moderator.exists({ username });
    affirm(!usernameExists, 'common_username_required');

    await new Moderator({
      isOrigin: false,
      parent: user.id,
      name,
      email,
      phone,
      username,
      password,
    })
      .save()

    return {}
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
            error: errors.moderator_not_required,
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
