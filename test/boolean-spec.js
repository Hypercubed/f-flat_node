import test from 'ava';
import { F, fSyncJSON, fSyncStack, fSyncValues } from './setup';

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
  t.deepEqual(fSyncStack('null ~'), [null]);
});

test('should and', t => {
  t.deepEqual(fSyncJSON('true true *'), [true]);
  t.deepEqual(fSyncJSON('true false *'), [false]);
  t.deepEqual(fSyncJSON('false true *'), [false]);
  t.deepEqual(fSyncJSON('false false *'), [false]);

  t.deepEqual(fSyncStack('true null *'), [null]);
  t.deepEqual(fSyncStack('null true *'), [null]);
  t.deepEqual(fSyncStack('null false *'), [false]);
  t.deepEqual(fSyncStack('false null *'), [false]);
  
  t.deepEqual(fSyncStack('null null *'), [null]);
});

test('should or', t => {
  t.deepEqual(fSyncJSON('true true +'), [true]);
  t.deepEqual(fSyncJSON('true false +'), [true]);
  t.deepEqual(fSyncJSON('false true +'), [true]);
  t.deepEqual(fSyncJSON('false false +'), [false]);

  t.deepEqual(fSyncStack('true null +'), [true]);
  t.deepEqual(fSyncStack('null true +'), [true]);
  t.deepEqual(fSyncStack('null false +'), [null]);
  t.deepEqual(fSyncStack('false null +'), [null]);
  
  t.deepEqual(fSyncStack('null null +'), [null]);
});

test('should test equality', t => {
  t.deepEqual(fSyncJSON('true true ='), [true]);
  t.deepEqual(fSyncJSON('true false ='), [false]);
  t.deepEqual(fSyncJSON('false true ='), [false]);
  t.deepEqual(fSyncJSON('false false ='), [true]);

  t.deepEqual(fSyncStack('true null ='), [false]);
  t.deepEqual(fSyncStack('null true ='), [false]);
  t.deepEqual(fSyncStack('null false ='), [false]);
  t.deepEqual(fSyncStack('false null ='), [false]);
  
  t.deepEqual(fSyncStack('null null ='), [true]);
});

test('should <=>', t => {
  t.deepEqual(fSyncJSON('true true <=>'), [0]);
  t.deepEqual(fSyncJSON('true false <=>'), [1]);
  t.deepEqual(fSyncJSON('false true <=>'), [-1]);
  t.deepEqual(fSyncJSON('false false <=>'), [0]);

  t.deepEqual(fSyncStack('true null <=>'), [1]);
  t.deepEqual(fSyncStack('null true <=>'), [-1]);
  t.deepEqual(fSyncStack('null false <=>'), [1]);
  t.deepEqual(fSyncStack('false null <=>'), [-1]);

  t.deepEqual(fSyncStack('null null <=>'), [0]);
});

test('should nand', t => {
  t.deepEqual(fSyncJSON('true true %'), [false]);
  t.deepEqual(fSyncJSON('true false %'), [true]);
  t.deepEqual(fSyncJSON('false true %'), [true]);
  t.deepEqual(fSyncJSON('false false %'), [true]);

  t.deepEqual(fSyncStack('true null %'), [null]);
  t.deepEqual(fSyncStack('null true %'), [null]);
  t.deepEqual(fSyncStack('null false %'), [true]);
  t.deepEqual(fSyncStack('false null %'), [true]);

  t.deepEqual(fSyncStack('null null %'), [null]);
});

test('should xor', t => {
  t.deepEqual(fSyncJSON('true true ^'), [false]);
  t.deepEqual(fSyncJSON('true false ^'), [true]);
  t.deepEqual(fSyncJSON('false true ^'), [true]);
  t.deepEqual(fSyncJSON('false false ^'), [false]);

  t.deepEqual(fSyncStack('true null ^'), [null]);
  t.deepEqual(fSyncStack('null true ^'), [null]);
  t.deepEqual(fSyncStack('null false ^'), [null]);
  t.deepEqual(fSyncStack('false null ^'), [null]);

  t.deepEqual(fSyncStack('null null ^'), [null]);
});

test('should nor', t => {
  t.deepEqual(fSyncJSON('true true -'), [false]);
  t.deepEqual(fSyncJSON('true false -'), [false]);
  t.deepEqual(fSyncJSON('false true -'), [false]);
  t.deepEqual(fSyncJSON('false false -'), [true]);

  t.deepEqual(fSyncStack('true null -'), [false]);
  t.deepEqual(fSyncStack('null true -'), [false]);
  t.deepEqual(fSyncStack('null false -'), [null]);
  t.deepEqual(fSyncStack('false null -'), [null]);

  t.deepEqual(fSyncStack('null null -'), [null]);
});

test('should >> (material implication)', t => {
  t.deepEqual(fSyncJSON('true true >>'), [true]);
  t.deepEqual(fSyncJSON('true false >>'), [false]);
  t.deepEqual(fSyncJSON('false true >>'), [true]);
  t.deepEqual(fSyncJSON('false false >>'), [true]);

  t.deepEqual(fSyncStack('true null >>'), [null]);
  t.deepEqual(fSyncStack('null true >>'), [true]);
  t.deepEqual(fSyncStack('null false >>'), [null]);
  t.deepEqual(fSyncStack('false null >>'), [true]);

  t.deepEqual(fSyncStack('null null >>'), [null]);
});

test('should << (converse implication)', t => {
  t.deepEqual(fSyncJSON('true true <<'), [true]);
  t.deepEqual(fSyncJSON('true false <<'), [true]);
  t.deepEqual(fSyncJSON('false true <<'), [false]);
  t.deepEqual(fSyncJSON('false false <<'), [true]);

  t.deepEqual(fSyncStack('true null <<'), [true]);
  t.deepEqual(fSyncStack('null true <<'), [null]);
  t.deepEqual(fSyncStack('null false <<'), [true]);
  t.deepEqual(fSyncStack('false null <<'), [null]);

  t.deepEqual(fSyncStack('null null <<'), [null]);
});

test('should / (material non-implication)', t => {
  t.deepEqual(fSyncJSON('true true /'), [false]);
  t.deepEqual(fSyncJSON('true false /'), [true]);
  t.deepEqual(fSyncJSON('false true /'), [false]);
  t.deepEqual(fSyncJSON('false false /'), [false]);

  t.deepEqual(fSyncStack('true null /'), [null]);
  t.deepEqual(fSyncStack('null true /'), [false]);
  t.deepEqual(fSyncStack('null false /'), [null]);
  t.deepEqual(fSyncStack('false null /'), [false]);

  t.deepEqual(fSyncStack('null null /'), [null]);
});

test('should \ (converse non-implication)', t => {
  t.deepEqual(fSyncJSON('true true \\'), [false]);
  t.deepEqual(fSyncJSON('true false \\'), [false]);
  t.deepEqual(fSyncJSON('false true \\'), [true]);
  t.deepEqual(fSyncJSON('false false \\'), [false]);

  t.deepEqual(fSyncStack('true null \\'), [false]);
  t.deepEqual(fSyncStack('null true \\'), [null]);
  t.deepEqual(fSyncStack('null false \\'), [false]);
  t.deepEqual(fSyncStack('false null \\'), [null]);

  t.deepEqual(fSyncStack('null null \\'), [null]);
});

///

test('length of booleans are zero', t => {
  t.deepEqual(fSyncJSON('true ln'), [0]);
  t.deepEqual(fSyncJSON('false ln'), [0]);
});
