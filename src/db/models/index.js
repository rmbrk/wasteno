const fs = require('fs');

const { Model, Collection, knex } = require('./../bookshelf.js');

const { uniquify } = require('./../../utils.js');

const dbActions = [];

// TODO remove drop after testing
if (process.env.NODE_ENV === 'test' || true) {
  dbActions.push(() => knex.raw(`drop owned by ${process.env.DB_USERNAME}`));
}
// likeness score
dbActions.push(() => knex.raw('CREATE EXTENSION pg_trgm'))

const processedTableNames = [];
const toProcessTableNames = ['Moderator'];
const buildTablesFromName = name => new Promise((resolve, reject) => {
  if (processedTableNames.includes(name)) {
    resolve();
    return;
  }

  const {
    schema,
    references = {},
  } = require(`./${name}`);

  if (Object.values(references)
    .find(model =>
      !processedTableNames.includes(model)
          && model !== name)) {
    toProcessTableNames.push(name);
    resolve();
    return;
  }
  /**
   * syntax
   *  amount: 'integer'
   *    -> t.integer('amount')
   *  amount: ['integer', 'unique']
   *    -> t.integer('amount').unique()
   *  name: [['string', 100], 'unique']
   *    -> t.string('name', 100).unique()
   */
  return knex.schema.createTable(name, (table) => {
    table.increments('id');

    Object.entries(schema)
      .forEach(([columnName, attribute]) => {
        const attributes = Array.isArray(attribute)
          ? attribute
          : [attribute];

        attributes.reduce((column, attribute, i) => {
          const [type, ...params] = Array.isArray(attribute)
            ? attribute
            : [attribute];

          if (!column[type]) {
            throw `column[type] is not a function. type: ${type}`;
          }

          return i === 0
            ? column[type](columnName, ...params)
            : column[type](...params);
        }, table);
      });

    Object.entries(references)
      .forEach(([columnName, reference]) => {
        // this id method is postgres specific
        table.integer(columnName).unsigned();

        table.foreign(columnName).references(`${reference}.id`);
      });

    table.timestamps(false, true);
  })
    .then(() => {
      processedTableNames.push(name);

      if (toProcessTableNames.length === 0) {
        resolve();
        return;
      }

      return buildTablesFromName(toProcessTableNames.shift())
        .then(resolve);
    })
    .catch((err) => {
      console.error(`couldn't initialize table ${name}`);
      console.error(err);
      process.exit(1);
    });
});

const createModelFromName = (name, models = {}) => {
  const {
    schema,
    references = {},
    associations = {},
    methods = {},
    statics = {},
    collectionName = `${name}s`,
  } = require(`./${name}`);

  const nextToProcess = [];
  const associationFns = Object.entries(associations)
    .reduce((fns, [association, values]) => {
      Object.entries(values)
        .forEach(([localAccessor, foreignAccessor]) => {
          if (association !== 'belongsToMany') {
            // "model.localForeignKey" or "model via localForeignKey" or "model"
            const [model, localForeignKey = localAccessor] =
              foreignAccessor.split(/\.|(?: via )/);

            fns[localAccessor] = function () {
              return this[association](models[model], localForeignKey);
            };

            nextToProcess.push(model);
          } else {
            // "model:relation"
            const [model, relation = ''] = foreignAccessor.split(':');
            const [tableAForeignAccessor, localForeignKeyB] =
              foreignAccessor.split('/').map(str => str.trim());

            const [modelA, localForeignKeyA] =
              tableAForeignAccessor.split(/\.|( via )/);

            const sortedModels = [model, name].sort();
            const relationTable =
              `relation_${relation}_${sortedModels[0]}_${sortedModels[1]}`;

            fns[localAccessor] = function () {
              return this[association](
                models[model],
                relationTable,
                name,
                model,
              );
            };

            if (association === 'hasMany') {
              nextToProcess.push(relationTable);
            }
          }
        });
      return fns;
    }, {});

  models[name] = Model.extend({
    ...methods,
    ...associationFns,
    tableName: name,
  }, statics);

  models[name].Collection =
  models[collectionName] = Collection.extend({
    model: models[name],
  });

  const nextModels = nextToProcess.filter(modelName =>
    !models[modelName] && modelName !== name);

  // keep these separate for timing/stack reasons
  toProcessTableNames.push(...nextModels);
  nextModels.forEach((modelName) => {
    // filter twice because of state changes
    if (!models[modelName] && modelName !== name) {
      createModelFromName(modelName, models);
    }
  });

  return models;
};
const getModels = () =>
  // this starts a chain and returns the object with all
  // models in the mesh that includes Moderator
  createModelFromName('Moderator');

const startDBActions = () => {
  uniquify(toProcessTableNames);

  const checkToProcessAndNext = (promise, res, rej) => {
    promise.then(() => {
      if (toProcessTableNames.length === 0) {
        res();
        return;
      }

      checkToProcessAndNext(
        buildTablesFromName(toProcessTableNames.shift()),
        res,
        rej,
      );
    });
  };
  const tablePromise = () => new Promise((resolve, reject) => {
    checkToProcessAndNext(
      buildTablesFromName(toProcessTableNames.shift()),
      resolve,
      reject,
    );
  });

  dbActions.push(tablePromise);

  return dbActions.reduce(
    (promise, action) => promise.then(action),
    Promise.resolve(),
  );
};

const models = getModels();

module.exports = {
  ...models,
  ready: startDBActions(),
};
