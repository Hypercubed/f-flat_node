import test from 'ava';
import { F, fSyncJSON, fSyncStack } from './setup';

/* test('should parse', t => {
  var f = F();
  t.deepEqual(f.lexer('true', [true]);
  t.deepEqual(f.lexer('false', [false]);
}); */

test('should push booleans', t => {
  t.deepEqual(fSyncJSON('true false'), [true, false], 'should push booleans');
});

test('should not', t => {
  t.deepEqual(fSyncJSON('true ~'), [false]);
  t.deepEqual(fSyncJSON('false ~'), [true]);
  t.deepEqual(fSyncJSON('1 ~'), [false]);
  t.deepEqual(fSyncJSON('0 ~'), [true]);
  t.deepEqual(fSyncStack('nan ~'), [NaN]);
});

test('should and', t => {
  t.deepEqual(fSyncJSON('true true *'), [true]);
  t.deepEqual(fSyncJSON('true false *'), [false]);
  t.deepEqual(fSyncJSON('false true *'), [false]);
  t.deepEqual(fSyncJSON('false false *'), [false]);

  t.deepEqual(fSyncStack('true nan *'), [NaN]);
  t.deepEqual(fSyncStack('false nan *'), [false]);
  t.deepEqual(fSyncStack('nan true *'), [NaN]);
  t.deepEqual(fSyncStack('nan false *'), [false]);
  t.deepEqual(fSyncStack('nan nan *'), [NaN]);
});

test('should nand', t => {
  t.deepEqual(fSyncJSON('true true /'), [false]);
  t.deepEqual(fSyncJSON('true false /'), [true]);
  t.deepEqual(fSyncJSON('false true /'), [true]);
  t.deepEqual(fSyncJSON('false false /'), [true]);

  t.deepEqual(fSyncStack('true nan /'), [NaN]);
  t.deepEqual(fSyncStack('false nan /'), [true]);
  t.deepEqual(fSyncStack('nan true /'), [NaN]);
  t.deepEqual(fSyncStack('nan false /'), [true]);
  t.deepEqual(fSyncStack('nan nan /'), [NaN]);
});

test('should or', t => {
  t.deepEqual(fSyncJSON('true true +'), [true]);
  t.deepEqual(fSyncJSON('true false +'), [true]);
  t.deepEqual(fSyncJSON('false true +'), [true]);
  t.deepEqual(fSyncJSON('false false +'), [false]);

  t.deepEqual(fSyncStack('true nan +'), [true]);
  t.deepEqual(fSyncStack('false nan +'), [NaN]);
  t.deepEqual(fSyncStack('nan true +'), [true]);
  t.deepEqual(fSyncStack('nan false +'), [NaN]);
  t.deepEqual(fSyncStack('nan nan +'), [NaN]);
});

test('should xor', t => {
  t.deepEqual(fSyncJSON('true true -'), [false]);
  t.deepEqual(fSyncJSON('true false -'), [true]);
  t.deepEqual(fSyncJSON('false true -'), [true]);
  t.deepEqual(fSyncJSON('false false -'), [false]);

  t.deepEqual(fSyncStack('true nan -'), [NaN]);
  t.deepEqual(fSyncStack('false nan -'), [NaN]);
  t.deepEqual(fSyncStack('nan true -'), [NaN]);
  t.deepEqual(fSyncStack('nan false -'), [NaN]);
  t.deepEqual(fSyncStack('nan nan -'), [NaN]);
});


test('should test equality', t => {
  t.deepEqual(fSyncJSON('true false ='), [false]);
  t.deepEqual(fSyncJSON('true true ='), [true]);
  t.deepEqual(fSyncJSON('false false ='), [true]);
});

test('should test equality with integers', t => {
  t.deepEqual(fSyncJSON('true 0 ='), [false]);
  t.deepEqual(fSyncJSON('true 1 ='), [true]);
  t.deepEqual(fSyncJSON('false 0 ='), [true]);
  t.deepEqual(fSyncJSON('false 1 ='), [false]);
});
