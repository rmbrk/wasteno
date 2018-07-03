const {
  Moderator,
} = require('./../../database/models');

const {
  sendError,
  dbError,
  errors,
  config,
} = require('./../helper.js');

module.exports = {
  loggedIn(req, res, next) {
    const {
      modAuthed,
      modAuthedEndMS,
      modId,
    } = req.session;

    if (!modAuthed) {
      sendError(res, {
        error: errors.common_login_no,
      });
      return;
    }

    if (modAuthed && modAuthedEndMS < Date.now()) {
      sendError(res, {
        error: errors.common_auth_expired,
        details: {
          config: config.common.auth,
        },
      });
      return;
    }

    Moderator.findById(modId, (err, mod) => {
      if (err) {
        dbError(res, err);
        return;
      }

      if (!mod) {
        sendError(res, {
          error: errors.moderator_not_exists,
        });
        return;
      }

      req.mod = mod;
      next();
    });
  },
  notLoggedIn(req, res, next) {
    if (req.session.modAuthed) {
      sendError(res, {
        error: errors.common_login_yes,
      });
      return;
    }

    next();
  },
};
