import test from 'ava';
import { F, fSync } from './setup';

/* test('should parse', t => {
  var f = F();
  t.deepEqual(f.lexer('true', [true]);
  t.deepEqual(f.lexer('false', [false]);
}); */

test('should push booleans', t => {
  t.deepEqual(fSync('true false'), [true, false], 'should push booleans');
});

test('should not', t => {
  t.deepEqual(fSync('true ~'), [false]);
  t.deepEqual(fSync('false ~'), [true]);
  t.deepEqual(fSync('1 ~'), [false]);
  t.deepEqual(fSync('0 ~'), [true]);
  t.deepEqual(new F().eval('nan ~').stack, [NaN]);
});

test('should and', t => {
  t.deepEqual(fSync('true true *'), [true]);
  t.deepEqual(fSync('true false *'), [false]);
  t.deepEqual(fSync('false true *'), [false]);
  t.deepEqual(fSync('false false *'), [false]);

  t.deepEqual(new F().eval('true nan *').stack, [NaN]);
  t.deepEqual(new F().eval('false nan *').stack, [false]);
  t.deepEqual(new F().eval('nan true *').stack, [NaN]);
  t.deepEqual(new F().eval('nan false *').stack, [false]);
  t.deepEqual(new F().eval('nan nan *').stack, [NaN]);
});

test('should nand', t => {
  t.deepEqual(fSync('true true /'), [false]);
  t.deepEqual(fSync('true false /'), [true]);
  t.deepEqual(fSync('false true /'), [true]);
  t.deepEqual(fSync('false false /'), [true]);

  t.deepEqual(new F().eval('true nan /').stack, [NaN]);
  t.deepEqual(new F().eval('false nan /').stack, [true]);
  t.deepEqual(new F().eval('nan true /').stack, [NaN]);
  t.deepEqual(new F().eval('nan false /').stack, [true]);
  t.deepEqual(new F().eval('nan nan /').stack, [NaN]);
});

test('should or', t => {
  t.deepEqual(fSync('true true +'), [true]);
  t.deepEqual(fSync('true false +'), [true]);
  t.deepEqual(fSync('false true +'), [true]);
  t.deepEqual(fSync('false false +'), [false]);

  t.deepEqual(new F().eval('true nan +').stack, [true]);
  t.deepEqual(new F().eval('false nan +').stack, [NaN]);
  t.deepEqual(new F().eval('nan true +').stack, [true]);
  t.deepEqual(new F().eval('nan false +').stack, [NaN]);
  t.deepEqual(new F().eval('nan nan +').stack, [NaN]);
});

test('should xor', t => {
  t.deepEqual(fSync('true true -'), [false]);
  t.deepEqual(fSync('true false -'), [true]);
  t.deepEqual(fSync('false true -'), [true]);
  t.deepEqual(fSync('false false -'), [false]);

  t.deepEqual(new F().eval('true nan -').stack, [NaN]);
  t.deepEqual(new F().eval('false nan -').stack, [NaN]);
  t.deepEqual(new F().eval('nan true -').stack, [NaN]);
  t.deepEqual(new F().eval('nan false -').stack, [NaN]);
  t.deepEqual(new F().eval('nan nan -').stack, [NaN]);
});


test('should test equality', t => {
  t.deepEqual(fSync('true false ='), [false]);
  t.deepEqual(fSync('true true ='), [true]);
  t.deepEqual(fSync('false false ='), [true]);
});

test('should test equality with integers', t => {
  t.deepEqual(fSync('true 0 ='), [false]);
  t.deepEqual(fSync('true 1 ='), [true]);
  t.deepEqual(fSync('false 0 ='), [true]);
  t.deepEqual(fSync('false 1 ='), [false]);
});
