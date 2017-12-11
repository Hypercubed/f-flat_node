import test from 'ava';
import { F, fSyncJSON } from './setup';

test('should push strings', t => {
  t.deepEqual(fSyncJSON('"a" "b"'), ['a', 'b']);
  t.deepEqual(fSyncJSON('\'a\' \'b\''), ['a', 'b']);
  t.deepEqual(fSyncJSON('"ab de"'), ['ab de'], 'should push strings with spaces');
  t.deepEqual(fSyncJSON('""'), [''], 'should push empty strings');
  t.deepEqual(fSyncJSON('"Dog!🐶"'), ['Dog!🐶'], 'should support emoji');
});

test('should quickcheck strings', t => {
  t.deepEqual(fSyncJSON('[rand-string] [ dup 1 * = ] for-all'), [[]]);
  t.deepEqual(fSyncJSON('[rand-string] [ dup 2 * 2 / = ] for-all'), [[]]);
  t.deepEqual(
    fSyncJSON('[rand-string] [ [length 2 *] [2 * length] bi = ] for-all'),
    [[]]
  );
});

test('should push strings with nested quotes', t => {
  t.deepEqual(fSyncJSON('"ab \'de\' fg"'), ['ab \'de\' fg']);
  t.deepEqual(fSyncJSON('\'ab "de" fg\''), ['ab "de" fg']);
});

test('should add', t => {
  t.deepEqual(fSyncJSON('"a" "b" +'), ['ab']);
});

test('should multiply', t => {
  t.deepEqual(fSyncJSON('"a" 2 *'), ['aa']);
  t.deepEqual(fSyncJSON('"bc" 2 *'), ['bcbc']);
});

test('should split', t => {
  t.deepEqual(fSyncJSON('"a-b-c" "-" /'), [['a', 'b', 'c']]);
});

test('should cut', t => {
  t.deepEqual(fSyncJSON('"abcd" 2 /'), ['ab']);
  t.deepEqual(fSyncJSON('"abcd" 5 /'), [null]);
});

test('should test equality', t => {
  t.deepEqual(fSyncJSON('"a" "b" ='), [false]);
  t.deepEqual(fSyncJSON('"a" "a" ='), [true]);
});

test('should cmp', t => {
  t.deepEqual(fSyncJSON('"a" "a" cmp'), [0]);
  t.deepEqual(fSyncJSON('"a" "b" cmp'), [-1]);
  t.deepEqual(fSyncJSON('"b" "a" cmp'), [1]);
});

test('should test lt', t => {
  t.deepEqual(fSyncJSON('"a" "a" <'), [false]);
  t.deepEqual(fSyncJSON('"a" "b" <'), [true]);
  t.deepEqual(fSyncJSON('"b" "a" <'), [false]);
});

test('should test gt', t => {
  t.deepEqual(fSyncJSON('"a" "a" >'), [false]);
  t.deepEqual(fSyncJSON('"a" "b" >'), [false]);
  t.deepEqual(fSyncJSON('"b" "a" >'), [true]);
});

test('should eval strings', t => {
  const f = new F();
  t.deepEqual(f.eval('"1 2 +"').toJSON(), ['1 2 +']);
  t.deepEqual(f.eval('eval').stack[0].valueOf(), 3);
});

test('should @', t => {
  t.deepEqual(fSyncJSON('"abc" 0 @'), ['a']);
  t.deepEqual(fSyncJSON('"abc" 1 @'), ['b']);
  t.deepEqual(fSyncJSON('"abc" 2 @'), ['c']);
});

test('should @ from end', t => {
  t.deepEqual(fSyncJSON('"abc" -1 @'), ['c']);
  t.deepEqual(fSyncJSON('"abc" -2 @'), ['b']);
  t.deepEqual(fSyncJSON('"abc" -3 @'), ['a']);
});

test('should @ from out of bounds', t => {
  t.deepEqual(fSyncJSON('"abc" 10 @'), ['']);
});

test('should process string templates', t => {
  t.deepEqual(fSyncJSON('`-1 sqrt = $( -1 sqrt )`'), ['-1 sqrt = 0+1i']);
  t.deepEqual(fSyncJSON('`0.1 0.2 + = $( 0.1 0.2 + )`'), ['0.1 0.2 + = 0.3']);
  t.deepEqual(fSyncJSON('0.1 0.2 q< q< `0.1 0.2 + = $( q> q> + )`'), [
    '0.1 0.2 + = 0.3'
  ]);
  t.deepEqual(fSyncJSON('0.1 0.2 q< q< `(0.1 0.2) = $( q> q> )`'), [
    '(0.1 0.2) = 0.1,0.2'
  ]);
  t.deepEqual(fSyncJSON('`$0.1 (0.2) + = $( 0.1 0.2 + )`'), ['$0.1 (0.2) + = 0.3']);
});

test('should reverse strings', t => {
  t.deepEqual(fSyncJSON('"timov,tab" reverse'), ['bat,vomit']);
  t.deepEqual(fSyncJSON('"racecar" reverse'), ['racecar']);
});

test('should filter strings', t => {
  t.deepEqual(fSyncJSON('"dead_beef_123" [alphanumeric?] filter'), ['deadbeef123']);
});

test('should rot13 strings', t => {
  t.deepEqual(fSyncJSON('"abc" rot13'), ['nop']);
  t.deepEqual(fSyncJSON('"nop" rot13'), ['abc']);
});

test('should eval palindrome?', t => {
  t.deepEqual(fSyncJSON('"abc" palindrome?'), [false]);
  t.deepEqual(fSyncJSON('"racecar" palindrome?'), [true]);
  t.deepEqual(fSyncJSON('"A man, a plan, a canal: Panama" palindrome?'), [true]);
});

test('should get length palindrome?', t => {
  t.deepEqual(fSyncJSON('"abc" length'), [3]);
  t.deepEqual(fSyncJSON('"racecar" length'), [7]);
  t.deepEqual(fSyncJSON('"A man, a plan, a canal: Panama" length'), [30]);
});