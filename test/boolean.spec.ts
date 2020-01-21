import { fJSON, fValue, fStack } from './helpers/setup';

/* test('should parse', async t => {
  var f = F();
  t.deepEqual(f.lexer('true', [true]);
  t.deepEqual(f.lexer('false', [false]);
}); */

test('should push booleans', async () => {
  expect(await fJSON('true false')).toEqual([true, false]);
});

test('should not', async () => {
  expect(await fJSON('true ~')).toEqual([false]);
  expect(await fJSON('false ~')).toEqual([true]);
  expect(await fStack('null ~')).toEqual([null]);
});

test('should and', async () => {
  expect(await fJSON('true true *')).toEqual([true]);
  expect(await fJSON('true false *')).toEqual([false]);
  expect(await fJSON('false true *')).toEqual([false]);
  expect(await fJSON('false false *')).toEqual([false]);

  expect(await fStack('true null *')).toEqual([null]);
  expect(await fStack('null true *')).toEqual([null]);
  expect(await fStack('null false *')).toEqual([false]);
  expect(await fStack('false null *')).toEqual([false]);

  expect(await fStack('null null *')).toEqual([null]);
});

test('should or', async () => {
  expect(await fJSON('true true +')).toEqual([true]);
  expect(await fJSON('true false +')).toEqual([true]);
  expect(await fJSON('false true +')).toEqual([true]);
  expect(await fJSON('false false +')).toEqual([false]);

  expect(await fStack('true null +')).toEqual([true]);
  expect(await fStack('null true +')).toEqual([true]);
  expect(await fStack('null false +')).toEqual([null]);
  expect(await fStack('false null +')).toEqual([null]);

  expect(await fStack('null null +')).toEqual([null]);
});

test('should test equality', async () => {
  expect(await fJSON('true true =')).toEqual([true]);
  expect(await fJSON('true false =')).toEqual([false]);
  expect(await fJSON('false true =')).toEqual([false]);
  expect(await fJSON('false false =')).toEqual([true]);

  expect(await fStack('true null =')).toEqual([false]);
  expect(await fStack('null true =')).toEqual([false]);
  expect(await fStack('null false =')).toEqual([false]);
  expect(await fStack('false null =')).toEqual([false]);

  expect(await fStack('null null =')).toEqual([true]);
});

test('should <=>', async () => {
  expect(await fValue('true true <=>')).toEqual(0);
  expect(await fValue('true false <=>')).toEqual(1);
  expect(await fValue('false true <=>')).toEqual(-1);
  expect(await fValue('false false <=>')).toEqual(0);

  expect(await fValue('true null <=>')).toEqual(1);
  expect(await fValue('null true <=>')).toEqual(-1);
  expect(await fValue('null false <=>')).toEqual(1);
  expect(await fValue('false null <=>')).toEqual(-1);

  expect(await fValue('null null <=>')).toEqual(0);
});

test('should nand', async () => {
  expect(await fJSON('true true %')).toEqual([false]);
  expect(await fJSON('true false %')).toEqual([true]);
  expect(await fJSON('false true %')).toEqual([true]);
  expect(await fJSON('false false %')).toEqual([true]);

  expect(await fStack('true null %')).toEqual([null]);
  expect(await fStack('null true %')).toEqual([null]);
  expect(await fStack('null false %')).toEqual([true]);
  expect(await fStack('false null %')).toEqual([true]);

  expect(await fStack('null null %')).toEqual([null]);
});

test('should xor', async () => {
  expect(await fJSON('true true ^')).toEqual([false]);
  expect(await fJSON('true false ^')).toEqual([true]);
  expect(await fJSON('false true ^')).toEqual([true]);
  expect(await fJSON('false false ^')).toEqual([false]);

  expect(await fStack('true null ^')).toEqual([null]);
  expect(await fStack('null true ^')).toEqual([null]);
  expect(await fStack('null false ^')).toEqual([null]);
  expect(await fStack('false null ^')).toEqual([null]);

  expect(await fStack('null null ^')).toEqual([null]);
});

