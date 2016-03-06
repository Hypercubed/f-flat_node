import test from 'ava';
import {Stack as F} from '../';
import {log} from '../src/logger';

log.level = process.env.NODE_ENV || 'error';

process.chdir('..');

function fSync (a) {
  return new F(a).toArray();
}

test('should push strings', t => {
  t.same(fSync('"a" "b"'), ['a', 'b']);
  t.same(fSync("'a' 'b'"), ['a', 'b']);
  t.same(fSync('"ab de"'), ['ab de'], 'should push strings with spaces');
  t.same(fSync('""'), [''], 'should push empty strings');
  t.same(fSync('"Dog!🐶"'), ['Dog!🐶'], 'should support emoji');
});

test('should quickcheck strings', t => {
  t.same(fSync('[rand-string] [ dup 1 * = ] for-all'), [[]]);
  t.same(fSync('[rand-string] [ dup 2 * 2 / = ] for-all'), [[]]);
  t.same(fSync('[rand-string] [ [length 2 *] [2 * length] bi = ] for-all'), [[]]);
});

test('should push strings with nested quotes', t => {
  t.same(fSync('"ab \'de\' fg"'), ['ab \'de\' fg']);
  t.same(fSync("'ab \"de\" fg'"), ['ab \"de\" fg']);
});

test('should add', t => {
  t.same(fSync('"a" "b" +'), ['ab']);
});

test('should multiply', t => {
  t.same(fSync('"a" 2 *'), ['aa']);
  t.same(fSync('"bc" 2 *'), ['bcbc']);
});

test('should split', t => {
  t.same(fSync('"a-b-c" "-" /'), [['a', 'b', 'c']]);
});

test('should test equality', t => {
  t.same(fSync('"a" "b" ='), [false]);
  t.same(fSync('"a" "a" ='), [true]);
});

test('should test lt', t => {
  t.same(fSync('"a" "a" <'), [false]);
  t.same(fSync('"a" "b" <'), [true]);
  t.same(fSync('"b" "a" <'), [false]);
});

test('should test gt', t => {
  t.same(fSync('"a" "a" >'), [false]);
  t.same(fSync('"a" "b" >'), [false]);
  t.same(fSync('"b" "a" >'), [true]);
});

test('should eval strings', t => {
  const f = new F();
  t.same(f.eval('"1 2 +"').toArray(), ['1 2 +']);
  t.same(f.eval('eval').toArray(), [3]);
});

test('should @', t => {
  t.same(fSync('"abc" 0 @'), ['a']);
  t.same(fSync('"abc" 1 @'), ['b']);
  t.same(fSync('"abc" 2 @'), ['c']);
});

test('should @ from end', t => {
  t.same(fSync('"abc" -1 @'), ['c']);
  t.same(fSync('"abc" -2 @'), ['b']);
  t.same(fSync('"abc" -3 @'), ['a']);
});

test('should @ from out of bounds', t => {
  t.same(fSync('"abc" 10 @'), ['']);
});

test('should process string templates', t => {
  t.same(fSync('`-1 sqrt = $( -1 sqrt )`'), ['-1 sqrt = 0+1i']);
  t.same(fSync('`0.1 0.2 + = $( 0.1 0.2 + )`'), ['0.1 0.2 + = 0.3']);
  t.same(fSync('0.1 0.2 => => `0.1 0.2 + = $( <= <= + )`'), ['0.1 0.2 + = 0.3']);
  t.same(fSync('0.1 0.2 => => `(0.1 0.2) = $( <= <= )`'), ['(0.1 0.2) = 0.1,0.2']);
  t.same(fSync('`$0.1 (0.2) + = $( 0.1 0.2 + )`'), ['$0.1 (0.2) + = 0.3']);
});
