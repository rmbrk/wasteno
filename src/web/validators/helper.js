const validator = require('validator');

const {
  sendError,
} = require('./../helper.js');

const check = {
  charset: (string, { charset, charsetError }) => {
    for (const char of string) {
      if (!charset.includes(char)) {
        return charsetError;
      }
    }

    return false;
  },
  len: (string, {
    min, max, minError, maxError,
  }) => {
    if (string.length < min) {
      return minError;
    }

    if (string.length > max) {
      return maxError;
    }

    return false;
  }
}

const handleRequestValidation = (req, res, next, validations, reqAccessor = 'body') => {
  for (const { property, fn, details = {} } of validations) {
    const error = fn(req[reqAccessor][property]);

    if (error) {
      sendError(res, {
        error,
        details
      });
      return;
    }
  }
  next();
};


module.exports = {
  check,
  validator,
  handleRequestValidation,
};
