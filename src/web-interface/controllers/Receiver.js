const {
  Receiver,
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

    Receiver.findOne({ username }, (err, rec) => {
      if (rec) {
        sendError(res, {
          error: errors.common_username_exists,
        });
        return;
      }

      Receiver.generate({
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

    if (now < req.session.recLoginBanEndMS) {
      return sendError(res, {
        error: errors.common_login_before_ban_end,
        details: config.common.login,
      });
    }

    Receiver.findByPasswordAndUsername({ password, username }, (rec) => {
      if (!rec) {
        if (!req.session.recLoginTries) {
          req.session.recLoginTries = 0;
        }

        if (!req.session.recLoginLastTry || now - req.session.recLoginLastTry > config.common.login.intervalMS) {
          req.session.recLoginLastTry = Date.now();
          req.session.recLoginTries = 0;
        }

        req.session.recLoginTries++;

        if (req.session.recLoginTries >= config.common.login.tries) {
          req.session.recLoginBanEndMS = now + config.common.login.intervalMS;
        }

        return sendError(res, {
          error: errors.common_login_invalid,
        });
      }

      req.session.recAuthed = true;
      req.session.recId = rec._id;
      req.session.recLoginTries = 0;
      req.session.recAuthedEndMS = now + config.common.auth.intervalMS;

      ok(res);
    });
  },
  logout(req, res) {
    req.session.recAuthed = false;

    ok(res);
  },
  getLocations(req, res) {
    const {
      recId,
    } = req.session;

    Receiver.findById(recId)
      .populate('locations')
      .exec((err, rec) => {
      if (!rec) {
        sendError(res, {
          error: errors.common_login_unexpected,
        });
        return;
      }

      ok(res, {
        locations: rec.locations,
      });
    });
  },
  addLocations(req, res) {
    const {
      locations,
    } = req.body;

    const {
      recId,
    } = req.session;

    Receiver.findById(recId, (err, rec) => {
      if (!rec) {
        sendError(res, {
          error: errors.common_login_unexpected,
        });
        return;
      }

      rec.addLocations({ locations }, (err) => {
        if (err) {
          console.error(err);
        }
        ok(res);
      });
    });
  },
};
