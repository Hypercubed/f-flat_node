import test from 'ava';
import nock from 'nock';

import { F, fSyncJSON, fSyncValues, fAsyncJSON, fAsyncValues, D, Word } from './setup';

const future = { '@@Future': { '$undefined':true } };

const good = {
  id: 123456,
  name: 'f-flat_node'
};

nock('https://api.github.com/')
  .get('/users/Hypercubed/repos/')
  .reply(200, good);

test('yield', t => {
  const yieldAction = new Word('yield').toJSON();
  const plus = new Word('+').toJSON();
  t.deepEqual(
    fSyncJSON('[1 2 yield 4 5 yield 6 7] fork'),
    D([[1, 2], [4, 5, yieldAction, 6, 7]]),
    'yield and fork'
  );
  t.deepEqual(
    fSyncJSON('[1 2 yield 4 5 yield 6 7] fork fork'),
    D([[1, 2], [4, 5], [6, 7]]),
    'yield and fork'
  );
  t.deepEqual(
    fSyncJSON('[1 2 + yield 4 5 + ] fork'),
    D([ [3], [4, 5, plus]]),
    'yield and fork'
  );
  t.deepEqual(fSyncJSON('[1 2 + yield 4 5 + ] fork drop'), [[D(3)]], 'yield and next');
});

/* test('multiple yields', t => {
  t.deepEqual(
    fSyncJSON('[1 2 + yield 4 5 + yield ] fork fork drop'),
    [3, 9],
    'multiple yields'
  );
  t.deepEqual(
    fSyncJSON('count* [ fork ] 10 times drop'),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'multiple yields'
  );
}); */

/* test.cb('eval should yield on async with callback', t => {
  t.plan(2);
  var f = F('10 !').eval('100 sleep 4 5 + +', done);
  t.deepEqual(f.toJSON(), [3628800]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toJSON(), [3628809]);
    t.end();
  }
});

test.cb('constructor should yield on async with callback', t => {
  t.plan(2);
  var f = F('10 ! 100 sleep 4 5 + +', done);
  t.deepEqual(f.toJSON(), [3628800]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toJSON(), [3628809]);
    t.end();
  }
}); */

test('should delay', async t => {
  t.deepEqual(await fAsyncValues('[ 10 ! ] 100 delay 4 5 + +'), [3628809]);
});

/* test('should fork', async t => {
  const f = await new F().promise('[ 100 sleep 10 ! ] fork 4 5 +');
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

test('should await', async t => {
  t.deepEqual(await fAsyncValues('1 [ 100 sleep 10 ! ] await 4 5 +'), [1, [3628800], 9]);
});

test('all', async t => {
  t.deepEqual(await fAsyncValues('[ 100 sleep 10 ! ] dup pair all'), [[[3628800], [3628800]]]);
});

test('should generate promise 1', t => {
  return new F().promise('100 sleep 10 !').then(f => {
    t.deepEqual(f.toJSON(), [D(3628800)]);
  });
});

/* test('should generate promise 2', t => {
  return F('100 sleep 10 !').promise().then((f) => {
    t.deepEqual(f.toJSON(), [3628800]);
  });
}); */

test('should resolve promise even on sync', async t => {
  return new F().promise('10 !').then(f => {
    t.deepEqual(f.toJSON(), [D(3628800)]);
  });
});

test('should work with async/await', async t => {
  t.deepEqual(await fAsyncValues('100 sleep 10 !'), [3628800]);
});

test('should fetch', async t => {
  t.deepEqual(
    await fAsyncJSON('"https://api.github.com/users/Hypercubed/repos/" fetch-json'),
    [good],
    'should fetch'
  );
});

test('', async t => {
  t.deepEqual(await fAsyncValues('10 100 sleep 20 +'), [30]);
});

test('multiple async', async t => {
  t.deepEqual(await fAsyncValues('10 100 sleep 20 + 100 sleep 15 +'), [45]);
  t.deepEqual(await fAsyncValues('10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 +'), [
    45
  ]);
});

test('multiple async in children', async t => {
  t.deepEqual(await fAsyncValues('[ 10 100 sleep 20 + 100 sleep 15 + ] await'), [
    [45]
  ]);
  t.deepEqual(
    await fAsyncValues('[ 10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 + ] await'),
    [[45]]
  );
});

test('should await on multiple promises', async t => {
  const f = new F();
  await f.promise('100 sleep 10 !');
  t.deepEqual(f.toJSON(), [D(3628800)]);
  await f.promise('100 sleep 9 +');
  t.deepEqual(f.toJSON(), [D(3628809)]);
});

test('multiple promises', async t => {
  const f = new F();
  f.promise('1000 sleep 10 !');
  t.deepEqual(f.toJSON(), []);
  f.promise('1000 sleep 9 +');
  t.deepEqual(f.toJSON(), []);
  await f.promise();
  t.deepEqual(f.toJSON(), [D(3628809)]);
});

test('multiple promises correct order', async t => {
  // todo
  const f = new F();
  f.next('1000 sleep 10 !').then(f => {
    t.deepEqual(f.toJSON(), [D(3628800)]);
  });
  t.deepEqual(f.toJSON(), []);
  f.next('10 sleep 9 +').then(f => {
    t.deepEqual(f.toJSON(), [D(3628809)]);
  });
  t.deepEqual(f.toJSON(), []);
  await f.next();
  t.deepEqual(f.toJSON(), [D(3628809)]);
});

test('errors on unknown command, async', async t => {
  await t.throws(new F().promise('abc'));
});

test('errors on unknown command in child, async', async t => {
  await t.throws(new F().promise('[ abc ] in'));
});

test('errors on unknown command in child, async 2', async t => {
  await t.throws(new F().promise('[ abc ] await'));
});

test('should await on a future', async t => {
  const f = new F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  t.deepEqual(f.toJSON(), [future, D(9)]);

  await f.promise('[ await ] dip');

  t.deepEqual(f.toJSON(), D([[3628800], 9]));
  t.deepEqual(f.eval('slip').toJSON(), D([3628800, 9]));
});
