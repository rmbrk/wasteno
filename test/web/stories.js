const testCreateLoginLogout = async (name) => {
  const info = {
    username: genString(`created-${name}-%%%%%`),
    password: genString('password-#########'),
    email: genString('%%%%%%%@%%%%%.com'),
    phone: genString('123######'),
  };

  await start(`${name} create/login/logout`, async () => {
    assertRes(`${name} create`, await request(
      `${name}/create`,
      pluck(info, [
        'username',
        'password',
        'email',
        'phone',
      ]),
    ));

    assertRes(`${name} login`, await request(
      `${name}/login`,
      pluck(info, [
        'username',
        'password',
      ]),
    ));

    assertRes(`${name} logout`, await request(`${name}/logout`));
  });
};

module.exports = start('stories', async () => {
  const originModData = JSON.parse(process.env.ORIGIN_MOD_DATA);

  await start('login/out as origin mod', async () => {
    assertRes('login', await request(
      'moderator/login',
      pluck(originModData, [
        'username',
        'password',
      ]),
    ));

    assertRes('logout', await request('moderator/logout'));
  });

  const userModels = ['receiver', 'transporter'];
  for (let i = 0; i < userModels.length; ++i) {
    await testCreateLoginLogout(userModels[i]);
  }

  await start('provider create/login/verified/add-sale/add-sale-instance', async () => {
    const info = {
      username: genString('provider-%%%%%%%'),
      password: genString('password-#######'),
      email: genString('%%%%%%@%%%%%.com'),
      phone: genString('421######'),
      eid: genString('&&&'),
    };
    assertRes('create', await request(
      'provider/create',
      pluck(info, [
        'username',
        'password',
        'email',
        'phone',
        'eid',
      ]),
    ));

    assertRes('login', await request(
      'provider/login',
      pluck(info, [
        'username',
        'password',
      ]),
    ));

    assertRes('mod login', await request(
      'moderator/login',
      pluck(originModData, [
        'username',
        'password',
      ]),
    ));

    assertRes('mod verify', await request(
      'moderator/verify/provider',
      pluck(info, [
        'username',
      ]),
    ));

    assertRes('mod logout', await request('moderator/logout'));

    const locationInfo = {
      name: genString('%%%%%%% %%% %%'),
      address: genString('### %%%%%%% %%%% %%%'),
      isMain: true,
    }
    const locationRes = await request('provider/locations/add', {
      locations: [pluck(locationInfo, [
        'name',
        'address',
        'isMain',
      ])],
    });
    assertRes('create location', locationRes);

    const saleInfo = {
      name: genString('%%%%%%%% %%%%'),
      description: genString('%%%% %%%% %%%%%%%%% %%%%% %%'),
      eid: info.eid + genString('%%%%%%%%'),
    };
    assertRes('add sale', await request('sales/add', {
      sales: [pluck(saleInfo, [
        'name',
        'description',
        'eid',
      ])],
    }));

    const saleInstanceInfo = {
      eid: saleInfo.eid + genString('######'),
      expiry: Date.now() + 2 * 86400 * 1000,
      locationIndex: locationRes.data.indices[0],
    };
    assertRes('add sale instance', await request(
      'sales/instances/add',
      {
        saleInstances: [pluck(saleInstanceInfo, [
          'eid',
          'expiry',
          'locationIndex',
        ])],
      },
    ));
  });
});
