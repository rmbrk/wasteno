const config = require('./../../src/config.js');

const originMod = JSON.parse(process.env.ORIGIN_MOD_DATA);

const genUser = type => ({
  username: genString(`${type}-%%%%%%%`),
  password: genString('password-#######'),
  email: genString('%%%%%%@%%%%%.com'),
  phone: genString('421######'),
});

const genMod = () => genUser('moderator');
const baseMod = genMod();

const genProv = () => ({
  ...genUser('provider'),
  eid: genString('&&&'),
});
const baseProv = genProv();

const genLocation = (isMain = false) => ({
  name: genString('%%%%%%% %%% %%'),
  address: genString('### %%%%%%% %%%% %%%'),
  isMain,
});
const genProvLocation = (prov, main) => genLocation(main);
const baseProvLocation = genProvLocation(baseProv, true);
const additionalBaseProvLocations = getTimes(20, () => genProvLocation(baseProv));
const baseProvLocations = [baseProvLocation, ...additionalBaseProvLocations];

const genSale = prov => ({
  name: genString('%%%%%%%%% %%%%%% %%'),
  description: genString('%%%%%%% % %%% %%%%%% %%% %%%% %%%%%% %%%%'),
  eid: prov.eid + genString('%%%%%%%%'),
  category: getRandomItem(config.sale.categories),
  priceAmount: Math.random() * 20,
  priceCurrency: 'eur',
});
const baseSale = genSale(baseProv);
const additionalBaseProvSales = getTimes(20, () => genSale(baseProv));
const baseProvSales = [baseSale, ...additionalBaseProvSales];

const genValidSaleExpiry = () => Math.floor(Date.now() + (2 + Math.random() * 3) * 86400 * 1000);
const genSaleInstance =
  (sale, location, expiry = genValidSaleExpiry()) => ({
    eid: sale.eid + genString('######'),
    expiry,
    locationName: location.name,
  });
const baseSaleInstance = genSaleInstance(baseSale, baseProvLocation);
const additionalSaleInstances = getTimes(20, () => genSaleInstance(
  getRandomItem(additionalBaseProvSales),
  getRandomItem(additionalBaseProvLocations),
));
const baseProvSaleInstances = [baseSaleInstance, ...additionalSaleInstances];

const genRec = () => ({
  ...genUser('receiver'),
  eid: genString('&&&'),
});
const baseRec = genRec();

const genRecLocation = (rec, isMain) => ({
  ...genLocation(isMain),
  eid: rec.eid + genString('%%%%%%%%'),
});
const baseRecLocation = genRecLocation(baseRec, true);
const additionalBaseRecLocations = getTimes(20, () => genRecLocation(baseRec));
const baseRecLocations = [baseRecLocation, ...additionalBaseRecLocations];

const genTrsp = () => ({
  ...genUser('transporter'),
  lon: 17.1,
  lat: 48.1,
});
const baseTrsp = genTrsp();

const genMaxExpiry = () =>
  genValidSaleExpiry() + (2 * 86400 * 1000);

const genSaleSearch = () => {
  const sale = getRandomItem(baseProvSales);

  return {
    offset: 0, // Math.floor(Math.random() * 20),
    amount: getRandomItem(config.sale.pagination.items.maxAmount, 1),

    term: sale.name.split(' ')[1],
    maxPrice: Math.random() * 2000,
    maxExpiry: genMaxExpiry(),
    minAmount: getRandomItem(10),
    categories: sale.category,
  };
};
const baseSaleSearch = genSaleSearch();
const additionalSaleSearches = getTimes(20, genSaleSearch);
const saleSearches = [baseSaleSearch, ...additionalSaleSearches];

const genSaleInstanceLookup = (prov = baseProv, sale = baseSale) => ({
  username: baseProv.username,

  offset: 0,
  amount: getRandomItem(config.saleInstance.pagination.items.maxAmount, 1),

  saleEid: sale.eid,
});
const saleInstanceLookups = getTimes(20, () => genSaleInstanceLookup());
const [baseSaleInstanceLookup, ...additionalSaleInstanceLookups] =
  saleInstanceLookups;

let orderIncrement = 0;
const genOrder = (rec = baseRec, loc = getRandomItem(baseRecLocations)) => ({
  items: getTimes(5, () => getRandomItem(baseProvSales))
    .map(sale => ({
      saleEid: sale.eid,
      maxExpiry: genMaxExpiry(),
      amount: getRandomItem(3),
    })),
  eid: loc.eid +
      (++orderIncrement)
        .toString().padStart(config.order.eid.size, '0'),
});
const allOrders = getTimes(20, () => genOrder());
const [baseOrder, ...additionalOrders] = allOrders;

const genConvenienceOrderSearch = () => ({
  maxStartDist: 300 + getRandomItem(200),
  maxEndDist: 300 + getRandomItem(200),
  maxTravelDist: 300 + getRandomItem(200),
  minGain: getRandomItem(20),
});
const allConvenienceOrderSearches =
  getTimes(20, () => genConvenienceOrderSearch());
const [baseConvenienceOrderSearch, ...additionalConvenienceOrderSearches] =
  allConvenienceOrderSearches;

module.exports = {
  config,

  originMod,
  baseMod,

  baseProv,

  baseProvLocation,
  additionalBaseProvLocations,
  baseProvLocations,

  baseSale,
  additionalBaseProvSales,
  baseProvSales,

  baseSaleInstance,
  additionalSaleInstances,
  baseProvSaleInstances,

  baseRec,

  baseRecLocation,
  additionalBaseRecLocations,
  baseRecLocations,

  baseTrsp,

  baseSaleSearch,
  additionalSaleSearches,
  saleSearches,

  baseSaleInstanceLookup,
  additionalSaleInstanceLookups,
  saleInstanceLookups,

  baseOrder,
  additionalOrders,
  allOrders,

  baseConvenienceOrderSearch,
  additionalConvenienceOrderSearches,
  allConvenienceOrderSearches,
};
