import * as nock from 'nock';

import { F, fJSON, fValues, D, Word } from './helpers/setup';

const future = { '@@Future': { $undefined: true } };

const good = {
  id: 123456,
  name: 'f-flat_node'
};

nock('https://api.github.com/')
  .get('/users/Hypercubed/repos/')
  .reply(200, good);

test('yield', async () => {
  const yieldAction = new Word('yield').toJSON();
  const plus = new Word('+').toJSON();
  expect(await fJSON('[1 2 yield 4 5 yield 6 7] fork')).toEqual(
    D([
      [1, 2],
      [4, 5, yieldAction, 6, 7]
    ])
  );
  expect(await fJSON('[1 2 yield 4 5 yield 6 7] fork fork')).toEqual(
    D([
      [1, 2],
      [4, 5],
      [6, 7]
    ])
  );
  expect(await fJSON('[1 2 + yield 4 5 + ] fork')).toEqual(
    D([[3], [4, 5, plus]])
  );
  expect(await fJSON('[1 2 + yield 4 5 + ] fork drop')).toEqual([[D(3)]]);
});

/* test('multiple yields', async t => {
  t.deepEqual(
    await fJSON('[1 2 + yield 4 5 + yield ] fork fork drop'),
    [3, 9],
    'multiple yields'
  );
  t.deepEqual(
    await fJSON('count* [ fork ] 10 times drop'),
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
  expect(await fValues('[ 10 ! ] 100 delay 4 5 + +')).toEqual([3628809]);
});

/* test('should fork', async t => {
  const f = await F().promise('[ 100 sleep 10 ! ] fork 4 5 +');
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
  expect(await fValues('1 [ 100 sleep 10 ! ] await 4 5 +')).toEqual([
    1,
    [3628800],
    9
  ]);
});

test('all', async () => {
  expect(await fValues('[ 100 sleep 10 ! ] dup pair all')).toEqual([
    [[3628800], [3628800]]
  ]);
});

test('should generate promise 1', async () => {
  return F()
    .promise('100 sleep 10 !')
    .then(f => {
      expect(f.toJSON()).toEqual([D(3628800)]);
    });
});

/* test('should generate promise 2', async t => {
  return F('100 sleep 10 !').promise().then((f) => {
    t.deepEqual(f.toJSON(), [3628800]);
  });
}); */

test('should resolve promise even on sync', async () => {
  return F()
    .promise('10 !')
    .then(f => {
      expect(f.toJSON()).toEqual([D(3628800)]);
    });
});

test('should work with async/await', async () => {
  expect(await fValues('100 sleep 10 !')).toEqual([3628800]);
});

test('should fetch', async () => {
  expect(
    await fJSON('"https://api.github.com/users/Hypercubed/repos/" fetch-json')
  ).toEqual([good]);
});

test('sleep', async () => {
  expect(await fValues('10 100 sleep 20 +')).toEqual([30]);
});

test('multiple async', async () => {
  expect(await fValues('10 100 sleep 20 + 100 sleep 15 +')).toEqual([45]);
  expect(
    await fValues('10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 +')
  ).toEqual([45]);
});

test('multiple async in children', async () => {
  expect(await fValues('[ 10 100 sleep 20 + 100 sleep 15 + ] await')).toEqual([
    [45]
  ]);
  expect(
    await fValues('[ 10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 + ] await')
  ).toEqual([[45]]);
});

test('should await on multiple promises', async () => {
  const f = F();
  await f.promise('100 sleep 10 !');
  expect(f.toJSON()).toEqual([D(3628800)]);
  await f.promise('100 sleep 9 +');
  expect(f.toJSON()).toEqual([D(3628809)]);
});

test('multiple promises', async () => {
  const f = F();
  f.promise('1000 sleep 10 !');
  expect(f.toJSON()).toEqual([]);
  f.promise('1000 sleep 9 +');
  expect(f.toJSON()).toEqual([]);
  await f.promise();
  expect(f.toJSON()).toEqual([D(3628809)]);
});

test('multiple promises correct order', async () => {
  // todo
  const f = F();
  f.next('1000 sleep 10 !').then(f => {
    expect(f.toJSON()).toEqual([D(3628800)]);
  });
  expect(f.toJSON()).toEqual([]);
  f.next('10 sleep 9 +').then(f => {
    expect(f.toJSON()).toEqual([D(3628809)]);
  });
  expect(f.toJSON()).toEqual([]);
  await f.next();
  expect(f.toJSON()).toEqual([D(3628809)]);
});

test('errors on unknown command, async', async () => {
  await expect(F().promise('abc')).rejects.toThrow('abc is not defined');
});

test('errors on unknown command in child, async', async () => {
  await expect(F().promise('[ abc ] in')).rejects.toThrow('abc is not defined');
});

test('errors on unknown command in child, async 2', async () => {
  await expect(F().promise('[ abc ] await')).rejects.toThrow('abc is not defined');
});

test('should await on a future', async () => {
  const f = F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  expect(f.toJSON()).toEqual([future, D(9)]);

  await f.promise('[ await ] dip');

  expect(f.toJSON()).toEqual(D([[3628800], 9]));
  expect(f.eval('slip').toJSON()).toEqual(D([3628800, 9]));
});
