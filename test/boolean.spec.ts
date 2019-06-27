import test from 'ava';
import { fJSON, fValue, fStack } from './setup';

/* test('should parse', async t => {
  var f = F();
  t.deepEqual(f.lexer('true', [true]);
  t.deepEqual(f.lexer('false', [false]);
}); */

test('should push booleans', async t => {
  t.deepEqual(await fJSON('true false'), [true, false], 'should push booleans');
});

test('should not', async t => {
  t.deepEqual(await fJSON('true ~'), [false]);
  t.deepEqual(await fJSON('false ~'), [true]);
  t.deepEqual(await fStack('null ~'), [null]);
});

test('should and', async t => {
  t.deepEqual(await fJSON('true true *'), [true]);
  t.deepEqual(await fJSON('true false *'), [false]);
  t.deepEqual(await fJSON('false true *'), [false]);
  t.deepEqual(await fJSON('false false *'), [false]);

  t.deepEqual(await fStack('true null *'), [null]);
  t.deepEqual(await fStack('null true *'), [null]);
  t.deepEqual(await fStack('null false *'), [false]);
  t.deepEqual(await fStack('false null *'), [false]);

  t.deepEqual(await fStack('null null *'), [null]);
});

test('should or', async t => {
  t.deepEqual(await fJSON('true true +'), [true]);
  t.deepEqual(await fJSON('true false +'), [true]);
  t.deepEqual(await fJSON('false true +'), [true]);
  t.deepEqual(await fJSON('false false +'), [false]);

  t.deepEqual(await fStack('true null +'), [true]);
  t.deepEqual(await fStack('null true +'), [true]);
  t.deepEqual(await fStack('null false +'), [null]);
  t.deepEqual(await fStack('false null +'), [null]);

  t.deepEqual(await fStack('null null +'), [null]);
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('true true ='), [true]);
  t.deepEqual(await fJSON('true false ='), [false]);
  t.deepEqual(await fJSON('false true ='), [false]);
  t.deepEqual(await fJSON('false false ='), [true]);

  t.deepEqual(await fStack('true null ='), [false]);
  t.deepEqual(await fStack('null true ='), [false]);
  t.deepEqual(await fStack('null false ='), [false]);
  t.deepEqual(await fStack('false null ='), [false]);

  t.deepEqual(await fStack('null null ='), [true]);
});

test('should <=>', async t => {
  t.deepEqual(await fValue('true true <=>'), 0);
  t.deepEqual(await fValue('true false <=>'), 1);
  t.deepEqual(await fValue('false true <=>'), -1);
  t.deepEqual(await fValue('false false <=>'), 0);

  t.deepEqual(await fValue('true null <=>'), 1);
  t.deepEqual(await fValue('null true <=>'), -1);
  t.deepEqual(await fValue('null false <=>'), 1);
  t.deepEqual(await fValue('false null <=>'), -1);

  t.deepEqual(await fValue('null null <=>'), 0);
});

test('should nand', async t => {
  t.deepEqual(await fJSON('true true %'), [false]);
  t.deepEqual(await fJSON('true false %'), [true]);
  t.deepEqual(await fJSON('false true %'), [true]);
  t.deepEqual(await fJSON('false false %'), [true]);

  t.deepEqual(await fStack('true null %'), [null]);
  t.deepEqual(await fStack('null true %'), [null]);
  t.deepEqual(await fStack('null false %'), [true]);
  t.deepEqual(await fStack('false null %'), [true]);

  t.deepEqual(await fStack('null null %'), [null]);
});

test('should xor', async t => {
  t.deepEqual(await fJSON('true true ^'), [false]);
  t.deepEqual(await fJSON('true false ^'), [true]);
  t.deepEqual(await fJSON('false true ^'), [true]);
  t.deepEqual(await fJSON('false false ^'), [false]);

  t.deepEqual(await fStack('true null ^'), [null]);
  t.deepEqual(await fStack('null true ^'), [null]);
  t.deepEqual(await fStack('null false ^'), [null]);
  t.deepEqual(await fStack('false null ^'), [null]);

  t.deepEqual(await fStack('null null ^'), [null]);
});

