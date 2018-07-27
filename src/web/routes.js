const fs = require('fs');

const {
  flatten,
} = require('./../utils.js');

const validators = require('./validators');
const controllers = require('./controllers');

const script = fs.readFileSync('/src/web/routes.txt', 'utf-8');

const lines = script.trim()
  .split('\n')
  .map(line => line.trim())
  .filter(line => !line.startsWith('#'));

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
        subjectName: removePrefix(line),
        lines: [],
      });
    } else {
      consumerBlockAcc[consumerBlockAcc.length - 1].lines.push(line);
    }

    return consumerBlockAcc;
  }, []);

  const lastConsumerBlockIndex = consumerBlocks.length - 1;
  const consumers = consumerBlocks.reduce((consumersAcc, { subjectName, lines }, index) => {
    const validatorLines = lines
      .filter(line => line.startsWith('. '))
      .map(removePrefix);
    const controllerLines = lines
      .filter(line => line.startsWith('> '))
      .map(removePrefix);

    if (validatorLines.length > 0) {
      const validationSubject = validators[subjectName];

      if (!validationSubject) {
        throw `can't find validation subject ${subjectName}`;
      }

      const validatorFns = flatten(validatorLines.map(line =>
        line.split(' ').map((validatorName) => {
          const fn = validationSubject[validatorName];

          if (!fn) {
            throw `can't find validator ${subjectName}.${validatorName}`;
          }

          return fn.bind(validationSubject);
        })));

      consumersAcc.push(...validatorFns);
    }

    if (controllerLines.length > 0) {
      if (index === lastConsumerBlockIndex) {
        if (controllerLines.length > 1) {
          throw `defined more than one controller in "${method} ${path}"`;
        } else {
          const controllerSubject = controllers[subjectName];

          if (!controllerSubject) {
            throw `can't find controller subject ${subjectName}`;
          }

          const [controllerName] = controllerLines;
          const fn = controllerSubject[controllerName];

          if (!fn) {
            throw `can't find controller ${subjectName}.${controllerName}`;
          }

          consumersAcc.push(fn.bind(controllerSubject));
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
