const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const routes = require('./routes');
const validators = require('./validators');
const controllers = require('./controllers');
const errors = require('./errors.js');
const {
  sendError,
  dbError,
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
        error: errors.bad_json,
      });
    }
    next();
  });
});

const apiRouter = express.Router();
for (const { method, path, consumers } of routes) {
  apiRouter[method](path, ...consumers.map((consumer) => {
    return async (req, res, next) => {
      try {
        await consumer(req, res, next);
      } catch (e) {
        dbError(res, e);
      }
    }
  }));
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
}
