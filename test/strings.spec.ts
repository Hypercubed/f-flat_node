import { ƒ, τ } from './helpers/setup';

test('should push strings', async () => {
  expect(await ƒ('"a" "b"')).toEqual(`[ 'a' 'b' ]`);
  expect(await ƒ(`'a' 'b'`)).toEqual(`[ 'a' 'b' ]`);
  expect(await ƒ('"ab de"')).toEqual(`[ 'ab de' ]`);
  expect(await ƒ('""')).toEqual(`[ '' ]`);
  expect(await ƒ('"Dog!🐶"')).toEqual(`[ 'Dog!🐶' ]`);
});

test('should decode double quote', async () => {
  expect(
    await ƒ(
      `'\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}'`
    )
  ).toEqual(
    τ([
      '\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}'
    ])
  );
  expect(
    await ƒ(
      '"\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}"'
    )
  ).toEqual(`[ 'Hello world' ]`);
});

test('should push strings with nested quotes', async () => {
  expect(await ƒ(`"ab 'de' fg"`)).toEqual(`[ 'ab \\'de\\' fg' ]`);
  expect(await ƒ(`'ab "de" fg'`)).toEqual(`[ 'ab \\"de\\" fg' ]`);
  expect(await ƒ('`ab "de\' fg`')).toEqual(`[ 'ab \\"de\\' fg' ]`);
});

test('should push strings with escaped quotes', async () => {
  expect(await ƒ('"ab \\"de\\" fg"')).toEqual(`[ 'ab \\"de\\" fg' ]`);
  expect(await ƒ('`ab \\`de\\` fg`')).toEqual('[ \'ab \\\\`de\\\\` fg\' ]'); // not right
});

describe('unicode in strings', () => {
  test('character with ASCII code \\yyy octal', async () => {
    expect(await ƒ(`'Fb\\251'`)).toEqual(`[ 'Fb\\\\251' ]`);
    expect(await ƒ('"Fb\\251"')).toEqual(`[ 'Fb©' ]`);
    expect(await ƒ('`Fb\\251`')).toEqual(`[ 'Fb©' ]`);
  });

  test('character with ASCII code \\xhh hexadecimal', async () => {
    expect(await ƒ(`'F\\x62\\xA9'`)).toEqual(`[ 'F\\\\x62\\\\xA9' ]`);
    expect(await ƒ('"F\\x62\\xA9"')).toEqual(`[ 'Fb©' ]`);
    expect(await ƒ('`F\\x62\\xA9`')).toEqual(`[ 'Fb©' ]`);
  });

  test('character with code \\uhhhh hexadecimal', async () => {
    expect(await ƒ(`'F\\u266D\\u00A9'`)).toEqual(`[ 'F\\\\u266D\\\\u00A9' ]`);
    expect(await ƒ('"F\\u266D\\u00A9"')).toEqual(`[ 'F♭©' ]`);
    expect(await ƒ('`F\\u266D\\u00A9`')).toEqual(`[ 'F♭©' ]`);
  });

  test('character with code \\u{h} hexadecimal', async () => {
    expect(await ƒ(`'\\u{1F4A9}'`)).toEqual(`[ '\\\\u{1F4A9}' ]`);
    expect(await ƒ('"\\u{1F4A9}"')).toEqual(`[ '💩' ]`);
    expect(await ƒ('`\\u{1F4A9}`')).toEqual(`[ '💩' ]`);
  });

  test('character with code \\Uhhhhhhhh hexadecimal', async () => {
    expect(await ƒ(`'\\U0001F4A9'`)).toEqual(`[ '\\\\U0001F4A9' ]`);
    expect(await ƒ('"\\U0001F4A9"')).toEqual(`[ '💩' ]`);
    expect(await ƒ('`\\U0001F4A9`')).toEqual(`[ '💩' ]`);
  });

  // test('character with given Unicode name', async () => {
  //   expect(await ƒ('"F\\u[flat]"')).toEqual(`[ 'F♭' ]`);
  // });
});

test('should add', async () => {
  expect(await ƒ('"a" "b" +')).toEqual(`[ 'ab' ]`);
});

test('should multiply', async () => {
  expect(await ƒ('"a" 2 *')).toEqual(`[ 'aa' ]`);
  expect(await ƒ('"bc" 2 *')).toEqual(`[ 'bcbc' ]`);
});

test('should split', async () => {
  expect(await ƒ('"a-b-c" "-" /')).toEqual(`[ [ 'a' 'b' 'c' ] ]`);
});

test('should / (split at)', async () => {
  expect(await ƒ('"abc" 2 /')).toEqual(`[ 'ab' 'c' ]`);
  expect(await ƒ('"abcd" 2 /')).toEqual(`[ 'ab' 'cd' ]`);
  expect(await ƒ('"abcd" 5 /')).toEqual(`[ 'abcd' '' ]`);
  expect(await ƒ('"aaX" 2 / +')).toEqual(`[ 'aaX' ]`);
});

test('should div (cut)', async () => {
  expect(await ƒ('"abc" 2 \\')).toEqual(`[ 'ab' ]`);
  expect(await ƒ('"abcd" 2 \\')).toEqual(`[ 'ab' ]`);
  expect(await ƒ('"abcd" 5 \\')).toEqual(`[ 'abcd' ]`);
});

test('should mod (cut rem)', async () => {
  expect(await ƒ('"abc" 2 %')).toEqual(`[ 'c' ]`);
  expect(await ƒ('"abcd" 2 %')).toEqual(`[ 'cd' ]`);
  expect(await ƒ('"abcd" 5 %')).toEqual(`[ '' ]`);
});

