const {
  Transporter,
} = require('./../../db/models');

const {
  ok
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  Model: Transporter,
  errorPrefix: 'transporter',
  dataName: 'transporter',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,

  async sendCoords({ input, user }) {
    const {
      lon,
      lat,
    } = input;

    await user.save({
      lon,
      lat
    }, { patch: true });

    return {}
  },

  getOrdersByConvenience({ input, session }) {
    return {}
  }
}
