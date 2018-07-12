const models = require('./models');

const {
  Moderator,
  ready,
} = models;

ready.then(() => {
  new Moderator({ isOrigin: true })
    .fetch()
    .then((mod) => {
      if (mod) {
        console.log('origin moderator detected');
        return;
      }

      console.log('origin moderator not detected');
      const data = JSON.parse(process.env.ORIGIN_MOD_DATA);
      return new Moderator({
        ...data,
        isOrigin: true,
      })
        .save()
        .then((mod) => {
          console.log('origin moderator created with username ', data.username);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