test('should div rem, number', async () => {
  expect(await ƒ('"aaX" [ 2 \\ ] [ 2 % ] bi +')).toEqual(`[ 'aaX' ]`);
});

test('should split string using string', async () => {
  expect(await ƒ('"a;b;c" ";" /')).toEqual(`[ [ 'a' 'b' 'c' ] ]`);
});

test('should split string using string, first', async () => {
  expect(await ƒ('"a;b;c" ";" \\')).toEqual(`[ 'a' ]`);
});

test('should split string using string, rest', async () => {
  expect(await ƒ('"a;b;c" ";" %')).toEqual(`[ [ 'b' 'c' ] ]`);
});

test('should div rem, string', async () => {
  expect(await ƒ('"a;b;c" [ ";" \\ ] [ ";" % ] bi')).toEqual(
    `[ 'a' [ 'b' 'c' ] ]`
  );
});

test('should test equality', async () => {
  expect(await ƒ('"a" "b" =')).toEqual(`[ false ]`);
  expect(await ƒ('"a" "a" =')).toEqual(`[ true ]`);
});

test('should <=>', async () => {
  expect(await ƒ('"a" "a" <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('"a" "b" <=>')).toEqual(`[ -1 ]`);
  expect(await ƒ('"b" "a" <=>')).toEqual(`[ 1 ]`);
});

test('should test lt', async () => {
  expect(await ƒ('"a" "a" <')).toEqual(`[ false ]`);
  expect(await ƒ('"a" "b" <')).toEqual(`[ true ]`);
  expect(await ƒ('"b" "a" <')).toEqual(`[ false ]`);
});

test('should test gt', async () => {
  expect(await ƒ('"a" "a" >')).toEqual(`[ false ]`);
  expect(await ƒ('"a" "b" >')).toEqual(`[ false ]`);
  expect(await ƒ('"b" "a" >')).toEqual(`[ true ]`);
});

test('should get max/min, alpha sorting', async () => {
  expect(await ƒ('"a" "a" max')).toEqual(`[ 'a' ]`);
  expect(await ƒ('"a" "b" max')).toEqual(`[ 'b' ]`);
  expect(await ƒ('"b" "a" max')).toEqual(`[ 'b' ]`);

  expect(await ƒ('"a" "a" min')).toEqual(`[ 'a' ]`);
  expect(await ƒ('"a" "b" min')).toEqual(`[ 'a' ]`);
  expect(await ƒ('"b" "a" min')).toEqual(`[ 'a' ]`);

  expect(await ƒ('"abc" "xyz" min')).toEqual(`[ 'abc' ]`);
  expect(await ƒ('"abc" "xyz" max')).toEqual(`[ 'xyz' ]`);
});

test('should eval strings', async () => {
  expect(await ƒ('"1 2 +" eval')).toEqual(`[ 3 ]`);
});

test('should @', async () => {
  expect(await ƒ('"abc" 0 @')).toEqual(`[ 'a' ]`);
  expect(await ƒ('"abc" 1 @')).toEqual(`[ 'b' ]`);
  expect(await ƒ('"abc" 2 @')).toEqual(`[ 'c' ]`);
});

test('should @ from end', async () => {
  expect(await ƒ('"abc" -1 @')).toEqual(`[ 'c' ]`);
  expect(await ƒ('"abc" -2 @')).toEqual(`[ 'b' ]`);
  expect(await ƒ('"abc" -3 @')).toEqual(`[ 'a' ]`);
});

test('should @ from out of bounds', async () => {
  expect(await ƒ('"abc" 10 @')).toEqual(`[ null ]`);
  expect(await ƒ('"abc" -10 @')).toEqual(`[ null ]`);
});

test('should reverse strings', async () => {
  expect(await ƒ('"timov,tab" reverse')).toEqual(`[ 'bat,vomit' ]`);
  expect(await ƒ('"racecar" reverse')).toEqual(`[ 'racecar' ]`);
});

test('should filter strings', async () => {
  expect(await ƒ('"dead_beef_123" [alphanumeric?] filter')).toEqual(
    `[ 'deadbeef123' ]`
  );
});

test('should rot13 strings', async () => {
  expect(await ƒ('"abc" rot13')).toEqual(`[ 'nop' ]`);
  expect(await ƒ('"nop" rot13')).toEqual(`[ 'abc' ]`);
});

test('should eval palindrome?', async () => {
  expect(await ƒ('"abc" palindrome?')).toEqual(`[ false ]`);
  expect(await ƒ('"racecar" palindrome?')).toEqual(`[ true ]`);
  expect(await ƒ('"A man, a plan, a canal: Panama" palindrome?')).toEqual(
    `[ true ]`
  );
});

test('should get string length', async () => {
  expect(await ƒ('"abc" ln')).toEqual(`[ 3 ]`);
  expect(await ƒ('"racecar" ln')).toEqual(`[ 7 ]`);
  expect(await ƒ('"A man, a plan, a canal: Panama" ln')).toEqual(`[ 30 ]`);
});

test('should concat strings using << and >>', async () => {
  expect(await ƒ('"dead" "XXXXXXXX" <<')).toEqual(`[ 'deadXXXXXXXX' ]`);
  expect(await ƒ('"XXXXXXXX" "beef" >>')).toEqual(`[ 'XXXXXXXXbeef' ]`);
});

test('should left and right shift', async () => {
  expect(await ƒ('"deadbeef" 4 <<')).toEqual(`[ 'beef' ]`);
  expect(await ƒ('"deadbeef" 4 >>')).toEqual(`[ 'dead' ]`);
});

test('string works as a "macro"', async () => {
  expect(await ƒ('5:string')).toEqual(`[ '5' ]`);
  expect(await ƒ('[ 5:string ]')).toEqual(`[ [ '5' ] ]`);
});
