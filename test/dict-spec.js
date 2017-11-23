import test from 'ava';
import { F, fSync } from './setup';

test('should sto and rcl', t => {
  const action = [1, 2, { type: '@@Action', value: '+' } ];
  t.deepEqual(fSync('1 2 "x" sto 3 x x'), [1, 3, 2, 2], 'should sto a value');
  t.deepEqual(fSync('1 2 x: sto 3 x x'), [1, 3, 2, 2], 'should sto a value');
  t.deepEqual(fSync('[ 1 2 + ] x: sto 3 x: rcl x: rcl'), [3, action, action], 'should sto an array');
  t.deepEqual(fSync('[ 1 2 + ] : x: sto 3 x: rcl x: rcl'), [3, { type: '@@Action', value: action }, { type: '@@Action', value: action }], 'should sto an action');
  t.deepEqual(fSync('[ 1 2 + ] : x: sto 3 x x'), [3, 3, 3], 'should execute actions');
});

test('should sto and rcl nested props', t => {
  const action = [1, 2, { type: '@@Action', value: '+' } ];
  t.deepEqual(fSync('{ x: 123 } test: sto test'), [{ x: 123 }], 'should sto an object');
  t.deepEqual(fSync('{ x: 123 } test: sto test.x: rcl'), [123], 'should rcl a value in a stored object');
  t.deepEqual(fSync('123 test.x: sto test.x: rcl'), [123], 'should create objects');
  t.deepEqual(fSync('456 test.x.y: sto test.x: rcl'), [{y: 456}], 'should create objects');
  t.deepEqual(fSync('{ x: [ 1 2 + ] : } test: sto test.x: rcl'), [{ type: '@@Action', value: action }], 'should sto and rcl an action in a stored object');
});

test('should sto and rcl nested properties in a fork', t => {
  t.deepEqual(fSync('{ x: 123 } test: sto [ 456 test.y: sto test ] fork test'), [[{ x: 123, y: 456 }], { x: 123 }]);
  t.deepEqual(fSync('{ x: 123 } test: sto [ 456 test.y.z: sto test ] fork test'), [[{ x: 123, y: { z: 456 } }], { x: 123 }]);
});

test('cannot overwrite defined words', t => {
  t.throws(() => {
    fSync('123 x: sto 456 x: sto');
  });

  t.throws(() => {
    fSync('123 x.y.z: sto 456 x.y: sto');
  });
});

test('cannot delete defined words', t => {
  t.throws(() => {
    fSync('123 x: sto x: delete');
  });

  t.throws(() => {
    fSync('123 x.y.z: sto x.y: delete');
  });
});

test('should overwrite properties in a fork', t => {
  t.deepEqual(
    fSync('"outsite-a" a: sto a [ "in-fork-a" a: sto a ] fork a'),
    [ 'outsite-a', ['in-fork-a'], 'outsite-a' ],
    'fork should isolate child scope'
  );
  t.deepEqual(
    fSync('"outsite-a" a: sto a [ "in-in-b" b: sto a b ] in a b'),
    [ 'outsite-a', ['outsite-a', 'in-in-b'], 'outsite-a', 'in-in-b'],
    'in does not isolate child scope'
  );
});

test('should isloate definitions in a fork', t => {
  t.notThrows(() => {
    fSync('[ "in-fork-a" a: sto a ] fork');
  });
  t.throws(() => {
    fSync('[ "in-fork-a" a: sto a ] fork a');
  });
});

test('should delete properties in a fork', t => {
  t.deepEqual(fSync('123 x: sto x'), [123]);
  t.deepEqual(fSync('123 x: sto [ x ] fork x'), [[123], 123]);
  t.deepEqual(fSync('123 x: sto [ x: delete x: rcl ] fork x'), [[null], 123]);
});

test('should execute stored actions', t => {
  t.deepEqual(fSync('[ 1 2 + ] : "x" sto x x'), [3, 3], 'should sto an action');
  t.deepEqual(fSync('[ 1 2 + ] : x: sto x x'), [3, 3], 'should sto an action');
  t.deepEqual(fSync('{ x: [ 1 2 + ] : } test: sto test.x'), [3], 'should sto and rcl an action in a stored object');
});

test('should return null on undefined', t => { // maybe should be undefined?
  t.deepEqual(fSync('x: rcl'), [null]);
  t.deepEqual(fSync('x.y.z: rcl'), [null]);
});

test('create actions', t => {
  const evalAction = { type: '@@Action', value: 'eval' };

  t.deepEqual(fSync('"eval" :'), [evalAction]);
  t.deepEqual(fSync('eval:'), [evalAction]);
  t.deepEqual(fSync('[ eval ] :'), [evalAction]);
});

test('should expand internal actions', t => {
  const evalAction = { type: '@@Action', value: 'eval' };

  t.deepEqual(fSync('eval: expand'), [evalAction]);
  t.deepEqual(fSync('[ eval ] : expand'), [evalAction]);
  t.deepEqual(fSync('[ eval ] expand'), [[evalAction]]);
  t.deepEqual(fSync('{ x: eval: } expand'), [{ x: evalAction }]);
  t.deepEqual(fSync('{ x: [ eval ] : } expand'), [{ x: evalAction }]);
  t.deepEqual(fSync('{ x: [ eval ] } expand'), [{ x: [evalAction] }]);
});

test('should expand defined actions', t => {
  const slipAction = { type: '@@Action', value: [
    { type: '@@Action', value: 'q<' },
    { type: '@@Action', value: 'eval' },
    { type: '@@Action', value: 'q>' }
  ]};

  t.deepEqual(fSync('slip: expand'), [slipAction]);
  t.deepEqual(fSync('[ slip ] : expand'), [slipAction]);
  t.deepEqual(fSync('[ slip ] expand'), [[slipAction]]);
  t.deepEqual(fSync('{ x: slip: } expand'), [{ x: slipAction }]);
  t.deepEqual(fSync('{ x: [ slip ] : } expand'), [{ x: slipAction }]);
  t.deepEqual(fSync('{ x: [ slip ] } expand'), [{ x: [ slipAction ] }]);
});
