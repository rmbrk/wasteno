const {
  createConsumers,
} = require('./../helper.js');

module.exports = createConsumers({
  path: '/src/web/validators',
  type: 'validator',
  additionalProperties: {
    error(err) {
      return `${this.errorPrefix}_${err}`;
    },
  }
})
