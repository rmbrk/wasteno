const {
  getUnique,
  extractor,
  extract,
  dissectEid,
  findAllIndices,
} = require('./../../utils.js');

const {
  Provider,
  ProviderLocation,
  Sale,
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

const common = require('./common.js');

const controllerConfig = {
  model: Provider,
  additionalUserProperties: ['eid'],
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

    const saleEids = extract(sales, 'eid');
    const dissectedSaleEids = saleEids.map(dissectEid);

    const badProviderEids = dissectedSaleEids.filter(eid =>
      eid.provider !== req.prov.get('eid'));

    if (badProviderEids.length > 0) {
      sendError(res, {
        error: errors.provider_eid_not_matching,
        details: {
          indices: badProviderEids.map(eid => saleEids.indexOf(eid)),
        },
      });
      return;
    }

    req.prov
      .fetchAlreadyExistingSaleEids(saleEids)
      .then((dbSaleEids) => {
        if (dbSaleEids.length > 0) {
          sendError(res, {
            error: errors.sale_eid_exists,
            details: {
              indices: dbSaleEids.map(eid => saleEids.indexOf(eid)),
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
  addSaleInstances(req, res) {
    const {
      saleInstances,
    } = req.body;

    const saleInstanceEids = extract(saleInstances, 'eid');

    req.prov
      .fetchAlreadyExistingSaleInstanceEids(saleInstanceEids)
      .then(async (dbInstanceEids) => {
        if (dbInstanceEids.length > 0) {
          sendError(res, {
            error: errors.sale_instance_eid_exists,
            details: {
              indices: dbInstanceEids.map(eid =>
                saleInstanceEids.indexOf(eid)),
            },
          });
          return;
        }

        const saleEids = saleInstanceEids
          .map(dissectEid)
          .map(extractor('sale'));

        const inexistentParentEids =
          await req.prov.fetchInexistentSaleEids(saleEids);

        if (inexistentParentEids.length > 0) {
          sendError(res, {
            error: errors.sale_instance_parent_eid_not_exists,
            details: {
              indices: inexistentParentEids.map(eid =>
                saleEids.indexOf(eid)),
            },
          });
          return;
        }

        const locationIds = await req.prov
          .fetchLocationIdsByNames(extract(saleInstances, 'locationName'));

        const emptyLocationIdsIndices = findAllIndices(
          locationIds,
          id => id === false,
        );
        if (emptyLocationIdsIndices.length > 0) {
          sendError(res, {
            error: errors.sale_instance_location_name_invalid,
            details: {
              indices: emptyLocationIdsIndices,
            },
          });
          return;
        }

        const saleInstancesWithLocation = saleInstances.map((instance, i) => {
          return {
            ...instance,
            location: locationIds[i]
          };
        });

        return req.prov
          .addSaleInstances({ saleInstances: saleInstancesWithLocation })
          .then(genOk(res));
      })
      .catch(genDbError(res));
  },
};
