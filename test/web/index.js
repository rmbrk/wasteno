const modulePath = './../../../src/web';

module.exports = start('web', async () => {
  await start('module exists', async () => {
    require(modulePath);
  });

  await require('./stories.js');

  await require('./controllers');
});
