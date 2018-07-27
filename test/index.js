module.exports = start('all', async () => {
  await require('./utils');
  await require('./web')
  process.exit();
});
