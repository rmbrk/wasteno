let poolNum = 0;
const knex = require('knex')({
  ...require('./../knexfile.js')[process.env.NODE_ENV],
  //debug: true
});
const bookshelf = require('bookshelf')(knex);

module.exports = {
  bookshelf,
  knex,
  Model: bookshelf.Model,
  Collection: bookshelf.Collection,
}
