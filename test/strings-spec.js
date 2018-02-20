import test from 'ava';
import { F, fSyncJSON, fSyncValues } from './setup';

test('should push strings', t => {
  t.deepEqual(fSyncJSON('"a" "b"'), ['a', 'b']);
  t.deepEqual(fSyncJSON('\'a\' \'b\''), ['a', 'b']);
  t.deepEqual(fSyncJSON('"ab de"'), ['ab de'], 'should push strings with spaces');
  t.deepEqual(fSyncJSON('""'), [''], 'should push empty strings');
  t.deepEqual(fSyncJSON('"Dog!🐶"'), ['Dog!🐶'], 'should support emoji');
});

test('should decode double quote', t => {
  t.deepEqual(fSyncJSON('\'\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}\''), ['\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}']);
  t.deepEqual(fSyncJSON('"\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}"'), ['Hello world']);
});

test('should quickcheck strings', t => {
  t.deepEqual(fSyncJSON('[rand-string] [ dup 1 * = ] for-all'), [[]]);
  t.deepEqual(
    fSyncJSON('[rand-string] [ [ ln 2 *] [2 * ln ] bi = ] for-all'),
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

test('should / (split at)', t => {
  t.deepEqual(fSyncJSON('"abc" 2 /'), ['ab', 'c']);
  t.deepEqual(fSyncJSON('"abcd" 2 /'), ['ab', 'cd']);
  t.deepEqual(fSyncJSON('"abcd" 5 /'), ['abcd', '']);
  t.deepEqual(fSyncJSON('"aaX" 2 / +'), ['aaX']);
});

test('should div (cut)', t => {
  t.deepEqual(fSyncJSON('"abc" 2 \\'), ['ab']);
  t.deepEqual(fSyncJSON('"abcd" 2 \\'), ['ab']);
  t.deepEqual(fSyncJSON('"abcd" 5 \\'), ['abcd']);
});

test('should mod (cut rem)', t => {
  t.deepEqual(fSyncJSON('"abc" 2 %'), ['c']);
  t.deepEqual(fSyncJSON('"abcd" 2 %'), ['cd']);
  t.deepEqual(fSyncJSON('"abcd" 5 %'), ['']);
});

test('should div rem', t => {
  t.deepEqual(fSyncJSON('"aaX" [ 2 \\ ] [ 2 % ] bi +'), ['aaX']);
});

test('should split string using string', t => {
  t.deepEqual(fSyncValues('"a;b;c" ";" /'), [['a', 'b', 'c']]);
});

test('should split string using string, first', t => {
  t.deepEqual(fSyncValues('"a;b;c" ";" \\'), ['a']);
});

test('should split string using string, rest', t => {
  t.deepEqual(fSyncValues('"a;b;c" ";" %'), [['b', 'c']]);
});

test('should div rem', t => {
  t.deepEqual(fSyncJSON('"a;b;c" [ ";" \\ ] [ ";" % ] bi'), ['a', ['b', 'c']]);
});

test('should test equality', t => {
  t.deepEqual(fSyncJSON('"a" "b" ='), [false]);
  t.deepEqual(fSyncJSON('"a" "a" ='), [true]);
});

test('should <=>', t => {
  t.deepEqual(fSyncJSON('"a" "a" <=>'), [0]);
  t.deepEqual(fSyncJSON('"a" "b" <=>'), [-1]);
  t.deepEqual(fSyncJSON('"b" "a" <=>'), [1]);
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

test('should get max/min, alpha sorting', t => {
  t.deepEqual(fSyncJSON('"a" "a" max'), ['a']);
  t.deepEqual(fSyncJSON('"a" "b" max'), ['b']);
  t.deepEqual(fSyncJSON('"b" "a" max'), ['b']);

  t.deepEqual(fSyncJSON('"a" "a" min'), ['a']);
  t.deepEqual(fSyncJSON('"a" "b" min'), ['a']);
  t.deepEqual(fSyncJSON('"b" "a" min'), ['a']);

  t.deepEqual(fSyncJSON('"abc" "xyz" min'), ['abc']);
  t.deepEqual(fSyncJSON('"abc" "xyz" max'), ['xyz']);
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
  t.deepEqual(fSyncJSON('"abc" 10 @'), [null]);
  t.deepEqual(fSyncJSON('"abc" -10 @'), [null]);
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

test('should get string length', t => {
  t.deepEqual(fSyncJSON('"abc" ln'), [3]);
  t.deepEqual(fSyncJSON('"racecar" ln'), [7]);
  t.deepEqual(fSyncJSON('"A man, a plan, a canal: Panama" ln'), [30]);
});

test('should concat strings using << and >>', t => {
  t.deepEqual(fSyncJSON('"dead" "XXXXXXXX" <<'), ['deadXXXXXXXX']);
  t.deepEqual(fSyncJSON('"XXXXXXXX" "beef" >>'), ['XXXXXXXXbeef']);
});

test('should left and right shift', t => {
  t.deepEqual(fSyncJSON('"deadbeef" 4 <<'), ['beef']);
  t.deepEqual(fSyncJSON('"deadbeef" 4 >>'), ['dead']);
});

test('should quicksort strings', t => {
  t.deepEqual(
    fSyncValues('"the quick brown fox jumps over the lazy dog" quicksort'),
    ['        abcdeeefghhijklmnoooopqrrsttuuvwxyz']
  );
});

test('string works as a "macro"', t => {
  t.deepEqual(fSyncValues('5:string'), ['5']);
  t.deepEqual(fSyncValues('[ 5:string ]'), [[ '5' ]]);
});
