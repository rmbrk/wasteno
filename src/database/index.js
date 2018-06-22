const mongoose = require('mongoose');
const { Moderator } = require('./models');

mongoose.connect('mongodb://mongodb');

mongoose.connection.on('open', () => {
  console.log('connected to mongo')
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
      return;
    }
  });
});