test('should nor', async () => {
  expect(await fJSON('true true -')).toEqual([false]);
  expect(await fJSON('true false -')).toEqual([false]);
  expect(await fJSON('false true -')).toEqual([false]);
  expect(await fJSON('false false -')).toEqual([true]);

  expect(await fStack('true null -')).toEqual([false]);
  expect(await fStack('null true -')).toEqual([false]);
  expect(await fStack('null false -')).toEqual([null]);
  expect(await fStack('false null -')).toEqual([null]);

  expect(await fStack('null null -')).toEqual([null]);
});

test('should >> (material implication)', async () => {
  expect(await fJSON('true true >>')).toEqual([true]);
  expect(await fJSON('true false >>')).toEqual([false]);
  expect(await fJSON('false true >>')).toEqual([true]);
  expect(await fJSON('false false >>')).toEqual([true]);

  expect(await fStack('true null >>')).toEqual([null]);
  expect(await fStack('null true >>')).toEqual([true]);
  expect(await fStack('null false >>')).toEqual([null]);
  expect(await fStack('false null >>')).toEqual([true]);

  expect(await fStack('null null >>')).toEqual([null]);
});

test('should << (converse implication)', async () => {
  expect(await fJSON('true true <<')).toEqual([true]);
  expect(await fJSON('true false <<')).toEqual([true]);
  expect(await fJSON('false true <<')).toEqual([false]);
  expect(await fJSON('false false <<')).toEqual([true]);

  expect(await fStack('true null <<')).toEqual([true]);
  expect(await fStack('null true <<')).toEqual([null]);
  expect(await fStack('null false <<')).toEqual([true]);
  expect(await fStack('false null <<')).toEqual([null]);

  expect(await fStack('null null <<')).toEqual([null]);
});

test('should / (material non-implication)', async () => {
  expect(await fJSON('true true /')).toEqual([false]);
  expect(await fJSON('true false /')).toEqual([true]);
  expect(await fJSON('false true /')).toEqual([false]);
  expect(await fJSON('false false /')).toEqual([false]);

  expect(await fStack('true null /')).toEqual([null]);
  expect(await fStack('null true /')).toEqual([false]);
  expect(await fStack('null false /')).toEqual([null]);
  expect(await fStack('false null /')).toEqual([false]);

  expect(await fStack('null null /')).toEqual([null]);
});

test('should  (converse non-implication)', async () => {
  expect(await fJSON('true true \\')).toEqual([false]);
  expect(await fJSON('true false \\')).toEqual([false]);
  expect(await fJSON('false true \\')).toEqual([true]);
  expect(await fJSON('false false \\')).toEqual([false]);

  expect(await fStack('true null \\')).toEqual([false]);
  expect(await fStack('null true \\')).toEqual([null]);
  expect(await fStack('null false \\')).toEqual([false]);
  expect(await fStack('false null \\')).toEqual([null]);

  expect(await fStack('null null \\')).toEqual([null]);
});

///

test('length of booleans are zero', async () => {
  expect(await fJSON('true ln')).toEqual([0]);
  expect(await fJSON('false ln')).toEqual([0]);
});

test('convert falsy values', async () => {
  expect(await fJSON('false boolean')).toEqual([false]);
  expect(await fJSON('0 boolean')).toEqual([false]);
  expect(await fJSON('-0 boolean')).toEqual([false]);
  expect(await fJSON('"" boolean')).toEqual([false]);
  expect(await fJSON('null boolean')).toEqual([false]);
  expect(await fJSON('nan boolean')).toEqual([false]);
});

test('convert truthiness values', async () => {
  expect(await fJSON('true boolean')).toEqual([true]);
  expect(await fJSON('1 boolean')).toEqual([true]);
  expect(await fJSON('-1 boolean')).toEqual([true]);
  expect(await fJSON('"false" boolean')).toEqual([true]);
  expect(await fJSON('"any string" boolean')).toEqual([true]);
  expect(await fJSON('[] boolean')).toEqual([true]);
  expect(await fJSON('{} boolean')).toEqual([true]);
  expect(await fJSON('infinity boolean')).toEqual([true]);
  expect(await fJSON('"1/1/1990" date boolean')).toEqual([true]);
  expect(await fJSON('1 0 / boolean')).toEqual([true]);
  expect(await fJSON('i boolean')).toEqual([true]);
});
