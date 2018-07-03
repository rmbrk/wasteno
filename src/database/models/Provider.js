const {
  ref, idRef, model, common,
} = require('./helper.js');
const bcrypt = require('bcrypt');

module.exports = {
  schema: {
    name: String,
    verifiedBy: ref('Moderator'),
    email: String,
    phone: String,
    username: String,
    hash: String,
    locations: [ref('ProviderLocation')],
    sales: [ref('Sale')],
    hasPackers: Boolean,
  },
  methods: {
    verify(opts, cb = () => {}) {
      const {
        modId,
      } = opts;

      this.verified = true;
      this.verifiedBy = idRef(modId);

      this.save(cb);
    },
    addLocations(opts, cb = () => {}) {
      const {
        locations,
      } = opts;

      const usableLocations = locations.map((location) => {
        const {
          isMain = false,
          phone = this.phone,
          email = this.email,
          name,
          address,
          lon,
          lat,
        } = location;

        return {
          isMain,
          phone,
          email,
          coordinates: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          name,
          address,
        };
      });

      model('ProviderLocation').create(usableLocations, (err, locs) => {
        this.locations.push(...locs.map(loc => loc._id));
        this.save(cb);
      });
    },
    addSales(opts, cb = () => {}) {
      const {
        sales,
      } = opts;

      // for some reason the code breaks otherwise
      if (sales.length === 0) {
        cb();
        return;
      }

      const usableSales = sales.map((sale) => {
        const {
          name,
          description,
          inStock,
          photoUrl,
          category,
        } = sale;

        return {
          name,
          description,
          inStock,
          photoUrl,
          category,
          parentId: idRef(this._id),
        };
      });

      model('Sale').create(usableSales, (err, sales) => {
        this.sales.push(...sales.map(sale => idRef(sale._id)));
        this.save();

        cb();
      });
    },
  },
  statics: {
    async generate(opts, cb = () => {}) {
      const {
        username,
        password,
        email,
        phone,
        name = username,
      } = opts;

      const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));

      this.create({
        username,
        hash,
        email,
        phone,
        name,
        verified: false,
      }, cb);
    },
    findByPasswordAndUsername: common.statics.findByPasswordAndUsername,
  },
};
