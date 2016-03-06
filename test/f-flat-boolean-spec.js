import test from 'ava';
import {Stack as F} from '../';
import {log} from '../src/logger';

log.level = process.env.NODE_ENV || 'error';

process.chdir('..');

function fSync (a) {
  return new F(a).toArray();
}

/* test('should parse', t => {
  var f = F();
  t.deepEqual(f.lexer('true', [true]);
  t.deepEqual(f.lexer('false', [false]);
}); */

test('should push booleans', t => {
  t.same(fSync('true false'), [true, false], 'should push booleans');
});

test('should or', t => {
  t.same(fSync('true false +'), [true]);
  t.same(fSync('true true +'), [true]);
  t.same(fSync('false false +'), [false]);
});

test('should xor', t => {
  t.same(fSync('true false -'), [true]);
  t.same(fSync('true true -'), [false]);
  t.same(fSync('false false -'), [false]);
});

test('should and', t => {
  t.same(fSync('true false /'), [true]);
  t.same(fSync('true true /'), [false]);
  t.same(fSync('false false /'), [true]);
});

test('should nand', t => {
  t.same(fSync('true false *'), [false]);
  t.same(fSync('true true *'), [true]);
  t.same(fSync('false false *'), [false]);
});

test('should test equality', t => {
  t.same(fSync('true false ='), [false]);
  t.same(fSync('true true ='), [true]);
  t.same(fSync('false false ='), [true]);
});

test('should test equality with integers', t => {
  t.same(fSync('true 0 ='), [false]);
  t.same(fSync('true 1 ='), [true]);
  t.same(fSync('false 0 ='), [true]);
  t.same(fSync('false 1 ='), [false]);
});
