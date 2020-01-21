import { F, fJSON, fValues, fValue } from './helpers/setup';

test('should push strings', async () => {
  expect(await fJSON('"a" "b"')).toEqual(['a', 'b']);
  expect(await fJSON(`'a' 'b'`)).toEqual(['a', 'b']);
  expect(await fJSON('"ab de"')).toEqual(['ab de']);
  expect(await fJSON('""')).toEqual(['']);
  expect(await fJSON('"Dog!🐶"')).toEqual(['Dog!🐶']);
});

test('should decode double quote', async () => {
  expect(
    await fJSON(
      `'\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}'`
    )
  ).toEqual([
    '\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}'
  ]);
  expect(
    await fJSON(
      '"\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}"'
    )
  ).toEqual(['Hello world']);
});

test('should quickcheck strings', async () => {
  expect(await fJSON('[rand-string] [ dup 1 * = ] for-all')).toEqual([[]]);
  expect(
    await fJSON('[rand-string] [ [ ln 2 *] [2 * ln ] bi = ] for-all')
  ).toEqual([[]]);
});

test('should push strings with nested quotes', async () => {
  expect(await fJSON('"ab \'de\' fg"')).toEqual([`ab 'de' fg`]);
  expect(await fJSON('\'ab "de" fg\'')).toEqual(['ab "de" fg']);
});

test('should add', async () => {
  expect(await fJSON('"a" "b" +')).toEqual(['ab']);
});

test('should multiply', async () => {
  expect(await fJSON('"a" 2 *')).toEqual(['aa']);
  expect(await fJSON('"bc" 2 *')).toEqual(['bcbc']);
});

test('should split', async () => {
  expect(await fJSON('"a-b-c" "-" /')).toEqual([['a', 'b', 'c']]);
});

test('should / (split at)', async () => {
  expect(await fJSON('"abc" 2 /')).toEqual(['ab', 'c']);
  expect(await fJSON('"abcd" 2 /')).toEqual(['ab', 'cd']);
  expect(await fJSON('"abcd" 5 /')).toEqual(['abcd', '']);
  expect(await fJSON('"aaX" 2 / +')).toEqual(['aaX']);
});

test('should div (cut)', async () => {
  expect(await fJSON('"abc" 2 \\')).toEqual(['ab']);
  expect(await fJSON('"abcd" 2 \\')).toEqual(['ab']);
  expect(await fJSON('"abcd" 5 \\')).toEqual(['abcd']);
});

test('should mod (cut rem)', async () => {
  expect(await fJSON('"abc" 2 %')).toEqual(['c']);
  expect(await fJSON('"abcd" 2 %')).toEqual(['cd']);
  expect(await fJSON('"abcd" 5 %')).toEqual(['']);
});

test('should div rem, number', async () => {
  expect(await fJSON('"aaX" [ 2 \\ ] [ 2 % ] bi +')).toEqual(['aaX']);
});

test('should split string using string', async () => {
  expect(await fValues('"a;b;c" ";" /')).toEqual([['a', 'b', 'c']]);
});

test('should split string using string, first', async () => {
  expect(await fValues('"a;b;c" ";" \\')).toEqual(['a']);
});

test('should split string using string, rest', async () => {
  expect(await fValues('"a;b;c" ";" %')).toEqual([['b', 'c']]);
});

test('should div rem, string', async () => {
  expect(await fJSON('"a;b;c" [ ";" \\ ] [ ";" % ] bi')).toEqual([
    'a',
    ['b', 'c']
  ]);
});

test('should test equality', async () => {
  expect(await fJSON('"a" "b" =')).toEqual([false]);
  expect(await fJSON('"a" "a" =')).toEqual([true]);
});

test('should <=>', async () => {
  expect(await fValue('"a" "a" <=>')).toEqual(0);
  expect(await fValue('"a" "b" <=>')).toEqual(-1);
  expect(await fValue('"b" "a" <=>')).toEqual(1);
});

test('should test lt', async () => {
  expect(await fJSON('"a" "a" <')).toEqual([false]);
  expect(await fJSON('"a" "b" <')).toEqual([true]);
  expect(await fJSON('"b" "a" <')).toEqual([false]);
});

