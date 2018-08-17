const {
  getUnique,
  extractor,
  extract,
  dissectSellerEid,
  findAllIndices,
} = require('./../../utils.js');

const {
  Provider,
  ProviderLocation,
  Sale,
  Order,
} = require('./../../db/models');

const {
  config,
  affirm,
  affirmMany,
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  Model: Provider,
  LocationModel: ProviderLocation,
  additionalUserProperties: ['eid'],
  sessionPrefix: 'prov',
  errorPrefix: 'provider',
  dataName: 'provider',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,
  ...common.group.locationOwner,

  async getSales({ input }) {
    const {
      username,
      amount = config.sale.pagination.items.maxAmount,
      offset = 0,
    } = input;

    const prov = await new Provider({ username })
      .fetch({
        withRelated: {
          sales: q => q.limit(amount).offset(offset),
        },
      })

    affirm(prov, 'provider_not_exists');

    return {
      sales: extract(prov.relations.sales.models, 'attributes'),
    }
  },
  async addSales({ input, user }) {
    const {
       sales,
    } = input;

    const saleEids = extract(sales, 'eid');

    const alreadyExistingSaleEids =
      await user.fetchAlreadyExistingSaleEids(saleEids);

    affirm(alreadyExistingSaleEids.length === 0, {
      msg: 'sale_eid_exists',
      details: {
        indices: alreadyExistingSaleEids.map(eid => saleEids.indexOf(eid)),
      }
    });

    await user.addSales({ sales });

    return {};
  },
  async getSaleInstances({ input, session }) {
    const {
      offset = 0,
      amount,
      saleEid,
    } = input;

    const sale = await new Sale({ eid: saleEid })
      .fetch({
        withRelated: {
          instances: q => q.limit(amount).offset(offset),
        },
      });

    affirm(sale, 'sale_eid_not_exists');

    return {
      saleInstances: sale.related('instances').models,
    }
  },
  async addSaleInstances({ input, user }) {
    const {
      saleInstances,
    } = input;

    const eids = extract(saleInstances, 'eid');

    const alreadyExistingEids =
      await user.fetchAlreadyExistingSaleInstanceEids(eids);

    affirm(alreadyExistingEids.length === 0, {
      msg: 'sale_instance_eid_exists',
      details: {
        indices: alreadyExistingEids.map(eid =>
          eids)
      }
    })

    const saleEids = eids
      .map(dissectSellerEid)
      .map(extractor('sale'));

    const inexistentParentEids =
      await user.fetchInexistentSaleEids(saleEids);

    affirm(inexistentParentEids.length === 0, {
      msg: 'sale_instance_parent_eid_not_required',
      details: {
        indices: inexistentParentEids.map(eid =>
          saleEids.indexOf(eid)),
      }
    })

    const locationIds = await user
      .fetchLocationIdsByNames(extract(saleInstances, 'locationName'));

    const emptyLocationIdsIndices = findAllIndices(
      locationIds,
      id => id === false,
    );

    affirm(emptyLocationIdsIndices.length === 0, {
      msg: 'sale_instance_location_name_not_exists',
      details: {
        indices: emptyLocationIdsIndices,
      }
    });

    const saleInstancesWithLocation = saleInstances.map((instance, i) => {
      return {
        ...instance,
        location: locationIds[i]
      };
    });

    await user
      .addSaleInstances({ saleInstances: saleInstancesWithLocation })

    return {};
  },
};
