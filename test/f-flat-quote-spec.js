import test from 'ava';
import {F, fSync} from './setup';

test('should push quotes', t => {
  t.same(fSync('[ 1 ] [ 2 ]'), [[1], [2]], 'should push');
  t.same(fSync('[1] [2]'), [[1], [2]], 'should handle missing whitespace');
});

test('should not eval within quote', t => {
  const f = new F().eval('[ 1 ] [ 1 2 + ]');
  t.is(f.stack.length, 2);
  t.same(f.toArray()[0], [1]);
  t.is(f.stack[1].toString(), '1,2,+');
  t.ok(f.stack[1][2] instanceof Object);
});

test('should add quotes', t => {
  t.same(fSync('[1] [2] +'), [[1, 2]], 'should add');
});

test('should mul quotes', t => {
  t.same(fSync('[ 1 2 + ] 2 *'), [[1, 2, {type: '@@Action', value: '+'}, 1, 2, {type: '@@Action', value: '+'}]], 'should multiply');
});

test('should test isity', t => {
  t.same(fSync('[ 1 2 + ] [ 1 2 ] ='), [false]);
  t.same(fSync('[ 1 2 + ] [ 1 2 + ] ='), [true]);
});

test('should eval quotes', t => {
  const f = new F().eval('[1 2 +]');
  t.is(f.stack.length, 1);
  t.same(f.stack[0].length, 3);
  t.same(f.eval('eval').toArray(), [3]);
});

test('should zip quotes', t => {
  const f = new F().eval('[ 1 2 + ] [ 4 ]');
  t.same(f.stack.length, 2);
  t.same(f.stack[0].length, 3);
  t.same(f.stack[1].length, 1);

  f.eval('*');
  t.same(f.stack.length, 1);
  t.is(f.stack[0].toString(), '1,4,2,4,+,4');
});

test('should join lists', t => {
  const f = new F().eval('[ 1 2 + ] ","');
  t.same(f.stack.length, 2);
  t.same(f.stack[0].length, 3);
  t.same(f.stack[1].length, 1);

  f.eval('*');
  t.same(f.stack.length, 1);
  t.same(f.stack[0].toString(), '1,2,+');
});
