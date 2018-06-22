const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const routes = require('./routes');
const validators = require('./validators');
const controllers = require('./controllers');

const app = express();
app.use(session({
  secret: process.env.SESSION_KEY,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser.json());

const apiRouter = express.Router();
for (const { method, path, consumers } of routes) {
  apiRouter[method](path, ...consumers);
}

app.use('/api', apiRouter);
app.use(express.static('/public'));

app.listen(3000, () => {
  console.log('web server started');
})
