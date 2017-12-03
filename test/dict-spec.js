import test from 'ava';
import { F, fSyncJSON, fSyncValues, Word, Sentence, D } from './setup';

test('should sto and rcl', t => {
  const plus = new Word('+').toJSON();
  const action = new Sentence(D([1, 2, plus])).toJSON();
  t.deepEqual(fSyncValues('1 2 "x" sto 3 x x'), [1, 3, 2, 2], 'should sto a value');
  t.deepEqual(fSyncValues('1 2 x: sto 3 x x'), [1, 3, 2, 2], 'should sto a value');
  t.deepEqual(
    fSyncJSON('[ 1 2 + ] x: sto 3 x: rcl x: rcl'),
    D([3, [1, 2, plus], [1, 2, plus]]),
    'should sto an array'
  );
  t.deepEqual(
    fSyncJSON('[ 1 2 + ] : x: sto 3 x: rcl x: rcl'),
    [D(3), action, action],
    'should sto an action'
  );
  t.deepEqual(
    fSyncValues('[ 1 2 + ] : x: sto 3 x x'),
    [3, 3, 3],
    'should execute actions'
  );
});

test('should sto and rcl nested props', t => {
  const plus = new Word('+').toJSON();
  const action = new Sentence([D(1), D(2), plus]).toJSON();
  t.deepEqual(
    fSyncJSON('{ x: 123 } test: sto test'),
    [{ x: D(123) }],
    'should sto an object'
  );
  t.deepEqual(
    fSyncValues('{ x: 123 } test: sto test.x: rcl'),
    [123],
    'should rcl a value in a stored object'
  );
  t.deepEqual(
    fSyncValues('123 test.x: sto test.x: rcl'),
    [123],
    'should create objects'
  );
  t.deepEqual(
    fSyncJSON('456 test.x.y: sto test.x: rcl'),
    [{ y: D(456) }],
    'should create objects'
  );
  t.deepEqual(
    fSyncJSON('{ x: [ 1 2 + ] : } test: sto test.x: rcl'),
    [action],
    'should sto and rcl an action in a stored object'
  );
});

test('should sto and rcl nested properties in a fork', t => {
  t.deepEqual(
    fSyncJSON('{ x: 123 } test: sto [ 456 test.y: sto test ] fork test'),
    [[{ x: D(123), y: D(456) }], { x: D(123) }]
  );
  t.deepEqual(
    fSyncJSON('{ x: 123 } test: sto [ 456 test.y.z: sto test ] fork test'),
    [[{ x: D(123), y: { z: D(456) } }], { x: D(123) }]
  );
});

test('cannot overwrite defined words', t => {
  t.throws(() => {
    fSyncJSON('123 x: sto 456 x: sto');
  });

  t.throws(() => {
    fSyncJSON('123 x.y.z: sto 456 x.y: sto');
  });
});

test('cannot delete defined words', t => {
  t.throws(() => {
    fSyncJSON('123 x: sto x: delete');
  });

  t.throws(() => {
    fSyncJSON('123 x.y.z: sto x.y: delete');
  });
});

test('should overwrite properties in a fork', t => {
  t.deepEqual(
    fSyncJSON('"outsite-a" a: sto a [ "in-fork-a" a: sto a ] fork a'),
    ['outsite-a', ['in-fork-a'], 'outsite-a'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    fSyncJSON('"outsite-a" a: sto a [ "in-in-b" b: sto a b ] in a b'),
    ['outsite-a', ['outsite-a', 'in-in-b'], 'outsite-a', 'in-in-b'],
    'in does not isolate child scope'
  );
});

test('should isloate definitions in a fork', t => {
  t.notThrows(() => {
    fSyncJSON('[ "in-fork-a" a: sto a ] fork');
  });
  t.throws(() => {
    fSyncJSON('[ "in-fork-a" a: sto a ] fork a');
  });
});

test('should delete properties in a fork', t => {
  t.deepEqual(fSyncValues('123 x: sto x'), [123]);
  t.deepEqual(fSyncValues('123 x: sto [ x ] fork x'), [[123], 123]);
  t.deepEqual(fSyncValues('123 x: sto [ x: delete x: rcl ] fork x'), [
    [null],
    123
  ]);
});

test('should execute stored actions', t => {
  t.deepEqual(
    fSyncValues('[ 1 2 + ] : "x" sto x x'),
    [3, 3],
    'should sto an action'
  );
  t.deepEqual(
    fSyncValues('[ 1 2 + ] : x: sto x x'),
    [3, 3],
    'should sto an action'
  );
  t.deepEqual(
    fSyncValues('{ x: [ 1 2 + ] : } test: sto test.x'),
    [3],
    'should sto and rcl an action in a stored object'
  );
});

test('should return null on undefined', t => {
  // maybe should be undefined?
  t.deepEqual(fSyncJSON('x: rcl'), [null]);
  t.deepEqual(fSyncJSON('x.y.z: rcl'), [null]);
});

test('create actions', t => {
  const evalAction = new Word('eval').toJSON();

  t.deepEqual(fSyncJSON('"eval" :'), [evalAction]);
  t.deepEqual(fSyncJSON('eval:'), [evalAction]);
  t.deepEqual(fSyncJSON('[ eval ] :'), [evalAction]);
});

test('should expand internal actions', t => {
  const evalAction = new Word('eval').toJSON();

  t.deepEqual(fSyncJSON('eval: expand'), [evalAction]);
  t.deepEqual(fSyncJSON('[ eval ] : expand'), [evalAction]);
  t.deepEqual(fSyncJSON('[ eval ] expand'), [[evalAction]]);
  t.deepEqual(fSyncJSON('{ x: eval: } expand'), [{ x: evalAction }]);
  t.deepEqual(fSyncJSON('{ x: [ eval ] : } expand'), [{ x: evalAction }]);
  t.deepEqual(fSyncJSON('{ x: [ eval ] } expand'), [{ x: [evalAction] }]);
});

test('should expand defined actions', t => {
  const qi = new Word('q<').toJSON();
  const evalAction = new Word('eval').toJSON();
  const qo = new Word('q>').toJSON();
  const slipAction = new Sentence([qi, evalAction, qo]).toJSON();

  t.deepEqual(fSyncJSON('slip: expand'), [slipAction]);
  t.deepEqual(fSyncJSON('[ slip ] : expand'), [slipAction]);
  t.deepEqual(fSyncJSON('[ slip ] expand'), [[slipAction]]);
  t.deepEqual(fSyncJSON('{ x: slip: } expand'), [{ x: slipAction }]);
  t.deepEqual(fSyncJSON('{ x: [ slip ] : } expand'), [{ x: slipAction }]);
  t.deepEqual(fSyncJSON('{ x: [ slip ] } expand'), [{ x: [slipAction] }]);
});