test('should nor', async t => {
  t.deepEqual(await fJSON('true true -'), [false]);
  t.deepEqual(await fJSON('true false -'), [false]);
  t.deepEqual(await fJSON('false true -'), [false]);
  t.deepEqual(await fJSON('false false -'), [true]);

  t.deepEqual(await fStack('true null -'), [false]);
  t.deepEqual(await fStack('null true -'), [false]);
  t.deepEqual(await fStack('null false -'), [null]);
  t.deepEqual(await fStack('false null -'), [null]);

  t.deepEqual(await fStack('null null -'), [null]);
});

test('should >> (material implication)', async t => {
  t.deepEqual(await fJSON('true true >>'), [true]);
  t.deepEqual(await fJSON('true false >>'), [false]);
  t.deepEqual(await fJSON('false true >>'), [true]);
  t.deepEqual(await fJSON('false false >>'), [true]);

  t.deepEqual(await fStack('true null >>'), [null]);
  t.deepEqual(await fStack('null true >>'), [true]);
  t.deepEqual(await fStack('null false >>'), [null]);
  t.deepEqual(await fStack('false null >>'), [true]);

  t.deepEqual(await fStack('null null >>'), [null]);
});

test('should << (converse implication)', async t => {
  t.deepEqual(await fJSON('true true <<'), [true]);
  t.deepEqual(await fJSON('true false <<'), [true]);
  t.deepEqual(await fJSON('false true <<'), [false]);
  t.deepEqual(await fJSON('false false <<'), [true]);

  t.deepEqual(await fStack('true null <<'), [true]);
  t.deepEqual(await fStack('null true <<'), [null]);
  t.deepEqual(await fStack('null false <<'), [true]);
  t.deepEqual(await fStack('false null <<'), [null]);

  t.deepEqual(await fStack('null null <<'), [null]);
});

test('should / (material non-implication)', async t => {
  t.deepEqual(await fJSON('true true /'), [false]);
  t.deepEqual(await fJSON('true false /'), [true]);
  t.deepEqual(await fJSON('false true /'), [false]);
  t.deepEqual(await fJSON('false false /'), [false]);

  t.deepEqual(await fStack('true null /'), [null]);
  t.deepEqual(await fStack('null true /'), [false]);
  t.deepEqual(await fStack('null false /'), [null]);
  t.deepEqual(await fStack('false null /'), [false]);

  t.deepEqual(await fStack('null null /'), [null]);
});

test('should \ (converse non-implication)', async t => {
  t.deepEqual(await fJSON('true true \\'), [false]);
  t.deepEqual(await fJSON('true false \\'), [false]);
  t.deepEqual(await fJSON('false true \\'), [true]);
  t.deepEqual(await fJSON('false false \\'), [false]);

  t.deepEqual(await fStack('true null \\'), [false]);
  t.deepEqual(await fStack('null true \\'), [null]);
  t.deepEqual(await fStack('null false \\'), [false]);
  t.deepEqual(await fStack('false null \\'), [null]);

  t.deepEqual(await fStack('null null \\'), [null]);
});

///

test('length of booleans are zero', async t => {
  t.deepEqual(await fJSON('true ln'), [0]);
  t.deepEqual(await fJSON('false ln'), [0]);
});

test('convert falsy values', async t => {
  t.deepEqual(await fJSON('false boolean'), [false]);
  t.deepEqual(await fJSON('0 boolean'), [false]);
  t.deepEqual(await fJSON('-0 boolean'), [false]);
  t.deepEqual(await fJSON('"" boolean'), [false]);
  t.deepEqual(await fJSON('null boolean'), [false]);
  t.deepEqual(await fJSON('nan boolean'), [false]);
});

test('convert truthiness values', async t => {
  t.deepEqual(await fJSON('true boolean'), [true]);
  t.deepEqual(await fJSON('1 boolean'), [true]);
  t.deepEqual(await fJSON('-1 boolean'), [true]);
  t.deepEqual(await fJSON('"false" boolean'), [true]);
  t.deepEqual(await fJSON('"any string" boolean'), [true]);
  t.deepEqual(await fJSON('[] boolean'), [true]);
  t.deepEqual(await fJSON('{} boolean'), [true]);
  t.deepEqual(await fJSON('infinity boolean'), [true]);
  t.deepEqual(await fJSON('"1/1/1990" date boolean'), [true]);
  t.deepEqual(await fJSON('1 0 / boolean'), [true]);
  t.deepEqual(await fJSON('i boolean'), [true]);
});

