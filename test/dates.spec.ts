import { fJSON, fValue } from './helpers/setup';

test('should create dates', async () => {
  expect(await fJSON('"1/1/1990" date')).toEqual([
    { $date: '1990-01-01T07:00:00.000Z' }
  ]);
  expect(await fJSON('"1990-01-01T07:00:00.000Z" date')).toEqual([
    { $date: '1990-01-01T07:00:00.000Z' }
  ]);
});

test('should convert to numbers', async () => {
  expect(await fJSON('"1/1/1990" date number')).toEqual([631177200000]);
});

test('should check dates type', async () => {
  expect(await fJSON('"1/1/1990" date type')).toEqual(['date']);
});

test('should generate current date', async () => {
  expect(await fJSON('now type')).toEqual(['date']);
});

test('should perform basic arithmetic', async () => {
  expect(await fJSON('"1/1/1990" date 1000 60 * 60 * 24 * +')).toEqual([
    { $date: '1990-01-02T07:00:00.000Z' }
  ]);
  expect(await fJSON('"1/1/1990" date 1000 60 * 60 * 24 * -')).toEqual([
    { $date: '1989-12-31T07:00:00.000Z' }
  ]);
});

test('should test equality', async () => {
  expect(await fJSON('"1/1/1990" date "1/1/1990" date =')).toEqual([true]);
  expect(await fJSON('"1/1/1990" date "1/2/1990" date =')).toEqual([false]);
});

test('should compare', async () => {
  expect(await fValue('"1/1/1990" date "1/1/1990" date <=>')).toEqual(0);
  expect(await fValue('"1/1/1990" date "1/1/1970" date <=>')).toEqual(1);
  expect(await fValue('"1/1/1990" date "1/1/2000" date <=>')).toEqual(-1);
});

test('should test inequality', async () => {
  expect(await fJSON('"1/1/1990" date "1/1/1990" date <')).toEqual([false]);
  expect(await fJSON('"1/1/1990" date "1/1/1990" date >')).toEqual([false]);
  expect(await fJSON('"1/1/1960" date "1/1/1990" date <')).toEqual([true]);
  expect(await fJSON('"1/1/1960" date "1/1/1990" date >')).toEqual([false]);
  expect(await fJSON('"1/1/1990" date "1/1/1960" date <')).toEqual([false]);
  expect(await fJSON('"1/1/1990" date "1/1/1960" date >')).toEqual([true]);
});

test('should get day', async () => {
  expect(await fJSON('"1/1/1990" date day')).toEqual(['Mon']);
  expect(await fJSON('"1/1/1990" date 1000 60 * 60 * 24 * - day')).toEqual([
    'Sun'
  ]);
});

test('date works as a "macro"', async () => {
  expect(await fJSON('"1/1/1990":date')).toEqual([
    { $date: '1990-01-01T07:00:00.000Z' }
  ]);
  expect(await fJSON('[ "1/1/1990":date ]')).toEqual([
    [{ $date: '1990-01-01T07:00:00.000Z' }]
  ]);
});
