import test from 'ava';
import { F, fJSON, fValue, fValues, D, Word } from './helpers/setup';

test('should push quotes', async t => {
  t.deepEqual(await fValues('[ 1 ] [ 2 ]'), [[1], [2]], 'should push');
  t.deepEqual(await fValues('[1] [2]'), [[1], [2]], 'should handle missing whitespace');
});

test('should not eval within quote', async t => {
  const f = F().eval('[ 1 ] [ 1 2 + ]');
  t.is(f.stack.length, 2);
  t.deepEqual(f.toJSON()[0], [D(1)]);
  t.is(f.stack[1].toString(), '1,2,+');
  t.truthy(f.stack[1][2] instanceof Object);
});

test('should add quotes', async t => {
  t.deepEqual(await fValues('[1] [2] +'), [[1, 2]], 'should add');
});

test('should mul quotes', async t => {
  const plus = new Word('+').toJSON();
  t.deepEqual(
    await fJSON('[ 1 2 + ] 2 *'),
    [
      [
        D(1),
        D(2),
        plus,
        D(1),
        D(2),
        plus
      ]
    ],
    'should multiply'
  );
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('[ 1 2 + ] [ 1 2 ] ='), [false]);
  t.deepEqual(await fJSON('[ 1 2 + ] [ 1 2 + ] ='), [true]);
});

test('should eval quotes', async t => {
  const f = F().eval('[1 2 +]');
  t.is(f.stack.length, 1);
  t.deepEqual((f.stack[0] as any[]).length, 3);
  t.deepEqual(f.eval('eval').toJSON(), [D(3)]);
});

test('should zip quotes', async t => {
  const f = F().eval('[ 1 2 + ] [ 4 ]');
  t.deepEqual(f.stack.length, 2);
  t.deepEqual((f.stack[0] as any[]).length, 3);
  t.deepEqual((f.stack[1] as any[]).length, 1);

  f.eval('*');
  t.deepEqual(f.stack.length, 1);
  t.is(f.stack[0].toString(), '1,4,2,4,+,4');
});

test('should join lists', async t => {
  const f = F().eval('[ 1 2 + ] ","');
  t.deepEqual(f.stack.length, 2);
  t.deepEqual((f.stack[0] as any).length, 3);
  t.deepEqual((f.stack[1] as any).length, 1);

  f.eval('*');
  t.deepEqual(f.stack.length, 1);
  t.deepEqual(f.stack[0].toString(), '1,2,+');
});

test('should <=> arrays by length', async t => {
  t.deepEqual(await fValue('[1 2 3] [4 5 6] <=>'), 0);
  t.deepEqual(await fValue('[1 2 3 4] [4 5 6] <=>'), 1);
  t.deepEqual(await fValue('[1 2 3] [4 5 6 7] <=>'), -1);
});
