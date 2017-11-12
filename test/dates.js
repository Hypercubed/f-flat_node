import test from 'ava';
import { fSync } from './setup';

test('should create dates', t => {
  t.deepEqual(fSync('"1/1/1990" date'), ['1990-01-01T07:00:00.000Z'], 'should create a date from a short date');
  t.deepEqual(fSync('"1990-01-01T07:00:00.000Z" date'), ['1990-01-01T07:00:00.000Z'], 'should create a date from a log date');
});

test('should convert to numbers', t => {
  t.deepEqual(fSync('"1/1/1990" date number'), [631177200000]);
});

test('should check dates type', t => {
  t.deepEqual(fSync('"1/1/1990" date type'), ['date']);
});

test('should generate current date', t => {
  t.deepEqual(fSync('now type'), ['date']);
});

test('should perform basic arithmetic', t => {
  t.deepEqual(fSync('"1/1/1990" date 1000 60 * 60 * 24 * +'), ['1990-01-02T07:00:00.000Z'], 'should add a day');
  t.deepEqual(fSync('"1/1/1990" date 1000 60 * 60 * 24 * -'), ['1989-12-31T07:00:00.000Z'], 'should sub a day');
});

test('should test equality', t => {
  t.deepEqual(fSync('"1/1/1990" date "1/1/1990" date ='), [true], 'should test equality');
  t.deepEqual(fSync('"1/1/1990" date "1/2/1990" date ='), [false], 'should test inequality');
});

test('should compare', t => {
  t.deepEqual(fSync('"1/1/1990" date "1/1/1990" date cmp'), [0]);
  t.deepEqual(fSync('"1/1/1990" date "1/1/1970" date cmp'), [1]);
  t.deepEqual(fSync('"1/1/1990" date "1/1/2000" date cmp'), [-1]);
});

test('should test inequality', t => {
  t.deepEqual(fSync('"1/1/1990" date "1/1/1990" date <'), [false]);
  t.deepEqual(fSync('"1/1/1990" date "1/1/1990" date >'), [false]);
  t.deepEqual(fSync('"1/1/1960" date "1/1/1990" date <'), [true]);
  t.deepEqual(fSync('"1/1/1960" date "1/1/1990" date >'), [false]);
  t.deepEqual(fSync('"1/1/1990" date "1/1/1960" date <'), [false]);
  t.deepEqual(fSync('"1/1/1990" date "1/1/1960" date >'), [true]);
});

test('should get day', t => {
  t.deepEqual(fSync('"1/1/1990" date day'), ['Mon']);
  t.deepEqual(fSync('"1/1/1990" date 1000 60 * 60 * 24 * - day'), ['Sun']);
});

