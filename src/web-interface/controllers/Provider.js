const {
  Provider,
  ProviderLocation,
  Sale,
} = require('./../../database/models');

const {
  errors,
  config,
  sendError,
  ok,
  genOk,
  dbError,
  genDbError,
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  model: Provider,
  sessionPrefix: 'prov',
  errorPrefix: 'provider',
  locationModel: ProviderLocation,
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  getSales(req, res) {
    const {
      username,
      amount,
      offset,
    } = req.body;

    new Provider({ username })
      .fetch({
        withRelated: {
          sales: q => q.limit(amount).offset(offset),
        },
      })
      .then((prov) => {
        if (!prov) {
          sendError(res, {
            error: errors.provider_not_exists,
          });
          return;
        }

        ok(res, {
          sales: prov.sales,
        });
      })
      .catch(genDbError(res));
  },
  addSales(req, res) {
    const {
      sales,
    } = req.body;

    const {
      provId,
    } = req.session;

    const saleEids = sales.map(sale => sale.eid);
    new Sale({ parent: provId })
      .where('eid', 'in', saleEids)
      .then((sale) => {
        if (sale) {
          sendError(res, {
            error: errors.sale_eid_exists,
            details: {
              index: saleEids.indexOf(sale.get('eid')),
            },
          });
          return;
        }

        return req.prov
          .addSales({ sales })
          .then(genOk(res));
      })
      .catch(genDbError(res));
  },
  getSaleInstances(req, res) {
    const {
      offset,
      amount,
      username,
      eid,
    } = req.body;

    new Sale({ 'parent.username': username, eid })
      .fetch({
        withRelated: {
          instances: q => q.limit(amount).offset(offset),
        },
      })
      .then((sale) => {
        if (!sale) {
          sendError(res, {
            error: errors.sale_eid_not_exists,
          });
          return;
        }

        ok(res, {
          saleInstances: sale.related('instances').models,
        });
      });
  },
  addSaleInstances(req, res) {}
};
