const errors = require('./errors.js');
const config = require('./../config.js');

const ok = (res, data = {}) => res.status(200).json({ success: true, data });
const genOk = res => () => ok(res);

const sendError = (res, { error, details = {}, status = 400 }) => {
  let errorMsg = error;

  // error is either a string, or [string, additionalDetails]
  if (error instanceof Array) {
    errorMsg = error[0];
    Object.assign(details, error[1]);
  }
  res.status(status).json({
    success: false,
    error: errorMsg,
    details,
  });
};

const dbError = (res, err) => {
  sendError(res, {
    success: false,
    error: errors.unexpected,
    status: 500,
  });
  console.error(err);
};
const genDbError = res => err => dbError(res, err);

module.exports = {
  ok,
  genOk,
  sendError,
  dbError,
  genDbError,
  errors,
  config,
};
