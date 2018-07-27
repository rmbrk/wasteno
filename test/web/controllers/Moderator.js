const modulePath = './../../../src/web/controllers/Moderator.js';

module.exports = start('moderator', async () => {
  await start('module exists', async () => {
    require(modulePath);
  });
});
