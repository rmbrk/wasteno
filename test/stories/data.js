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
});
const baseSale = genSale(baseProv);
const additionalBaseProvSales = getTimes(20, () => genSale(baseProv));
const baseProvSales = [baseSale, ...additionalBaseProvSales];

const getRandomValidSaleExpiry = () => Math.floor(Date.now() + (2 + Math.random() * 3) * 86400 * 1000);
const genSaleInstance =
  (sale, location, expiry = getRandomValidSaleExpiry()) => ({
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
});
const baseRec = genRec();

const genTrsp = () => ({
  ...genUser('transporter'),
});
const baseTrsp = genTrsp();

const genSaleSearch = () => {
  const sale = getRandomItem(baseProvSales);

  return {
    offset: 0,//Math.floor(Math.random() * 20),
    amount: Math.floor(Math.random() * config.sale.pagination.items.maxAmount),

    term: getRandomItem(sale.name.split(' ')),
    maxPrice: Math.random() * 2000,
    maxExpiry: Date.now() + Math.floor((2 + Math.random() * 4) * 86400 * 1000),
    minAmount: Math.floor(Math.random() * 10),
    categories: sale.category,
  };
}
const baseSaleSearch = genSaleSearch();
const additionalSaleSearches = getTimes(20, genSaleSearch);
const saleSearches = [baseSaleSearch, ...additionalSaleSearches];

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

  baseTrsp,

  baseSaleSearch,
  additionalSaleSearches,
  saleSearches,
};
