const { 
  Moderator,
  Receiver,
  Provider,
  Transporter,
} = require('./../../database/models');

const ok = require('./ok.js');

const {
  errors,
  config,
  sendError,
} = require('./../helper.js');

module.exports = {
  create(req, res) {
    const {
      name,
      email,
      phone,
      username,
      password,
    } = req.body;

    const parentId = req.session.modId;

    Moderator.findOne({ username }, (err, mod) => {
      if (mod) {
        sendError(res, {
          error: errors.common_username_exists,
        });
        return;
      }

      Moderator.generate({
        isOrigin: false,
        parentId,
        name,
        email,
        phone,
        username,
        password,
      });

      ok(res);
    });
  },
  login(req, res) {
    const {
      username,
      password,
    } = req.body;

    const now = Date.now();

    if (now < req.session.modLoginBanEndMS) {
      return sendError(res, {
        error: errors.common_login_before_ban_end,
        details: config.common.login,
      });
    }

    Moderator.findByPasswordAndUsername({ password, username }, (mod) => {
      if (!mod) {
        if (!req.session.modLoginTries) {
          req.session.modLoginTries = 0;
        }

        if (!req.session.modLoginLastTry || now - req.session.modLoginLastTry > config.common.login.intervalMS) {
          req.session.modLoginLastTry = Date.now();
          req.session.modLoginTries = 0;
        }

        req.session.modLoginTries++;

        if (req.session.modLoginTries >= config.common.login.tries) {
          req.session.modLoginBanEndMS = now + config.common.login.intervalMS;
        }

        return sendError(res, {
          error: errors.common_login_invalid,
        });
      }

      req.session.modAuthed = true;
      req.session.modId = mod._id;
      req.session.modLoginTries = 0;
      req.session.modAuthedEndMS = now + config.common.auth.intervalMS;

      ok(res);
    });
  },
  logout(req, res) {
    req.session.modAuthed = false;

    ok(res);
  },
  verifyReceiver(req, res) {
    const {
      username,
    } = req.body;

    Receiver.find({ username }, (err, receiver) => {
      if (!receiver) {
        sendError({
          error: errors.receiver_not_exists,
        });
        return;
      }

      ok(res);

      receiver.verify({ modId: req.session.modId });
    })
  }
};
