// Update with your config settings.

let poolNum = 0;
const pool = {
  afterCreate(conn, cb) {
    console.log(`${poolNum} connected to db: ${conn.readyForQuery}`);
    ++poolNum;
    cb(null, conn);
  },
};
const client = 'pg';
const connection = {
  host: 'db',
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: process.env.DB_CHARSET,
};
const migrations = {};
module.exports = {

  test: {
    client,
    connection: {
      ...connection,
      host: 'testdb',
    },
    pool,
    migrations,
  },

  development: {
    client,
    connection,
    pool,
    migrations,
  },

  staging: {
    client,
    connection,
    pool,
    migrations,
  },

  production: {
    client,
    connection,
    pool,
    migrations,
  },
};
