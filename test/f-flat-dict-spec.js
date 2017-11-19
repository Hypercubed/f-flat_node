import test from 'ava';
import { fSync } from './setup';

test('should sto and rcl', t => {
  const action = [1, 2, { type: '@@Action', value: '+' } ];
  t.deepEqual(fSync('1 2 "x" sto 3 "x" rcl "x" rcl'), [1, 3, 2, 2], 'should sto a value');
  t.deepEqual(fSync('1 2 x: sto 3 x: rcl x: rcl'), [1, 3, 2, 2], 'should sto a value');
  t.deepEqual(fSync('[ 1 2 + ] x: sto 3 x: rcl x: rcl'), [3, action, action], 'should sto an array');
  t.deepEqual(fSync('[ 1 2 + ] action x: sto 3 x: rcl x: rcl'), [3, { type: '@@Action', value: action }, { type: '@@Action', value: action }], 'should sto an action');
});

test('should sto and rcl nest props', t => {
  const action = [1, 2, { type: '@@Action', value: '+' } ];
  t.deepEqual(fSync('{ x: 123 } test: sto test'), [{ x: 123 }], 'should sto an object');
  t.deepEqual(fSync('{ x: 123 } test: sto test.x: rcl'), [123], 'should rcl a value in a stored object');
  t.deepEqual(fSync('{ x: 123 } test: sto 456 test.y: sto test'), [{ x: 123, y: 456 }], 'should sto and rcl a value in a stored object');
  t.deepEqual(fSync('{ x: [ 1 2 + ] action } test: sto test.x: rcl'), [{ type: '@@Action', value: action }], 'should sto and rcl an action in a stored object');
  t.deepEqual(fSync('{ x: 123, y: {} } test: sto 456 test.y.z: sto test'), [{ x: 123, y: { z: 456 } }], 'should sto and rcl a value in a stored object');
});

test('should execute stored actions', t => {
  t.deepEqual(fSync('[ 1 2 + ] action "x" sto x x'), [3, 3], 'should sto an action');
  t.deepEqual(fSync('[ 1 2 + ] action x: sto x x'), [3, 3], 'should sto an action');
  t.deepEqual(fSync('{ x: [ 1 2 + ] action } test: sto test.x'), [3], 'should sto and rcl an action in a stored object');
});

test('should return null on undefined', t => {
  t.deepEqual(fSync('x: rcl'), [null]);
  t.deepEqual(fSync('x.y.z: rcl'), [null]);
});

test('expand', t => {
  const evalAction = { type: '@@Action', value: 'eval' };
  const slipAction = [
    { type: '@@Action', value: 'q<' },
    { type: '@@Action', value: 'eval' },
    { type: '@@Action', value: 'q>' }
  ];

  t.deepEqual(fSync('eval: expand'), [evalAction]);
  t.deepEqual(fSync('[ eval ] expand'), [[evalAction]]);
  t.deepEqual(fSync('{ x: eval: } expand'), [{ x: evalAction }]);
  t.deepEqual(fSync('slip: expand'), slipAction);
  t.deepEqual(fSync('[ slip ] expand'), [slipAction]);
  t.deepEqual(fSync('{ x: slip: } expand'), [{ x: slipAction }]);
});

test('in/fork', t => {
  t.deepEqual(
    fSync('"out" a: sto [ "in" a: sto a ] fork a'),
    [ ['in'], 'out'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    fSync('"out" a: sto [ "in" b: sto a ] in b'),
    [['out'], 'in'],
    'in does not isolate child scope'
  );
});
