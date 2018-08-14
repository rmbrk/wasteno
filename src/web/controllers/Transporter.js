const {
  Transporter,
} = require('./../../db/models');

const {
  ok
} = require('./../helper.js');

const common = require('./common.js');

const controllerConfig = {
  model: Transporter,
  sessionPrefix: 'trsp',
  errorPrefix: 'transporter',
  dataName: 'transporter',
};
module.exports = {
  config: controllerConfig,
  ...common.group.user,

  async sendCoords(req, res) {
    const {
      lon,
      lat,
    } = req.body;

    await req.trsp.save({
      lon,
      lat
    }, { path: true });

    ok(res);
  },

  getOrdersByConvenience(req, res) {
    ok(res);
  }
}
