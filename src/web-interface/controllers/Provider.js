const {
  Provider,
  Sale,
} = require('./../../database/models');

const ok = require('./ok.js');
const {
  errors,
  config,
  sendError,
  dbError,
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

    Provider.findOne({ username }, (err, prov) => {
      if (prov) {
        sendError(res, {
          error: errors.common_username_exists,
        });
        return;
      }

      Provider.generate({
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

    if (now < req.session.provLoginBanEndMS) {
      return sendError(res, {
        error: errors.common_login_before_ban_end,
        details: config.common.login,
      });
    }

    Provider.findByPasswordAndUsername({ password, username }, (prov) => {
      if (!prov) {
        if (!req.session.provLoginTries) {
          req.session.provLoginTries = 0;
        }

        if (!req.session.provLoginLastTry || now - req.session.provLoginLastTry > config.common.login.intervalMS) {
          req.session.provLoginLastTry = Date.now();
          req.session.provLoginTries = 0;
        }

        req.session.provLoginTries++;

        if (req.session.provLoginTries >= config.common.login.tries) {
          req.session.provLoginBanEndMS = now + config.common.login.intervalMS;
        }

        return sendError(res, {
          error: errors.common_login_invalid,
        });
      }

      req.session.provAuthed = true;
      req.session.provId = prov._id;
      req.session.provLoginTries = 0;
      req.session.provAuthedEndMS = now + config.common.auth.intervalMS;

      ok(res);
    });
  },
  logout(req, res) {
    req.session.provAuthed = false;

    ok(res);
  },
  getLocations(req, res) {
    const {
      username,
    } = req.body;

    Provider.findOne({ username })
      .populate('locations')
      .exec((err, prov) => {
        if (!prov) {
          sendError(res, {
            error: errors.provider_not_exists,
          });
          return;
        }

        ok(res, {
          locations: prov.locations,
        });
      });
  },
  addLocations(req, res) {
    const {
      locations,
    } = req.body;

    const locNames = locations.map(loc => loc.name);
    Provider.findOne({ 'locations.name': { $in: locNames } }, 'locations', (err, prov) => {
      if (err) {
        dbError(res, err);
        return;
      }

      if (prov) {
        sendError(res, {
          error: errors.common_location_name_exists,
          details: {
            index: locNames.indexOf(prov.name),
          },
        });
      }
    });

    req.prov
      .addLocations({ locations }, (err) => {
        if (err) {
          dbError(res, err);
          return;
        }

        ok(res);
      });
  },
  delete(req, res) {
    Provider.findByIdAndDelete(req.prov._id, (err) => {
      if (err) {
        dbError(res, err);
        return;
      }

      req.session.provAuthed = false;

      ok(res);
    });
  },
  getSales(req, res) {
    const {
      username,
      amount,
      offset,
    } = req.body;

    Provider.findOne({ username })
      .populate({
        path: 'sales',
        options: {
          limit: amount,
          skip: offset,
        },
      })
      .exec((err, prov) => {
        if (!prov) {
          sendError(res, {
            error: errors.provider_not_exists,
          });
          return;
        }

        ok(res, {
          sales: prov.sales,
        });
      });
  },
  addSales(req, res) {
    const {
      sales,
    } = req.body;

    const {
      provId,
    } = req.session;

    const saleNames = sales.map(sale => sale.name);

    Sale.findOne({ name: { $in: saleNames }, parentId: provId }, 'name', (err, sale) => {
      if (err) {
        dbError(res, err);
        return;
      }

      if (sale) {
        sendError(res, {
          error: errors.sale_name_exists,
          details: {
            index: saleNames.indexOf(sale.name),
          },
        });
        return;
      }

      req.prov
        .addSales({ sales }, (err) => {
          if (err) {
            dbError(res, err);
            return;
          }

          ok(res);
        });
    });
  },
};