test('should test gt', async () => {
  expect(await fJSON('"a" "a" >')).toEqual([false]);
  expect(await fJSON('"a" "b" >')).toEqual([false]);
  expect(await fJSON('"b" "a" >')).toEqual([true]);
});

test('should get max/min, alpha sorting', async () => {
  expect(await fJSON('"a" "a" max')).toEqual(['a']);
  expect(await fJSON('"a" "b" max')).toEqual(['b']);
  expect(await fJSON('"b" "a" max')).toEqual(['b']);

  expect(await fJSON('"a" "a" min')).toEqual(['a']);
  expect(await fJSON('"a" "b" min')).toEqual(['a']);
  expect(await fJSON('"b" "a" min')).toEqual(['a']);

  expect(await fJSON('"abc" "xyz" min')).toEqual(['abc']);
  expect(await fJSON('"abc" "xyz" max')).toEqual(['xyz']);
});

test('should eval strings', async () => {
  const f = F();
  expect(f.eval('"1 2 +"').toJSON()).toEqual(['1 2 +']);
  expect(f.eval('eval').stack[0].valueOf()).toEqual(3);
});

test('should @', async () => {
  expect(await fJSON('"abc" 0 @')).toEqual(['a']);
  expect(await fJSON('"abc" 1 @')).toEqual(['b']);
  expect(await fJSON('"abc" 2 @')).toEqual(['c']);
});

test('should @ from end', async () => {
  expect(await fJSON('"abc" -1 @')).toEqual(['c']);
  expect(await fJSON('"abc" -2 @')).toEqual(['b']);
  expect(await fJSON('"abc" -3 @')).toEqual(['a']);
});

test('should @ from out of bounds', async () => {
  expect(await fJSON('"abc" 10 @')).toEqual([null]);
  expect(await fJSON('"abc" -10 @')).toEqual([null]);
});

test('should reverse strings', async () => {
  expect(await fJSON('"timov,tab" reverse')).toEqual(['bat,vomit']);
  expect(await fJSON('"racecar" reverse')).toEqual(['racecar']);
});

test('should filter strings', async () => {
  expect(await fJSON('"dead_beef_123" [alphanumeric?] filter')).toEqual([
    'deadbeef123'
  ]);
});

test('should rot13 strings', async () => {
  expect(await fJSON('"abc" rot13')).toEqual(['nop']);
  expect(await fJSON('"nop" rot13')).toEqual(['abc']);
});

test('should eval palindrome?', async () => {
  expect(await fJSON('"abc" palindrome?')).toEqual([false]);
  expect(await fJSON('"racecar" palindrome?')).toEqual([true]);
  expect(await fJSON('"A man, a plan, a canal: Panama" palindrome?')).toEqual([
    true
  ]);
});

test('should get string length', async () => {
  expect(await fJSON('"abc" ln')).toEqual([3]);
  expect(await fJSON('"racecar" ln')).toEqual([7]);
  expect(await fJSON('"A man, a plan, a canal: Panama" ln')).toEqual([30]);
});

test('should concat strings using << and >>', async () => {
  expect(await fJSON('"dead" "XXXXXXXX" <<')).toEqual(['deadXXXXXXXX']);
  expect(await fJSON('"XXXXXXXX" "beef" >>')).toEqual(['XXXXXXXXbeef']);
});

test('should left and right shift', async () => {
  expect(await fJSON('"deadbeef" 4 <<')).toEqual(['beef']);
  expect(await fJSON('"deadbeef" 4 >>')).toEqual(['dead']);
});

test('should quicksort strings', async () => {
  expect(
    await fValues('"the quick brown fox jumps over the lazy dog" quicksort')
  ).toEqual(['        abcdeeefghhijklmnoooopqrrsttuuvwxyz']);
});

test('string works as a "macro"', async () => {
  expect(await fValues('5:string')).toEqual(['5']);
  expect(await fValues('[ 5:string ]')).toEqual([['5']]);
});
