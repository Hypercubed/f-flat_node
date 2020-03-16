import { ƒ } from './helpers/setup';

test('should push booleans', async () => {
  expect(await ƒ('true false')).toBe(`[ true false ]`);
});

test('should not', async () => {
  expect(await ƒ('true ~')).toBe(`[ false ]`);
  expect(await ƒ('false ~')).toBe(`[ true ]`);
  expect(await ƒ('null ~')).toBe(`[ null ]`);
});

test('should and', async () => {
  expect(await ƒ('true true *')).toBe(`[ true ]`);
  expect(await ƒ('true false *')).toBe(`[ false ]`);
  expect(await ƒ('false true *')).toBe(`[ false ]`);
  expect(await ƒ('false false *')).toBe(`[ false ]`);

  expect(await ƒ('true null *')).toBe(`[ null ]`);
  expect(await ƒ('null true *')).toBe(`[ null ]`);
  expect(await ƒ('null false *')).toBe(`[ false ]`);
  expect(await ƒ('false null *')).toBe(`[ false ]`);

  expect(await ƒ('null null *')).toBe(`[ null ]`);
});

test('should or', async () => {
  expect(await ƒ('true true +')).toBe(`[ true ]`);
  expect(await ƒ('true false +')).toBe(`[ true ]`);
  expect(await ƒ('false true +')).toBe(`[ true ]`);
  expect(await ƒ('false false +')).toBe(`[ false ]`);

  expect(await ƒ('true null +')).toBe(`[ true ]`);
  expect(await ƒ('null true +')).toBe(`[ true ]`);
  expect(await ƒ('null false +')).toBe(`[ null ]`);
  expect(await ƒ('false null +')).toBe(`[ null ]`);

  expect(await ƒ('null null +')).toBe(`[ null ]`);
});

test('should test equality', async () => {
  expect(await ƒ('true true =')).toBe(`[ true ]`);
  expect(await ƒ('true false =')).toBe(`[ false ]`);
  expect(await ƒ('false true =')).toBe(`[ false ]`);
  expect(await ƒ('false false =')).toBe(`[ true ]`);

  expect(await ƒ('true null =')).toBe(`[ false ]`);
  expect(await ƒ('null true =')).toBe(`[ false ]`);
  expect(await ƒ('null false =')).toBe(`[ false ]`);
  expect(await ƒ('false null =')).toBe(`[ false ]`);

  expect(await ƒ('null null =')).toBe(`[ true ]`);
});

test('should <=>', async () => {
  expect(await ƒ('true true <=>')).toBe(`[ 0 ]`);
  expect(await ƒ('true false <=>')).toBe(`[ 1 ]`);
  expect(await ƒ('false true <=>')).toBe(`[ -1 ]`);
  expect(await ƒ('false false <=>')).toBe(`[ 0 ]`);

  expect(await ƒ('true null <=>')).toBe(`[ 1 ]`);
  expect(await ƒ('null true <=>')).toBe(`[ -1 ]`);
  expect(await ƒ('null false <=>')).toBe(`[ 1 ]`);
  expect(await ƒ('false null <=>')).toBe(`[ -1 ]`);

  expect(await ƒ('null null <=>')).toBe(`[ 0 ]`);
});

test('should nand', async () => {
  expect(await ƒ('true true %')).toBe(`[ false ]`);
  expect(await ƒ('true false %')).toBe(`[ true ]`);
  expect(await ƒ('false true %')).toBe(`[ true ]`);
  expect(await ƒ('false false %')).toBe(`[ true ]`);

  expect(await ƒ('true null %')).toBe(`[ null ]`);
  expect(await ƒ('null true %')).toBe(`[ null ]`);
  expect(await ƒ('null false %')).toBe(`[ true ]`);
  expect(await ƒ('false null %')).toBe(`[ true ]`);

  expect(await ƒ('null null %')).toBe(`[ null ]`);
});

test('should xor', async () => {
  expect(await ƒ('true true ^')).toBe(`[ false ]`);
  expect(await ƒ('true false ^')).toBe(`[ true ]`);
  expect(await ƒ('false true ^')).toBe(`[ true ]`);
  expect(await ƒ('false false ^')).toBe(`[ false ]`);

  expect(await ƒ('true null ^')).toBe(`[ null ]`);
  expect(await ƒ('null true ^')).toBe(`[ null ]`);
  expect(await ƒ('null false ^')).toBe(`[ null ]`);
  expect(await ƒ('false null ^')).toBe(`[ null ]`);

  expect(await ƒ('null null ^')).toBe(`[ null ]`);
});

