import { ƒ, τ } from './helpers/setup';

const d = new Date('1990-01-01T07:00:00.000Z');

test('should create dates', async () => {
  expect(await ƒ('"1/1/1990" date')).toBe(τ`[ ${d} ]`);
  expect(await ƒ('"1990-01-01T07:00:00.000Z" date')).toBe(τ`[ ${d} ]`);
});

test('should convert to numbers', async () => {
  expect(await ƒ('"1/1/1990" date number')).toBe(`[ 631177200000 ]`);
});

test('should check dates type', async () => {
  expect(await ƒ('"1/1/1990" date type')).toBe(`[ 'date' ]`);
});

test('should generate current date', async () => {
  expect(await ƒ('now type')).toBe(`[ 'date' ]`);
});

test('should perform basic arithmetic', async () => {
  expect(await ƒ('"1/1/1990" date 1000 60 * 60 * 24 * +')).toBe(
    τ`[ ${new Date('1990-01-02T07:00:00.000Z')} ]`
  );
  expect(await ƒ('"1/1/1990" date 1000 60 * 60 * 24 * -')).toBe(
    τ`[ ${new Date('1989-12-31T07:00:00.000Z')} ]`
  );
});

test('should test equality', async () => {
  expect(await ƒ('"1/1/1990" date "1/1/1990" date =')).toBe(`[ true ]`);
  expect(await ƒ('"1/1/1990" date "1/2/1990" date =')).toBe(`[ false ]`);
});

test('should compare', async () => {
  expect(await ƒ('"1/1/1990" date "1/1/1990" date <=>')).toBe(`[ 0 ]`);
  expect(await ƒ('"1/1/1990" date "1/1/1970" date <=>')).toBe(`[ 1 ]`);
  expect(await ƒ('"1/1/1990" date "1/1/2000" date <=>')).toBe(`[ -1 ]`);
});

test('should test inequality', async () => {
  expect(await ƒ('"1/1/1990" date "1/1/1990" date <')).toBe(`[ false ]`);
  expect(await ƒ('"1/1/1990" date "1/1/1990" date >')).toBe(`[ false ]`);
  expect(await ƒ('"1/1/1960" date "1/1/1990" date <')).toBe(`[ true ]`);
  expect(await ƒ('"1/1/1960" date "1/1/1990" date >')).toBe(`[ false ]`);
  expect(await ƒ('"1/1/1990" date "1/1/1960" date <')).toBe(`[ false ]`);
  expect(await ƒ('"1/1/1990" date "1/1/1960" date >')).toBe(`[ true ]`);
});

test('should get day', async () => {
  expect(await ƒ('"1/1/1990" date day')).toBe(`[ 'Mon' ]`);
  expect(await ƒ('"1/1/1990" date 1000 60 * 60 * 24 * - day')).toBe(
    `[ 'Sun' ]`
  );
});

test('date works as a "macro"', async () => {
  expect(await ƒ('"1/1/1990":date')).toBe(τ`[ ${d} ]`);
  expect(await ƒ('[ "1/1/1990":date ]')).toBe(τ`[ [ ${d} ] ]`);
});
