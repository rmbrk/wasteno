const { ref, idRef, common } = require('./helper.js');
const bcrypt = require('bcrypt');

module.exports = {
  schema: {
    isOrigin: Boolean,
    parent: ref('Moderator'),
    name: String,

    email: String,
    phone: String,

    username: String,
    hash: String,
  },
  statics: {
    async generate(opts, cb = () => {}) {
      const {
        isOrigin = false,
        parentId,
        username,
        password,
        email,
        phone,
        name = username,
      } = opts;

      const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));

      this.create({
        isOrigin,
        parent: idRef(parentId),
        username,
        hash,
        email,
        phone,
        name,
      }, cb);
    },
    findByPasswordAndUsername: common.statics.findByPasswordAndUsername,
  },
};
