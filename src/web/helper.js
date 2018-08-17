const config = require('./../config.js');

const {
  pascalToCamel,
  getModules,
} = require('./../utils.js');

const errors = require('./errors.js');

const errorMsgExists = msg => errors.includes(msg);

const normalizeError = err => {
  if (typeof err === 'string') {
    return { msg: err, details: {} };
  }

  return err;
}
const isCustomError = err => !(err instanceof Error);
const affirm = (val, err) => {
  if (!val) {
    affirmError(err);
  }
};
const affirmError = (err) => {
  if (err) {
    if (Array.isArray(err) && err.length === 0) {
      return;
    }

    throw err;
  }
};
const affirmInternal = (val, err) => {
  if (!val) {
    console.error(`INTERNAL: ${err}`)
    throw new Error(err);
  }
}
const affirmMany = (validator, items, opts = {}) => {
  const {
    opts: validatorOpts = {},
    onerr = e => e,
    stack = true,
  } = opts;

  const errs = [];
  items.forEach((item, i) => {
    try {
      validator(item, validatorOpts);
    } catch (e) {
      if (isCustomError(e)) {
        const err = normalizeError(e)
        err.details.index = i;
        onerr(err, item, i);

        if (stack) {
          errs.push(err);
        } else {
          affirmError(err);
        }
      } else {
        throw e;
      }
    }
  })

  if (errs.length > 0) {
    affirmError(errs);
  }
}
const collect = (param, validator, opts = {}) => {
  const {
    opts: validatorOpts = {},
    onerr = e => e,
  } = opts;

  try {
    validator(param, validatorOpts);
  } catch (e) {
    if (isCustomError(e)) {
      return onerr(normalizeError(e), i);
    }

    throw e;
  }
};
const collectMany = (validator, items, opts = {}) => {
  items.reduce((errs, item, i) => {
    const err = collect(validator, item, opts);

    if (err) {
      errs.push(err);
    }

    return errs;
  }, []);
};

const addIfNotExists = (target, source, {
  targetType,
  targetName,
  sourceName,
}) =>
  Object.entries(source)
    .forEach(([key, val]) => {
      if (target[key]) {
        throw `${targetType} ${targetName} already has ${sourceName} key ${key}`;
      }

      target[key] = val;
    });

const createConsumers = ({ path, type, additionalProperties }) => {
  const consumers = getModules(path);

  return consumers.reduce((result, consumerName) => {
    const consumer = require(`${path}/${consumerName}`);

    if (consumer.config) {
      addIfNotExists(consumer, consumer.config, {
        targetType: type,
        targetName: consumerName,
        sourceName: 'config',
      });
    }

    addIfNotExists(consumer, additionalProperties, {
      targetType: type,
      targetName: consumerName,
      sourceName: 'additional property',
    });

    const key = pascalToCamel(consumerName.split('.')[0]);

    result[key] = consumer;

    return result;
  }, {})
}

module.exports = {
  config,
  errorMsgExists,

  isCustomError,
  normalizeError,

  affirm,
  affirmError,
  affirmInternal,
  affirmMany,

  collect,
  collectMany,

  addIfNotExists,
  createConsumers,
};
