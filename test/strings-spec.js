import test from 'ava';
import { F, fSync } from './setup';

test('should push strings', t => {
  t.deepEqual(fSync('"a" "b"'), ['a', 'b']);
  t.deepEqual(fSync('\'a\' \'b\''), ['a', 'b']);
  t.deepEqual(fSync('"ab de"'), ['ab de'], 'should push strings with spaces');
  t.deepEqual(fSync('""'), [''], 'should push empty strings');
  t.deepEqual(fSync('"Dog!🐶"'), ['Dog!🐶'], 'should support emoji');
});

test('should quickcheck strings', t => {
  t.deepEqual(fSync('[rand-string] [ dup 1 * = ] for-all'), [[]]);
  t.deepEqual(fSync('[rand-string] [ dup 2 * 2 / = ] for-all'), [[]]);
  t.deepEqual(
    fSync('[rand-string] [ [length 2 *] [2 * length] bi = ] for-all'),
    [[]]
  );
});

test('should push strings with nested quotes', t => {
  t.deepEqual(fSync('"ab \'de\' fg"'), ['ab \'de\' fg']);
  t.deepEqual(fSync('\'ab "de" fg\''), ['ab "de" fg']);
});

test('should add', t => {
  t.deepEqual(fSync('"a" "b" +'), ['ab']);
});

test('should multiply', t => {
  t.deepEqual(fSync('"a" 2 *'), ['aa']);
  t.deepEqual(fSync('"bc" 2 *'), ['bcbc']);
});

test('should split', t => {
  t.deepEqual(fSync('"a-b-c" "-" /'), [['a', 'b', 'c']]);
});

test('should cut', t => {
  t.deepEqual(fSync('"abcd" 2 /'), ['ab']);
  t.deepEqual(fSync('"abcd" 5 /'), [null]);
});

test('should test equality', t => {
  t.deepEqual(fSync('"a" "b" ='), [false]);
  t.deepEqual(fSync('"a" "a" ='), [true]);
});

test('should cmp', t => {
  t.deepEqual(fSync('"a" "a" cmp'), [0]);
  t.deepEqual(fSync('"a" "b" cmp'), [-1]);
  t.deepEqual(fSync('"b" "a" cmp'), [1]);
});

test('should test lt', t => {
  t.deepEqual(fSync('"a" "a" <'), [false]);
  t.deepEqual(fSync('"a" "b" <'), [true]);
  t.deepEqual(fSync('"b" "a" <'), [false]);
});

test('should test gt', t => {
  t.deepEqual(fSync('"a" "a" >'), [false]);
  t.deepEqual(fSync('"a" "b" >'), [false]);
  t.deepEqual(fSync('"b" "a" >'), [true]);
});

test('should eval strings', t => {
  const f = new F();
  t.deepEqual(f.eval('"1 2 +"').toJSON(), ['1 2 +']);
  t.deepEqual(f.eval('eval').toJSON(), [3]);
});

test('should @', t => {
  t.deepEqual(fSync('"abc" 0 @'), ['a']);
  t.deepEqual(fSync('"abc" 1 @'), ['b']);
  t.deepEqual(fSync('"abc" 2 @'), ['c']);
});

test('should @ from end', t => {
  t.deepEqual(fSync('"abc" -1 @'), ['c']);
  t.deepEqual(fSync('"abc" -2 @'), ['b']);
  t.deepEqual(fSync('"abc" -3 @'), ['a']);
});

test('should @ from out of bounds', t => {
  t.deepEqual(fSync('"abc" 10 @'), ['']);
});

test('should process string templates', t => {
  t.deepEqual(fSync('`-1 sqrt = $( -1 sqrt )`'), ['-1 sqrt = 0+1i']);
  t.deepEqual(fSync('`0.1 0.2 + = $( 0.1 0.2 + )`'), ['0.1 0.2 + = 0.3']);
  t.deepEqual(fSync('0.1 0.2 q< q< `0.1 0.2 + = $( q> q> + )`'), [
    '0.1 0.2 + = 0.3'
  ]);
  t.deepEqual(fSync('0.1 0.2 q< q< `(0.1 0.2) = $( q> q> )`'), [
    '(0.1 0.2) = 0.1,0.2'
  ]);
  t.deepEqual(fSync('`$0.1 (0.2) + = $( 0.1 0.2 + )`'), ['$0.1 (0.2) + = 0.3']);
});
