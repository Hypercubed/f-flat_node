import test from 'ava';
import { F, fJSON, fValues, fValue } from './setup';

test('should push strings', async t => {
  t.deepEqual(await fJSON('"a" "b"'), ['a', 'b']);
  t.deepEqual(await fJSON('\'a\' \'b\''), ['a', 'b']);
  t.deepEqual(await fJSON('"ab de"'), ['ab de'], 'should push strings with spaces');
  t.deepEqual(await fJSON('""'), [''], 'should push empty strings');
  t.deepEqual(await fJSON('"Dog!🐶"'), ['Dog!🐶'], 'should support emoji');
});

test('should decode double quote', async t => {
  t.deepEqual(await fJSON('\'\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}\''), ['\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}']);
  t.deepEqual(await fJSON('"\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}"'), ['Hello world']);
});

test('should quickcheck strings', async t => {
  t.deepEqual(await fJSON('[rand-string] [ dup 1 * = ] for-all'), [[]]);
  t.deepEqual(
    await fJSON('[rand-string] [ [ ln 2 *] [2 * ln ] bi = ] for-all'),
    [[]]
  );
});

test('should push strings with nested quotes', async t => {
  t.deepEqual(await fJSON('"ab \'de\' fg"'), ['ab \'de\' fg']);
  t.deepEqual(await fJSON('\'ab "de" fg\''), ['ab "de" fg']);
});

test('should add', async t => {
  t.deepEqual(await fJSON('"a" "b" +'), ['ab']);
});

test('should multiply', async t => {
  t.deepEqual(await fJSON('"a" 2 *'), ['aa']);
  t.deepEqual(await fJSON('"bc" 2 *'), ['bcbc']);
});

test('should split', async t => {
  t.deepEqual(await fJSON('"a-b-c" "-" /'), [['a', 'b', 'c']]);
});

test('should / (split at)', async t => {
  t.deepEqual(await fJSON('"abc" 2 /'), ['ab', 'c']);
  t.deepEqual(await fJSON('"abcd" 2 /'), ['ab', 'cd']);
  t.deepEqual(await fJSON('"abcd" 5 /'), ['abcd', '']);
  t.deepEqual(await fJSON('"aaX" 2 / +'), ['aaX']);
});

test('should div (cut)', async t => {
  t.deepEqual(await fJSON('"abc" 2 \\'), ['ab']);
  t.deepEqual(await fJSON('"abcd" 2 \\'), ['ab']);
  t.deepEqual(await fJSON('"abcd" 5 \\'), ['abcd']);
});

test('should mod (cut rem)', async t => {
  t.deepEqual(await fJSON('"abc" 2 %'), ['c']);
  t.deepEqual(await fJSON('"abcd" 2 %'), ['cd']);
  t.deepEqual(await fJSON('"abcd" 5 %'), ['']);
});

test('should div rem, number', async t => {
  t.deepEqual(await fJSON('"aaX" [ 2 \\ ] [ 2 % ] bi +'), ['aaX']);
});

test('should split string using string', async t => {
  t.deepEqual(await fValues('"a;b;c" ";" /'), [['a', 'b', 'c']]);
});

test('should split string using string, first', async t => {
  t.deepEqual(await fValues('"a;b;c" ";" \\'), ['a']);
});

test('should split string using string, rest', async t => {
  t.deepEqual(await fValues('"a;b;c" ";" %'), [['b', 'c']]);
});

test('should div rem, string', async t => {
  t.deepEqual(await fJSON('"a;b;c" [ ";" \\ ] [ ";" % ] bi'), ['a', ['b', 'c']]);
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('"a" "b" ='), [false]);
  t.deepEqual(await fJSON('"a" "a" ='), [true]);
});

test('should <=>', async t => {
  t.deepEqual(await fValue('"a" "a" <=>'), 0);
  t.deepEqual(await fValue('"a" "b" <=>'), -1);
  t.deepEqual(await fValue('"b" "a" <=>'), 1);
});

test('should test lt', async t => {
  t.deepEqual(await fJSON('"a" "a" <'), [false]);
  t.deepEqual(await fJSON('"a" "b" <'), [true]);
  t.deepEqual(await fJSON('"b" "a" <'), [false]);
});

