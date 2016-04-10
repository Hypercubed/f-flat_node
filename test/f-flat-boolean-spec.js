import test from 'ava';
import {fSync} from './setup';

/* test('should parse', t => {
  var f = F();
  t.deepEqual(f.lexer('true', [true]);
  t.deepEqual(f.lexer('false', [false]);
}); */

test('should push booleans', t => {
  t.deepEqual(fSync('true false'), [true, false], 'should push booleans');
});

test('should or', t => {
  t.deepEqual(fSync('true false +'), [true]);
  t.deepEqual(fSync('true true +'), [true]);
  t.deepEqual(fSync('false false +'), [false]);
});

test('should xor', t => {
  t.deepEqual(fSync('true false -'), [true]);
  t.deepEqual(fSync('true true -'), [false]);
  t.deepEqual(fSync('false false -'), [false]);
});

test('should and', t => {
  t.deepEqual(fSync('true false /'), [true]);
  t.deepEqual(fSync('true true /'), [false]);
  t.deepEqual(fSync('false false /'), [true]);
});

test('should nand', t => {
  t.deepEqual(fSync('true false *'), [false]);
  t.deepEqual(fSync('true true *'), [true]);
  t.deepEqual(fSync('false false *'), [false]);
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