test('should nor', async () => {
  expect(await ƒ('true true -')).toBe(`[ false ]`);
  expect(await ƒ('true false -')).toBe(`[ false ]`);
  expect(await ƒ('false true -')).toBe(`[ false ]`);
  expect(await ƒ('false false -')).toBe(`[ true ]`);

  expect(await ƒ('true null -')).toBe(`[ false ]`);
  expect(await ƒ('null true -')).toBe(`[ false ]`);
  expect(await ƒ('null false -')).toBe(`[ null ]`);
  expect(await ƒ('false null -')).toBe(`[ null ]`);

  expect(await ƒ('null null -')).toBe(`[ null ]`);
});

test('should >> (material implication)', async () => {
  expect(await ƒ('true true >>')).toBe(`[ true ]`);
  expect(await ƒ('true false >>')).toBe(`[ false ]`);
  expect(await ƒ('false true >>')).toBe(`[ true ]`);
  expect(await ƒ('false false >>')).toBe(`[ true ]`);

  expect(await ƒ('true null >>')).toBe(`[ null ]`);
  expect(await ƒ('null true >>')).toBe(`[ true ]`);
  expect(await ƒ('null false >>')).toBe(`[ null ]`);
  expect(await ƒ('false null >>')).toBe(`[ true ]`);

  expect(await ƒ('null null >>')).toBe(`[ null ]`);
});

test('should << (converse implication)', async () => {
  expect(await ƒ('true true <<')).toBe(`[ true ]`);
  expect(await ƒ('true false <<')).toBe(`[ true ]`);
  expect(await ƒ('false true <<')).toBe(`[ false ]`);
  expect(await ƒ('false false <<')).toBe(`[ true ]`);

  expect(await ƒ('true null <<')).toBe(`[ true ]`);
  expect(await ƒ('null true <<')).toBe(`[ null ]`);
  expect(await ƒ('null false <<')).toBe(`[ true ]`);
  expect(await ƒ('false null <<')).toBe(`[ null ]`);

  expect(await ƒ('null null <<')).toBe(`[ null ]`);
});

test('should / (material non-implication)', async () => {
  expect(await ƒ('true true /')).toBe(`[ false ]`);
  expect(await ƒ('true false /')).toBe(`[ true ]`);
  expect(await ƒ('false true /')).toBe(`[ false ]`);
  expect(await ƒ('false false /')).toBe(`[ false ]`);

  expect(await ƒ('true null /')).toBe(`[ null ]`);
  expect(await ƒ('null true /')).toBe(`[ false ]`);
  expect(await ƒ('null false /')).toBe(`[ null ]`);
  expect(await ƒ('false null /')).toBe(`[ false ]`);

  expect(await ƒ('null null /')).toBe(`[ null ]`);
});

test('should \\ (converse non-implication)', async () => {
  expect(await ƒ('true true \\')).toBe(`[ false ]`);
  expect(await ƒ('true false \\')).toBe(`[ false ]`);
  expect(await ƒ('false true \\')).toBe(`[ true ]`);
  expect(await ƒ('false false \\')).toBe(`[ false ]`);

  expect(await ƒ('true null \\')).toBe(`[ false ]`);
  expect(await ƒ('null true \\')).toBe(`[ null ]`);
  expect(await ƒ('null false \\')).toBe(`[ false ]`);
  expect(await ƒ('false null \\')).toBe(`[ null ]`);

  expect(await ƒ('null null \\')).toBe(`[ null ]`);
});

test('length of booleans are zero', async () => {
  expect(await ƒ('true ln')).toBe(`[ 0 ]`);
  expect(await ƒ('false ln')).toBe(`[ 0 ]`);
  expect(await ƒ('null ln')).toBe(`[ 0 ]`);
});

test('convert falsy values', async () => {
  expect(await ƒ('false boolean')).toBe(`[ false ]`);
  expect(await ƒ('0 boolean')).toBe(`[ false ]`);
  expect(await ƒ('-0 boolean')).toBe(`[ false ]`);
  expect(await ƒ('"" boolean')).toBe(`[ false ]`);
  expect(await ƒ('nan boolean')).toBe(`[ false ]`); /// ?
});

test('convert truthiness values', async () => {
  expect(await ƒ('true boolean')).toBe(`[ true ]`);
  expect(await ƒ('1 boolean')).toBe(`[ true ]`);
  expect(await ƒ('-1 boolean')).toBe(`[ true ]`);
  expect(await ƒ('"false" boolean')).toBe(`[ true ]`);
  expect(await ƒ('"any string" boolean')).toBe(`[ true ]`);
  expect(await ƒ('[] boolean')).toBe(`[ true ]`);
  expect(await ƒ('{} boolean')).toBe(`[ true ]`);
  expect(await ƒ('infinity boolean')).toBe(`[ true ]`);
  expect(await ƒ('"1/1/1990" date boolean')).toBe(`[ true ]`);
  expect(await ƒ('1 0 / boolean')).toBe(`[ true ]`); /// ?
  expect(await ƒ('i boolean')).toBe(`[ true ]`);
});

test('null is neither true nor false', async () => {
  expect(await ƒ('null boolean')).toBe(`[ null ]`);
});
