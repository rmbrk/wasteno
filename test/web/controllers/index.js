const modulePath = './../../../src/web/controllers';

module.exports = start('controllers', async () => {
  await start('module exists', async () => {
    require(modulePath);
  });

  await require('./Moderator.js');
});
