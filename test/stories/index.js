const stories = `
  # MODERATOR
  mod login-origin
  mod create        # mods can only be created by other mods
  mod logout-origin
  mod login
  mod logout

  # PROVIDER
  prov create
  prov login
  prov add-locations
  prov get-locations
  prov add-sales
  any get-sales by-provider
  prov add-sale-instances
  prov logout

  # RECEIVER
  rec create
  rec login
  rec logout

  # TRANSPORTER
  trsp create
  trsp login
  trsp logout

  # POSTVERIFICATION
  +mod login-origin
  mod verify-prov
  mod verify-rec
  mod verify-trsp

  +rec login
  rec search-sale
  rec order-sale
  rec get-own-orders

  +prov login
  prov ready-order
  rec order-status-ready

  +trsp login
  trsp select-order
  rec order-status-selected
  trsp pick-order
  rec order-status-picked
  trsp drop-order
  rec order-status-received

  rec rate-order
`;

const storyNames = stories
  .split('\n')
  .map(line => line.split('#')[0].trim())
  .filter(line => line.length > 0)
  .map(line => (line.startsWith('+')
    ? { isSideEffect: true, name: line.slice(1) }
    : { name: line }));

module.exports = start('stories', async () => {

  for (const { isSideEffect, name } of storyNames) {
    const storyPath = `./${name.split(' ').join('-')}`;
    if (isSideEffect) {
      try {
        await require(storyPath)();
      } catch (e) {
        throw `issue with side-effect ${storyPath}`;
      }
    } else {
      let exists = true;
      try {
        require.resolve(storyPath);
      } catch (e) {
        exists = false;
      }

      if (exists) {
        await start(name, () => require(storyPath)());
      } else {
        throw `no module '${storyPath}'`
      }
    }
  }
});
