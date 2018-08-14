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

const eidDeltaSizes = {
  provider: 3,
  sale: 8,
  instance: 6,

  receiver: 3,
  location: 8,
  order: 6,
};
const eidCharsets = {
  provider: uppercaseLetters,
  sale: lowercaseLetters,
  instance: digits,

  receiver: uppercaseLetters,
  location: lowercaseLetters,
  order: digits,
}
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
    maxOrders: 10,
    eid: {
      size: eidDeltaSizes.receiver,
      charset: eidCharsets.receiver,
    },
    location: {
      eid: {
        size: eidDeltaSizes.location,
        charset: eidCharsets.location,
      },
    }
  },
  provider: {
    eid: {
      size: eidDeltaSizes.provider,
      charset: eidCharsets.provider,
    },
  },
  order: {
    eid: {
      size: eidDeltaSizes.order,
      charset: eidCharsets.order,
    },
    pagination: {
      items: {
        maxAmount: 30,
      }
    }
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
      size: eidDeltaSizes.sale,
      charset: eidCharsets.sale,
    },
    categories: ['FMCG', 'durable'],
    search: {
      term: {
        minSize: 3,
        maxSize: 200,
        charset: alphanumExtendedSpecialCharset,
      },
      eidStart: {
        minSize: 0,
        maxSize: eidDeltaSizes.provider + eidDeltaSizes.sale,
        charset: eidCharsets.provider + eidCharsets.sale,
      }
    }
  },
  saleInstance: {
    quantity: {
      max: 10000,
    },
    eid: {
      size: eidDeltaSizes.instance,
      charset: digits,
    },
  },
  price: {
    currencies: ['eur', 'czk', 'gbp', 'usd'],
  },
};
