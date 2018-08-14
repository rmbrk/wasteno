require('dotenv').config({
  path: '/src/.env',
});

console.log = () => {};

global.write = (text, newline = true, trail = false) => {
  process.stdout.write((newline ? '\n' : '')
    + text
    + (trail ? '\n' : ''));
};

global.getTimes = (n, fn) => Array(n).fill().map(fn);
global.genString = template => template.split('')
  .reduce((acc, char) => {
    switch (char) {
      case '#':
        acc += Math.floor(Math.random() * 10);
        break;
      case '%':
        acc += String.fromCharCode(0x61 + Math.floor(Math.random() * 26));
        break;
      case '&':
        acc += String.fromCharCode(0x41 + Math.floor(Math.random() * 26))
        break;
      default:
        acc += char;
    }

    return acc;
  }, '');

global.pluck = (obj, props) =>
  props.reduce((acc, prop) => ({ ...acc, [prop]: obj[prop] }), {});
global.mapPluck = (arr, props) => arr.map((obj) => pluck(obj, props));

global.getRandomItem = (arr) => arr[Math.random() * arr.length |0];

global.wait = ms => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const attemptStringify = (x) => {
  try {
    return JSON.stringify(x);
  } catch (e) {
    return x;
  }
};
const attemptParse = (x) => {
  try {
    return JSON.parse(x);
  } catch (e) {
    return x;
  }
};

const http = require('http');

const baseCookie = 'test=true';
let cookieJar = baseCookie;
global.keepCookie = false;
global.request = (path, data = {}, opts = {}) => {
  const {
    isApi = true,
    newSession = !global.keepCookie,
    hostname = 'localhost',
    port = process.env.PORT,
    method = 'POST',
    headers = {
      'Content-Type': 'application/json',
      Cookie: cookieJar,
    },
    ...restOpts
  } = opts;

  if (newSession) {
    delete headers.Cookie;
    cookieJar = baseCookie;
  }

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname,
      port,
      path: `/${(isApi ? 'api/' : '')}${path}`,
      method,
      headers,
    }, (res) => {
      if (res.headers['set-cookie']) {
        res.headers['set-cookie'].forEach((cookie) => {
          cookieJar = `${decodeURIComponent(cookie.split(' ')[0])} ${cookieJar}`;
        });
      }

      let responseText = '';
      res.on('data', (chunk) => {
        responseText += chunk;
      });
      res.on('end', () => {
        resolve(attemptParse(responseText));
      });
    });

    req.on('error', reject);
    req.write(attemptStringify(data));
    req.end();
  });
};

global.assert = require('assert');

const errors = [];
const testStack = [];
global.start = async (desc, cb, opts = {}) => {
  const prevKeepCookie = global.keepCookie;
  const {
    keepCookie = true,
  } = opts;

  testStack.push(desc);
  write(testStack.join(' > '));

  if (keepCookie) {
    global.keepCookie = true;
  }
  try {
    await cb();
  } catch (e) {
    write(': FAILED', false);
    errors.push({
      stack: [...testStack],
      error: e,
    });
  }
  if (keepCookie && !prevKeepCookie) {
    cookieJar = baseCookie;
    global.keepCookie = false;
  }

  testStack.pop(desc);
};

global.getStats = () => {
  const now = Date.now();
  const allTime = now - initTime;
  const envTime = setupTime - initTime;
  const testTime = now - setupTime;

  const showTime = ms => `${(ms / 1000).toFixed(1)}s`;
  const timeStr = `(a ${showTime(allTime)}) (t ${showTime(testTime)}) (e ${showTime(envTime)})`;

  write(`\n${'-'.repeat(timeStr.length)}\n${timeStr}\n`);
  if (errors.length > 0) {
    write(`ERROR: ${errors.length} test${errors.length > 1 ? 's' : ''} failed`, true, true);
    errors.forEach(({ stack, error }) => {
      const errorMsg = error.message || error;
      write(`${stack.join(' -> ')}: ${errorMsg}`, true, true);
    });
    process.exit(1);
  } else {
    write('SUCCESS: all tests passed', true, true);
  }
};

global.assertSamples = (fn, samples, method = 'deepEqual') => {
  samples.forEach((sample, i) => {
    const {
      message = '',
    } = sample;

    if (!sample.hasOwnProperty('arg') && !sample.hasOwnProperty('args')) {
      throw new Error(`sample #${i}: ${message}\n# missing arg/args`);
    }

    if (!sample.hasOwnProperty('expected')) {
      throw new Error(`sample #${i}: ${message}\n# missing expected`);
    }

    const hasFilter = sample.hasOwnProperty('filter');

    const {
      args = [sample.arg],
      expected,
      filter = x => x,
      filterMessage = '',
    } = sample;

    let result = filter(fn(...args));

    // using try/catch to speed process, as JSON.stringify is slow
    try {
      assert[method](result, expected);
    } catch (e) {
      const argsStr = args.map(arg => attemptStringify(arg)).join(', ');
      const expectedStr = attemptStringify(expected);
      const resultStr = attemptStringify(result);

      const errorMsg = `${`sample #${i}: ${message}\n`
        + `# expected fn(${argsStr}) to ${method} ${expectedStr}`}${
        hasFilter ? ` through ${filterMessage} filter` : ''
      }, but got ${resultStr}`;

      throw new Error(errorMsg);
    }
  });
};
global.assertRes = (reason, res, opts = {}) => {
  const {
    debug = false,
  } = opts;

  if (debug) {
    console.error(attemptStringify(res));
  }
  assert.equal(res.success, true, `${reason}: ${res.error}\n${attemptStringify(res)}`);

  return res;
};

const knex = require('./../src/db/bookshelf.js').knex;

process.on('exit', () => {
  global.getStats();
});

write('waiting for env');

const initTime = Date.now();
let setupTime = initTime;
require('./../src').ready.then(async () => {
  setupTime = Date.now();
  write('starting tests');
  await require(`/test/${process.env.TEST_PATH}`);
});
