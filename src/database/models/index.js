const fs = require('fs');

const mongoose = require('mongoose');

const { isUpperCase, noop } = require('./../../utils.js');

const createModelFromName = (name) => {
  const {
    schema,
    methods = {},
    statics = {},
    query = {},
    virtuals = {},
    options = {},
    index,
  } = require(`./${name}`);

  const schemaInstance = new mongoose.Schema(schema, options);

  Object.assign(schemaInstance.methods, methods);
  Object.assign(schemaInstance.statics, statics);
  Object.assign(schemaInstance.query, query);

  Object.entries(virtuals)
    .forEach(([virtualName, { getter = noop, setter = noop }]) => {
      schemaInstance.virtual(virtualName).get(getter).set(setter);
    });

  if (index) {
    schemaInstance.index(index);
  }

  return mongoose.model(name, schemaInstance);
};

const models = fs.readdirSync('./database/models')
  .filter(item => isUpperCase(item[0]) && !item.startsWith('.'))
  .map(item => item.split('.')[0]);

module.exports = models.reduce((out, modelName) => ({
  ...out,
  [modelName]: createModelFromName(modelName),
}), {});
