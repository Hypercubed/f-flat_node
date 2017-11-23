import test from 'ava';
import { F, fSync, Action } from './setup';

test('should push quotes', t => {
  t.deepEqual(fSync('[ 1 ] [ 2 ]'), [[1], [2]], 'should push');
  t.deepEqual(fSync('[1] [2]'), [[1], [2]], 'should handle missing whitespace');
});

test('should not eval within quote', t => {
  const f = new F().eval('[ 1 ] [ 1 2 + ]');
  t.is(f.stack.length, 2);
  t.deepEqual(f.toJSON()[0], [1]);
  t.is(f.stack[1].toString(), '1,2,+');
  t.truthy(f.stack[1][2] instanceof Object);
});

test('should add quotes', t => {
  t.deepEqual(fSync('[1] [2] +'), [[1, 2]], 'should add');
});

test('should mul quotes', t => {
  const plus = new Action('+').toJSON();
  t.deepEqual(
    fSync('[ 1 2 + ] 2 *'),
    [
      [
        1,
        2,
        plus,
        1,
        2,
        plus
      ]
    ],
    'should multiply'
  );
});

test('should test equality', t => {
  t.deepEqual(fSync('[ 1 2 + ] [ 1 2 ] ='), [false]);
  t.deepEqual(fSync('[ 1 2 + ] [ 1 2 + ] ='), [true]);
});

test('should eval quotes', t => {
  const f = new F().eval('[1 2 +]');
  t.is(f.stack.length, 1);
  t.deepEqual(f.stack[0].length, 3);
  t.deepEqual(f.eval('eval').toJSON(), [3]);
});

test('should zip quotes', t => {
  const f = new F().eval('[ 1 2 + ] [ 4 ]');
  t.deepEqual(f.stack.length, 2);
  t.deepEqual(f.stack[0].length, 3);
  t.deepEqual(f.stack[1].length, 1);

  f.eval('*');
  t.deepEqual(f.stack.length, 1);
  t.is(f.stack[0].toString(), '1,4,2,4,+,4');
});

test('should join lists', t => {
  const f = new F().eval('[ 1 2 + ] ","');
  t.deepEqual(f.stack.length, 2);
  t.deepEqual(f.stack[0].length, 3);
  t.deepEqual(f.stack[1].length, 1);

  f.eval('*');
  t.deepEqual(f.stack.length, 1);
  t.deepEqual(f.stack[0].toString(), '1,2,+');
});
