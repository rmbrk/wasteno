const lowercaseLetters = 'abcdefghijklmnopqrstvuwxyz';
const uppercaseLetters = lowercaseLetters.toUpperCase();
const letters = `${lowercaseLetters}${uppercaseLetters}`;
const digits = '0123456789';
const alphanum = `${letters}${digits}`;
const lowercaseAlphanum = `${lowercaseLetters}${digits}`;
const baseSpecialCharset = '_.-~';
const extendedSpecialCharset = `${baseSpecialCharset} ()[]{}!?@/\\'"\`,:=+%$^&*`;
const lowercaseAlphanumBaseSpecialCharset = `${lowercaseAlphanum}${baseSpecialCharset}`;
const alphanumBaseSpecialCharset = `${alphanum}${baseSpecialCharset}`;
const alphanumExtendedSpecialCharset = `${alphanum}${extendedSpecialCharset}`;

/**
 * NOTES:
 * all strings have a hard 255 byte limit on the db
 *
 */

const commonName = {
  minSize: 4,
  maxSize: 30,
  charset: alphanumExtendedSpecialCharset,
};
module.exports = {
  common: {
    username: {
      minSize: 4,
      maxSize: 30,
      charset: alphanumBaseSpecialCharset,
    },
    name: commonName,
    password: {
      minSize: 8,
      maxSize: 100,
      charset: alphanumExtendedSpecialCharset,
    },
    email: {
      maxSize: 200,
    },
    phone: {
      maxSize: 20,
    },
    login: {
      tries: 4,
      intervalMS: 10 * 60 * 1000, // 10 mins
    },
    auth: {
      intervalMS: 12 * 60 * 60 * 1000, // 12 hrs
    },
    pagination: {
      items: {
        maxAmount: 30,
      },
    },
  },
  location: {
    address: {
      minSize: 6,
      maxSize: 150,
      charset: alphanumExtendedSpecialCharset,
    },
    name: {
      ...commonName, 
    },
  },
  moderator: {

  },
  receiver: {

  },
  provider: {
    eid: {
      size: 3,
      charset: uppercaseLetters,
    },
  },
  sale: {
    name: {
      minSize: 4,
      maxSize: 30,
      charset: alphanumExtendedSpecialCharset,
    },
    description: {
      minSize: 0,
      maxSize: 100,
      charset: alphanumExtendedSpecialCharset,
    },
    pagination: {
      items: {
        maxAmount: 30,
      },
    },
    eid: {
      size: 8,
      charset: lowercaseLetters,
    },
  },
  saleInstance: {
    quantity: {
      max: 10000,
    },
    eid: {
      size: 6,
      charset: digits,
    },
  },
};
