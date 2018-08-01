module.exports = start('all', async () => {
  await require('./utils');
  await require('./web');
  await require('./stories');
  process.exit();
});
