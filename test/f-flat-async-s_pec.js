import test from 'ava';
import nock from 'nock';

import {F, fSync, fAsync} from './setup';

const good = {
  id: 123456,
  name: 'f-flat_node'
};

nock('https://api.github.com/')
  .get('/users/Hypercubed/repos')
  .reply(200, good);

test('yield', t => {
  t.deepEqual(fSync('[1 2 yield 4 5 yield 6 7] fork'), [1, 2, [4, 5, {type: '@@Action', value: 'yield'}, 6, 7]], 'yield and fork');
  t.deepEqual(fSync('[1 2 yield 4 5 yield 6 7] fork fork'), [1, 2, 4, 5, [6, 7]], 'yield and fork');
  t.deepEqual(fSync('[1 2 + yield 4 5 + ] fork'), [3, [4, 5, {type: '@@Action', value: '+'}]], 'yield and fork');
  t.deepEqual(fSync('[1 2 + yield 4 5 + ] fork drop'), [3], 'yield and next');
});

test('multiple yields', t => {
  t.deepEqual(fSync('[1 2 + yield 4 5 + yield ] fork fork drop'), [3, 9], 'multiple yields');
  t.deepEqual(fSync('count* [ fork ] 10 times drop'), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'multiple yields');
});

/* test.cb('eval should yield on async with callback', t => {
  t.plan(2);
  var f = F('10 !').eval('100 sleep 4 5 + +', done);
  t.deepEqual(f.toArray(), [3628800]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toArray(), [3628809]);
    t.end();
  }
});

test.cb('constructor should yield on async with callback', t => {
  t.plan(2);
  var f = F('10 ! 100 sleep 4 5 + +', done);
  t.deepEqual(f.toArray(), [3628800]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toArray(), [3628809]);
    t.end();
  }
}); */

test('should delay', async t => {
  const f = await new F().promise('[ 10 ! ] 100 delay 4 5 + +');
  t.deepEqual(f.toArray(), [3628809]);
});

/* test('should fork', async t => {
  const f = await new F().promise('[ 100 sleep 10 ! ] fork 4 5 +');
  t.deepEqual(f.toArray(), [[], 9]);

  function done (err, f) {
    if (err) throw err;
    t.deepEqual(f.toArray(), [[], 9]);

    setTimeout(function () {
      t.deepEqual(f.toArray(), [[ 3628800 ], 9]);
      t.end();
    }, 200);
  }
}); */

test('should await', async t => {
  const f = await new F().promise('1 [ 100 sleep 10 ! ] await 4 5 +');
  t.deepEqual(f.toArray(), [1, [3628800], 9]);
});

test('all', async t => {
  const f = await new F().promise('[ 100 sleep 10 ! ] dup pair all');
  t.deepEqual(f.toArray(), [[[3628800], [3628800]]]);
});

test('should generate promise 1', t => {
  return new F().promise('100 sleep 10 !').then(f => {
    t.deepEqual(f.toArray(), [3628800]);
  });
});

/* test('should generate promise 2', t => {
  return F('100 sleep 10 !').promise().then((f) => {
    t.deepEqual(f.toArray(), [3628800]);
  });
}); */

test('should resolve promise even on sync', async t => {
  return new F().promise('10 !').then(f => {
    t.deepEqual(f.toArray(), [3628800]);
  });
});

test('should work with async/await', async t => {
  t.deepEqual(await fAsync('100 sleep 10 !'), [3628800]);
});

test('should fetch', async t => {
  t.deepEqual(await fAsync('"https://api.github.com/users/Hypercubed/repos" fetch-json'), [good], 'should fetch');
});

test('', async t => {
  t.deepEqual(await fAsync('10 100 sleep 20 +'), [30]);
});

test('multiple async', async t => {
  t.deepEqual(await fAsync('10 100 sleep 20 + 100 sleep 15 +'), [45]);
  t.deepEqual(await fAsync('10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 +'), [45]);
});

test('multiple async in children', async t => {
  t.deepEqual(await fAsync('[ 10 100 sleep 20 + 100 sleep 15 + ] await'), [[45]]);
  t.deepEqual(await fAsync('[ 10 100 sleep 20 + 100 sleep 10 + 100 sleep 5 + ] await'), [[45]]);
});

test('should await on multiple promises', async t => {
  const f = new F();
  await f.promise('100 sleep 10 !');
  t.deepEqual(f.toArray(), [3628800]);
  await f.promise('100 sleep 9 +');
  t.deepEqual(f.toArray(), [3628809]);
});

test('multiple promises', async t => {
  const f = new F();
  f.promise('1000 sleep 10 !');
  t.deepEqual(f.toArray(), []);
  f.promise('1000 sleep 9 +');
  t.deepEqual(f.toArray(), []);
  await f.promise();
  t.deepEqual(f.toArray(), [3628809]);
});

test('multiple promises correct order', async t => {  // todo
  const f = new F();
  f.next('1000 sleep 10 !').then(f => {
    t.deepEqual(f.toArray(), [3628800]);
  });
  t.deepEqual(f.toArray(), []);
  f.next('10 sleep 9 +').then(f => {
    t.deepEqual(f.toArray(), [3628809]);
  });
  t.deepEqual(f.toArray(), []);
  await f.next();
  t.deepEqual(f.toArray(), [3628809]);
});

test('errors on unknown command, async', async t => {
  t.throws(new F().promise('abc'));
});

test('errors on unknown command in child, async', t => {
  t.throws(new F().promise('[ abc ] in'));
});

test('errors on unknown command in child, async 2', t => {
  t.throws(new F().promise('[ abc ] await'));
});

test('should await on a future', async t => {
  const f = new F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  t.deepEqual(f.toArray(), [{type: '@@Future'}, 9]);

  await f.promise('[ await ] dip');

  t.deepEqual(f.toArray(), [[3628800], 9]);
  t.deepEqual(f.eval('slip').toArray(), [3628800, 9]);
});
