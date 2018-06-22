const lowercaseLetters = 'abcdefghijklmnopqrstvuwxyz';
const uppercaseLetters = lowercaseLetters.toUpperCase();
const letters = `${lowercaseLetters}${uppercaseLetters}`;
const numbers = '0123456789';
const alphanum = `${letters}${numbers}`;
const baseSpecialCharset = '_.-~';
const extendedSpecialCharset = `${baseSpecialCharset} ()[]{}!?@/\\'"\`,:=+%$^&*`;
const alphanumBaseSpecialCharset = `${alphanum}${baseSpecialCharset}`;
const alphanumExtendedSpecialCharset = `${alphanum}${extendedSpecialCharset}`;


module.exports = {
  common: {
    username: {
      minSize: 4,
      maxSize: 30,
      charset: alphanumBaseSpecialCharset,
    },
    name: {
      minSize: 4,
      maxSize: 30,
      charset: alphanumExtendedSpecialCharset,
    },
    password: {
      minSize: 8,
      maxSize: 100,
      charset: alphanumExtendedSpecialCharset,
    },
    login: {
      tries: 4,
      intervalMS: 10 * 60 * 1000, // 10 mins
    },
    auth: {
      intervalMS: 12 * 60 * 60 * 1000, // 12 hrs
    },
  },
  moderator: {

  },
  receiver: {

  },
};
