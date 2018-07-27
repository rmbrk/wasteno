require('dotenv').config();

const db = require('./db');

module.exports = {
  ready: db.ready.then(() => {
    return require('./web').ready; 
  }),
};
