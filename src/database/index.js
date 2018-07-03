const mongoose = require('mongoose');
const { Moderator } = require('./models');

mongoose.connect('mongodb://mongodb:27017', {
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
});

mongoose.connection.on('open', (err) => {
  if (err) {
    throw err; 
  }

  console.log('connected to mongo');
  Moderator.findOne({ isOrigin: true }, (err, mod) => {
    if (err) {
      console.error(err);
      return;
    }
    if (!mod) {
      console.log('creating origin mod');
      const data = JSON.parse(process.env.ORIGIN_MOD_DATA);
      Moderator.generate({
        isOrigin: true,
        ...data,
      });
    }
  });
});
