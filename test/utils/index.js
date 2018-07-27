const modulePath = './../../src/utils.js';

module.exports = start('utils', async () => {
  await start('module exists', async () => {
    require(modulePath);
  }); 
  const utils = require(modulePath);

  await start('flattenOne(arr)', async () => {
    assertSamples(utils.flattenOne, [
      {
        arg: [1],
        expected: [1],
        message: 'unchanged base array',
      }, {
        arg: [[1]],
        expected: [1],
        message: 'single nested array',
      }, {
        arg: [[[1]]],
        expected: [[1]],
        message: 'double nested array',
      }, {
        arg: [[1], [2]],
        expected: [1, 2],
        message: 'single nested double array',
      }, {
        arg: [[[1, 2], 3], 4],
        expected: [[1, 2], 3, 4],
        message: 'double nested mixed array',
      }, {
        arg: [[['ab', 'cd'], 'ef'], 'gh'],
        expected: [['ab', 'cd'], 'ef', 'gh'],
        message: 'double nested mixed string array',
      },
    ], 'deepEqual');
  });

  await start('flatten(arr)', async () => {
    assertSamples(utils.flatten, [
      {
        arg: [1],
        expected: [1],
        message: 'unchanged base array',
      }, {
        arg: [[1]],
        expected: [1],
        message: 'single nested array',
      }, {
        arg: [[[1]]],
        expected: [1],
        message: 'double nested array',
      }, {
        arg: [[[[[[[[[[1]]]]]]]]]],
        expected: [1],
        message: 'many nested array',
      }, {
        arg: [[[[[[[[[1], 2], 3], 4], 5], 6], 7], 8], 9],
        expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        message: 'many nested mixed array',
      }, {
        arg: [[['ab', 'cd'], 'ef'], 'gh'],
        expected: ['ab', 'cd', 'ef', 'gh'],
        message: 'many nested mixed string array',
      },
    ], 'deepEqual');
  });

  await start('getUnique(arr)', async () => {
    assertSamples(utils.getUnique, [
      {
        arg: [1, 2, 3, 4],
        expected: [1, 2, 3, 4],
        message: 'no removal',
      }, {
        arg: [1, 2, 2, 3],
        expected: [1, 2, 3],
        message: 'single removal',
      }, {
        arg: [1, 2, 2, 2, 3],
        expected: [1, 2, 3],
        message: 'double removal of single item',
      }, {
        arg: [1, 2, 2, 3, 3, 4],
        expected: [1, 2, 3, 4],
        message: 'single removal of two items',
      },
    ], 'deepEqual');
  });

  await start('isUpperCase(str)', async () => {
    assertSamples(utils.isUpperCase, [
      {
        arg: 'abc',
        expected: false,
        message: 'plain lowercase string',
      }, {
        arg: 'ABC',
        expected: true,
        message: 'plain uppercase string',
      }, {
        arg: 'Abc',
        expected: false,
        message: 'capitalized lowercase string',
      },
    ], 'deepEqual');
  });

  await start('pascalToCamel(str)', async () => {
    assertSamples(utils.pascalToCamel, [
      {
        arg: 'SomePascal',
        expected: 'somePascal',
        message: 'basic pascal',
      },
    ], 'deepEqual');
  });

  await start('prefixProxy(prefix, base[, opts])', async () => {
    assertSamples(utils.prefixProxy, [
      {
        args: ['pre', { preX: 123 }],
        expected: 123,
        filter: res => res.x,
        filterMessage: 'res.x',
        message: 'basic no-opt proxy',
      }, {
        args: ['pre_', { pre_x: 123 }, { isUpperCase: false }],
        expected: 123,
        filter: res => res.x,
        filterMessage: 'res.x',
        message: 'basic no-uppercase proxy',
      },
    ], 'deepEqual');

    {
      const base = { abc: 1 };
      const proxy = utils.prefixProxy('def', base);
      proxy.xyz = 2;
      assert.equal(base.defXyz, proxy.xyz, 'proxy should modify original');
    }
  });

  await start('dissectEid(eid)', async () => {
    assertSamples(utils.dissectEid, [
      {
        arg: 'ABC',
        expected: {
          provider: 'ABC',
          sale: false,
          partialSale: false,
          instance: false,
          partialInstance: false,
        },
        message: 'correct provider',
      }, {
        arg: 'ABCabcdefgh',
        expected: {
          provider: 'ABC',
          sale: 'ABCabcdefgh',
          partialSale: 'abcdefgh',
          instance: false,
          partialInstance: false,
        },
        message: 'correct sale',
      }, {
        arg: 'ABCabcdefgh012345',
        expected: {
          provider: 'ABC',
          sale: 'ABCabcdefgh',
          partialSale: 'abcdefgh',
          instance: 'ABCabcdefgh012345',
          partialInstance: '012345',
        },
        message: 'correct instance'
      }
    ], 'deepEqual');
  });

  assertSamples(utils.findAllIndices, [
    {
      args: [[1, 2, 3, 4, 5, 6], x => x % 2 === 0],
      expected: [1, 3, 5],
      message: 'indices of even numbers',
    }, 
  ], 'deepEqual');
});
