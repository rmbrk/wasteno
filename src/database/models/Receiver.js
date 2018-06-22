const {
  ref, idRef, model, common,
} = require('./helper.js');
const bcrypt = require('bcrypt');

module.exports = {
  schema: {
    name: String,
    verified: Boolean,
    verifiedBy: ref('Moderator'),
    locations: [ref('ReceiverLocation')],
    username: String,
    hash: String,
    email: String,
    phone: String,
    orders: [ref('Order')],
    transporters: [ref('Transporter')],
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
          lat
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
        }
      });

      model('ReceiverLocation').create(usableLocations, (err, locs) => {
        this.locations.push(...locs.map(loc => loc._id));
        this.save(cb);
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
