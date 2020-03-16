import * as nock from 'nock';

import { ƒ, τ, F, Decimal, Word } from './helpers/setup';

const good = {
  id: 123456,
  name: 'f-flat_node'
};

nock('https://api.github.com/')
  .get('/users/Hypercubed/repos/')
  .reply(200, JSON.stringify(good, null, ' '));

test('yield', async () => {
  const yieldAction = new Word('yield');
  const plus = new Word('+');
  expect(await ƒ('[1 2 yield 4 5 yield 6 7] in')).toEqual(
    τ([
      [1, 2],
      [4, 5, yieldAction, 6, 7]
    ])
  );
  expect(await ƒ('[1 2 yield 4 5 yield 6 7] in in')).toEqual(
    τ([
      [1, 2],
      [4, 5],
      [6, 7]
    ])
  );
  expect(await ƒ('[1 2 + yield 4 5 + ] in')).toEqual(τ([[3], [4, 5, plus]]));
  expect(await ƒ('[1 2 + yield 4 5 + ] in drop')).toEqual(τ([[3]]));
});

/* test('multiple yields', async t => {
  t.deepEqual(
    await ƒ('[1 2 + yield 4 5 + yield ] in in drop'),
    [3, 9],
    'multiple yields'
  );
  t.deepEqual(
    await ƒ('count* [ in ] 10 times drop'),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'multiple yields'
  );
}); */

/* test.cb('eval should yield on async with callback', async t => {
  t.plan(2);
  var f = F('10 !').eval('100 sleep 4 5 + +', done);
  t.deepEqual(f.toJSON(), [3628800]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toJSON(), [3628809]);
    t.end();
  }
});

test.cb('constructor should yield on async with callback', async t => {
  t.plan(2);
  var f = F('10 ! 100 sleep 4 5 + +', done);
  t.deepEqual(f.toJSON(), [3628800]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toJSON(), [3628809]);
    t.end();
  }
}); */

test('should delay', async () => {
  expect(await ƒ('[ 10 ! ] 100 delay 4 5 + +')).toEqual(`[ 3628809 ]`);
});

/* test('should in', async t => {
  const f = await F().promise('[ 100 sleep 10 ! ] in 4 5 +');
  t.deepEqual(f.toJSON(), [[], 9]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toJSON(), [[], 9]);

    setTimeout(function () {
      t.deepEqual(f.toJSON(), [[ 3628800 ], 9]);
      t.end();
    }, 200);
  }
}); */

test('should await', async () => {
  expect(await ƒ('1 [ 100 sleep 10 ! ] await 4 5 +')).toEqual(
    `[ 1 [ 3628800 ] 9 ]`
  );
});

test('all', async () => {
  expect(await ƒ('[ 100 sleep 10 ! ] dup pair all')).toEqual(
    `[ [ [ 3628800 ] [ 3628800 ] ] ]`
  );
});

test('should generate promise', async () => {
  return F()
    .promise('100 sleep 10 !')
    .then(f => {
      expect(f.stack[0]).toEqual(new Decimal(3628800));
    });
});

test('should resolve promise even on sync', async () => {
  return F()
    .promise('10 !')
    .then(f => {
      expect(f.stack[0]).toEqual(new Decimal(3628800));
    });
});

test('should work with async/await', async () => {
  expect(await ƒ('100 sleep 10 !')).toEqual(`[ 3628800 ]`);
});

test('should read and parse JSON', async () => {
  expect(
    await ƒ(`'https://api.github.com/users/Hypercubed/repos/' read eval`)
  ).toEqual(τ([good]));
});

test('throw on missing file', async () => {
  expect(ƒ(`'file:///Users/missing/file.ff' read`)).rejects.toThrow(
    `'read' ENOENT: no such file or directory, open '/Users/missing/file.ff'`
  );
});

test('sleep', async () => {
  expect(await ƒ('10 100 sleep 20 +')).toEqual(`[ 30 ]`);
});

test('multiple async', async () => {
  expect(await ƒ('10 100 sleep 20 + 100 sleep 15 +')).toEqual(`[ 45 ]`);
  expect(await ƒ('10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 +')).toEqual(
    `[ 45 ]`
  );
});

test('multiple async in children', async () => {
  expect(await ƒ('[ 10 100 sleep 20 + 100 sleep 15 + ] await')).toEqual(
    `[ [ 45 ] ]`
  );
  expect(
    await ƒ('[ 10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 + ] await')
  ).toEqual(`[ [ 45 ] ]`);
});

test('should await on multiple promises', async () => {
  const f = F();
  await f.promise('100 sleep 10 !');
  expect(f.stack).toEqual([new Decimal(3628800)]);
  await f.promise('100 sleep 9 +');
  expect(f.stack).toEqual([new Decimal(3628809)]);
});

test('multiple promises', async () => {
  const f = F();
  f.promise('1000 sleep 10 !');
  expect(f.toJSON()).toEqual([]);
  f.promise('1000 sleep 9 +');
  expect(f.toJSON()).toEqual([]);
  await f.promise();
  expect(f.toJSON()).toEqual([new Decimal(3628809).toJSON()]);
});

test('multiple promises correct order', async () => {
  // todo
  const f = F();
  f.next('1000 sleep 10 !').then(f => {
    expect(f.toJSON()).toEqual([new Decimal(3628800).toJSON()]);
  });
  expect(f.toJSON()).toEqual([]);
  f.next('10 sleep 9 +').then(f => {
    expect(f.toJSON()).toEqual([new Decimal(3628809).toJSON()]);
  });
  expect(f.toJSON()).toEqual([]);
  await f.next();
  expect(f.toJSON()).toEqual([new Decimal(3628809).toJSON()]);
});

test('errors on unknown command, async', async () => {
  await expect(F().promise('abc')).rejects.toThrow(
    `Word is not defined: "abc"`
  );
});

test('errors on unknown command in child, async', async () => {
  await expect(F().promise('[ abc ] in')).rejects.toThrow(
    `Word is not defined: "abc"`
  );
});

test('errors on unknown command in child, async 2', async () => {
  await expect(F().promise('[ abc ] await')).rejects.toThrow(
    `Word is not defined: "abc"`
  );
});

test('should await on a future', async () => {
  const future = { '@@Future': { $undefined: true } };

  const f = F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  expect(f.toJSON()).toEqual([future, new Decimal(9).toJSON()]);

  await f.promise('[ await ] dip');

  expect(f.toJSON()).toEqual([
    [new Decimal(3628800).toJSON()],
    new Decimal(9).toJSON()
  ]);
  expect(f.eval('slip').toJSON()).toEqual([
    new Decimal(3628800).toJSON(),
    new Decimal(9).toJSON()
  ]);
});
