import test from 'ava';
import { fJSON, fValue } from './helpers/setup';

test('should create dates', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date'), [{$date: '1990-01-01T07:00:00.000Z'}], 'should create a date from a short date');
  t.deepEqual(await fJSON('"1990-01-01T07:00:00.000Z" date'), [{$date: '1990-01-01T07:00:00.000Z'}], 'should create a date from a log date');
});

test('should convert to numbers', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date number'), [631177200000]);
});

test('should check dates type', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date type'), ['date']);
});

test('should generate current date', async t => {
  t.deepEqual(await fJSON('now type'), ['date']);
});

test('should perform basic arithmetic', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date 1000 60 * 60 * 24 * +'), [{$date: '1990-01-02T07:00:00.000Z'}], 'should add a day');
  t.deepEqual(await fJSON('"1/1/1990" date 1000 60 * 60 * 24 * -'), [{$date: '1989-12-31T07:00:00.000Z'}], 'should sub a day');
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date "1/1/1990" date ='), [true], 'should test equality');
  t.deepEqual(await fJSON('"1/1/1990" date "1/2/1990" date ='), [false], 'should test inequality');
});

test('should compare', async t => {
  t.deepEqual(await fValue('"1/1/1990" date "1/1/1990" date <=>'), 0);
  t.deepEqual(await fValue('"1/1/1990" date "1/1/1970" date <=>'), 1);
  t.deepEqual(await fValue('"1/1/1990" date "1/1/2000" date <=>'), -1);
});

test('should test inequality', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date "1/1/1990" date <'), [false]);
  t.deepEqual(await fJSON('"1/1/1990" date "1/1/1990" date >'), [false]);
  t.deepEqual(await fJSON('"1/1/1960" date "1/1/1990" date <'), [true]);
  t.deepEqual(await fJSON('"1/1/1960" date "1/1/1990" date >'), [false]);
  t.deepEqual(await fJSON('"1/1/1990" date "1/1/1960" date <'), [false]);
  t.deepEqual(await fJSON('"1/1/1990" date "1/1/1960" date >'), [true]);
});

test('should get day', async t => {
  t.deepEqual(await fJSON('"1/1/1990" date day'), ['Mon']);
  t.deepEqual(await fJSON('"1/1/1990" date 1000 60 * 60 * 24 * - day'), ['Sun']);
});

test('date works as a "macro"', async t => {
  t.deepEqual(await fJSON('"1/1/1990":date'), [{$date: '1990-01-01T07:00:00.000Z'}]);
  t.deepEqual(await fJSON('[ "1/1/1990":date ]'), [[{$date: '1990-01-01T07:00:00.000Z'}]]);
});

