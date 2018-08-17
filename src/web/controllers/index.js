const {
  createConsumers,
} = require('./../helper.js');

module.exports = createConsumers({
  path: '/src/web/controllers',
  type: 'controller',
  additionalProperties: {
    error(err) {
      return `${this.errorPrefix}_${err}`;
    },
  }
})
