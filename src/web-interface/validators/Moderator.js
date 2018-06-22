const {
  sendError,
  errors,
  config,
} = require('./../helper.js');

module.exports = {
  loggedIn(req, res, next) {
    if (!req.session.modAuthed) {
      sendError(res, {
        error: errors.common_login_no,
      });
      return;
    }

    if (req.session.modAuthed && req.session.modAuthedEndMS < Date.now()) {
      sendError(res, {
        error: errors.common_auth_expired,
        details: {
          config: config.common.auth,
        },
      });
      return;
    }
    next();
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
