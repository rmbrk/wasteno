const errors = require('./errors.js');
const config = require('./../config.js');

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

module.exports = {
  sendError,
  errors,
  config,
};