test('should test gt', async t => {
  t.deepEqual(await fJSON('"a" "a" >'), [false]);
  t.deepEqual(await fJSON('"a" "b" >'), [false]);
  t.deepEqual(await fJSON('"b" "a" >'), [true]);
});

test('should get max/min, alpha sorting', async t => {
  t.deepEqual(await fJSON('"a" "a" max'), ['a']);
  t.deepEqual(await fJSON('"a" "b" max'), ['b']);
  t.deepEqual(await fJSON('"b" "a" max'), ['b']);

  t.deepEqual(await fJSON('"a" "a" min'), ['a']);
  t.deepEqual(await fJSON('"a" "b" min'), ['a']);
  t.deepEqual(await fJSON('"b" "a" min'), ['a']);

  t.deepEqual(await fJSON('"abc" "xyz" min'), ['abc']);
  t.deepEqual(await fJSON('"abc" "xyz" max'), ['xyz']);
});

test('should eval strings', async t => {
  const f = F();
  t.deepEqual(f.eval('"1 2 +"').toJSON(), ['1 2 +']);
  t.deepEqual(f.eval('eval').stack[0].valueOf(), 3);
});

test('should @', async t => {
  t.deepEqual(await fJSON('"abc" 0 @'), ['a']);
  t.deepEqual(await fJSON('"abc" 1 @'), ['b']);
  t.deepEqual(await fJSON('"abc" 2 @'), ['c']);
});

test('should @ from end', async t => {
  t.deepEqual(await fJSON('"abc" -1 @'), ['c']);
  t.deepEqual(await fJSON('"abc" -2 @'), ['b']);
  t.deepEqual(await fJSON('"abc" -3 @'), ['a']);
});

test('should @ from out of bounds', async t => {
  t.deepEqual(await fJSON('"abc" 10 @'), [null]);
  t.deepEqual(await fJSON('"abc" -10 @'), [null]);
});



test('should reverse strings', async t => {
  t.deepEqual(await fJSON('"timov,tab" reverse'), ['bat,vomit']);
  t.deepEqual(await fJSON('"racecar" reverse'), ['racecar']);
});

test('should filter strings', async t => {
  t.deepEqual(await fJSON('"dead_beef_123" [alphanumeric?] filter'), ['deadbeef123']);
});

test('should rot13 strings', async t => {
  t.deepEqual(await fJSON('"abc" rot13'), ['nop']);
  t.deepEqual(await fJSON('"nop" rot13'), ['abc']);
});

test('should eval palindrome?', async t => {
  t.deepEqual(await fJSON('"abc" palindrome?'), [false]);
  t.deepEqual(await fJSON('"racecar" palindrome?'), [true]);
  t.deepEqual(await fJSON('"A man, a plan, a canal: Panama" palindrome?'), [true]);
});

test('should get string length', async t => {
  t.deepEqual(await fJSON('"abc" ln'), [3]);
  t.deepEqual(await fJSON('"racecar" ln'), [7]);
  t.deepEqual(await fJSON('"A man, a plan, a canal: Panama" ln'), [30]);
});

test('should concat strings using << and >>', async t => {
  t.deepEqual(await fJSON('"dead" "XXXXXXXX" <<'), ['deadXXXXXXXX']);
  t.deepEqual(await fJSON('"XXXXXXXX" "beef" >>'), ['XXXXXXXXbeef']);
});

test('should left and right shift', async t => {
  t.deepEqual(await fJSON('"deadbeef" 4 <<'), ['beef']);
  t.deepEqual(await fJSON('"deadbeef" 4 >>'), ['dead']);
});

test('should quicksort strings', async t => {
  t.deepEqual(
    await fValues('"the quick brown fox jumps over the lazy dog" quicksort'),
    ['        abcdeeefghhijklmnoooopqrrsttuuvwxyz']
  );
});

test('string works as a "macro"', async t => {
  t.deepEqual(await fValues('5:string'), ['5']);
  t.deepEqual(await fValues('[ 5:string ]'), [[ '5' ]]);
});
