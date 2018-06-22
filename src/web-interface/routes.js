const fs = require('fs');

const {
  flatten,
} = require('./../utils.js');

const validators = require('./validators');
const controllers = require('./controllers');

const script = fs.readFileSync('/src/web-interface/routes.txt', 'utf-8');

const lines = script.trim().split('\n').map(line => line.trim());

const blocks = lines.reduce((acc, line) => {
  if (line.length === 0) {
    acc.push([]);
  } else {
    acc[acc.length - 1].push(line);
  }

  return acc;
}, [[]]);

const removePrefix = line => line.substring(2, line.length);

const routes = blocks.reduce((routeAcc, block) => {
  const [accessor, ...rest] = block;
  const [method, path] = accessor.split(' ');

  const consumerBlocks = rest.reduce((consumerBlockAcc, line) => {
    if (line.startsWith('- ')) {
      consumerBlockAcc.push({
        subject: removePrefix(line),
        lines: [],
      });
    } else {
      consumerBlockAcc[consumerBlockAcc.length - 1].lines.push(line);
    }

    return consumerBlockAcc;
  }, []);

  const lastConsumerBlockIndex = consumerBlocks.length - 1;
  const consumers = consumerBlocks.reduce((consumersAcc, { subject, lines }, index) => {
    const validatorLines = lines
      .filter(line => line.startsWith('. '))
      .map(removePrefix);
    const controllerLines = lines
      .filter(line => line.startsWith('> '))
      .map(removePrefix);

    if (validatorLines.length > 0) {
      const validatorFns = flatten(validatorLines.map((line) =>
        line.split(' ').map((validator) => {
          const fn = validators[subject][validator];

          if (!fn) {
            throw `can't find validator ${subject}.${validator}`;
          }

          return fn;
        })));

      consumersAcc.push(...validatorFns);
    }

    if (controllerLines.length > 0) {
      if (index === lastConsumerBlockIndex) {
        if (controllerLines.length > 1) {
          throw `defined more than one controller in "${method} ${path}"`;
        } else {
          const [controller] = controllerLines;
          const fn = controllers[subject][controller];

          if (!fn) {
            throw `can't find controller ${subject}.${controller}`;
          }
          consumersAcc.push(controllers[subject][controller]);
        }
      } else {
        throw `defined controller before end of block "${method} ${path}"`;
      }
    }

    return consumersAcc;
  }, []);

  routeAcc.push({
    method,
    path,
    consumers,
  });

  return routeAcc;
}, []);

module.exports = routes;
