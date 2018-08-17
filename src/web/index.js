const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const utils = require('./../utils');

const routes = require('./routes');
const validators = require('./validators');
const controllers = require('./controllers');
const errors = require('./errors.js');
const {
  errorMsgExists,
  normalizeError,
} = require('./helper.js');

const app = express();
app.use(session({
  secret: process.env.SESSION_KEY,
  cookie: { maxAge: 60000 },
  name: 'wasteno.sid',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      return sendError(res, {
        errors: ['bad_json'],
      });
    }
    next();
  });
});

const sendResponse = (res, { success, status, ...additional }) => {
  res.status(status).json({
    success,
    ...additional,
  });
};
const sendData = (res, { data }) => sendResponse(res, {
  success: true,
  status: 200,
  data,
});
const sendError = (res, { errors, status = 400 }) => {
  const shouldProceed = true;

  if (!Array.isArray(errors)) {
    sendInternalError(res, `errors not an array: ${errors}`);
    return;
  }
  const normalizedErrors = utils.flatten(errors)
    .map(normalizeError);

  normalizedErrors.forEach((error) => {
    if (typeof error === 'object') {
      if (!error.hasOwnProperty('details')) {
        error.details = {};
      }

      if (!error.hasOwnProperty('msg')) {
        sendInternalError(res, `invalid error ${error}`);
        return;
      }

      if (!errorMsgExists(error.msg)) {
        console.error(`INEXISTENT ERROR MSG: ${error.msg}`);
      }

      return error;
    }

    sendInternalError(res, `invalid error ${error}`);
  });

  sendResponse(res, {
    success: false,
    status,
    errors: normalizedErrors,
  });
};
const sendInternalError = (res, err) => {
  console.error(`INTERNAL: ${err.stack}`);
  sendError(res, {
    errors: ['unexpected'],
    status: 500,
  });
};

const genHandler = consumers => async (req, res) => {
  const accumulator = {
    promise: Promise.resolve(),
    input: req.body,
    session: req.session,
    get self() { return accumulator; },
  };

  for (const consumer of consumers) {
    try {
      const val = await consumer(accumulator);
      if (val) {
        sendData(res, { data: val });
        return;
      }
    } catch (e) {
      if (e instanceof Error) {
        sendInternalError(res, e);
        return;
      }

      sendError(res, {
        success: false,
        errors: Array.isArray(e)
          ? e
          : [e],
      });
      return;
    }
  }
};

const apiRouter = express.Router();
for (const { method, path, consumers } of routes) {
  apiRouter[method](path, genHandler(consumers));
}

app.use('/api', apiRouter);
app.use(express.static('/public'));

module.exports = {
  ready: new Promise((resolve) => {
    app.listen(Number(process.env.PORT), () => {
      console.log('web server started');
      resolve();
    });
  }),
};
