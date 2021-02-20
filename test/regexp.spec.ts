import { ƒ } from './helpers/setup';

test('should convert a string to a regexp', async () => {
  expect(await ƒ('"[;:]" regexp type')).toEqual(`[ 'regexp' ]`);
});

test('should split string using regexp', async () => {
  // todo: better comparisons with NaN
  expect(await ƒ('"a;b:c" "[;:]" regexp /')).toEqual(`[ [ 'a' 'b' 'c' ] ]`);
});

test('should replace string using regexp', async () => {
  // todo: better comparisons with NaN
  expect(await ƒ('"a;b:c" "[;:]" regexp "-->" replace')).toEqual(`[ 'a-->b-->c' ]`);
});

test('regular expressions, replace', async () => {
  expect(await ƒ('"abc" "/a./" regexp "X" replace')).toEqual(`[ 'Xc' ]`);
  expect(await ƒ('"abc" "/a.$/" regexp "X" replace')).toEqual(`[ 'abc' ]`);
  expect(await ƒ('"abc" "/a.*$/" regexp "X" replace')).toEqual(`[ 'X' ]`);
  expect(await ƒ('"bcd" "/a./" regexp "X" replace')).toEqual(`[ 'bcd' ]`);
});

test('regular expressions, match', async () => {
  expect(await ƒ('"abc" "/a./" regexp match')).toEqual(`[ [ 'ab' ] ]`);
  expect(await ƒ('"abc" "/a.$/" regexp match')).toEqual(`[ [ ] ]`);
  expect(await ƒ('"abc" "/a.*$/" regexp match')).toEqual(`[ [ 'abc' ] ]`);
  expect(await ƒ('"bcd" "/a./" regexp match')).toEqual(`[ [ ] ]`);
  expect(await ƒ('"bcd" "/a./" regexp match')).toEqual(`[ [ ] ]`);
});

test('regular expressions, match?', async () => {
  expect(await ƒ('"abc" "/a./" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('"abc" "/A./" regexp =~')).toEqual(`[ false ]`);
  expect(await ƒ('"abc" "/A./i" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('"abc" "/a.$/" regexp =~')).toEqual(`[ false ]`);
  expect(await ƒ('"abc" "/a.*$/" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('"bcd" "/a./" regexp =~')).toEqual(`[ false ]`);
});

test('regular expressions, match @', async () => {
  expect(await ƒ('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 0 @')).toEqual(`[ '1' ]`);
  expect(await ƒ('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 1 @')).toEqual(`[ '2' ]`);
  expect(await ƒ('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 2 @')).toEqual(`[ '3' ]`);
});

test('can add (or) regexp', async () => {
  expect(await ƒ('"abc" regexp "def" regexp + type')).toEqual(`[ 'regexp' ]`);
  expect(await ƒ('":" regexp ";" regexp +')).toEqual(`[ /:|;/ ]`);
  expect(await ƒ('"abc" regexp "def" regexp +')).toEqual(`[ /abc|def/ ]`);
  expect(await ƒ('"/abc/i" regexp "/def/" regexp +')).toEqual(`[ /abc|def/i ]`);
  expect(await ƒ('"a;b:c" ";" regexp ":" regexp + /')).toEqual(`[ [ 'a' 'b' 'c' ] ]`);
});

test('can mul (and) regexp', async () => {
  expect(await ƒ('"abc" regexp "def" regexp * type')).toEqual(`[ 'regexp' ]`);
  expect(await ƒ('":" regexp ";" regexp *')).toEqual(`[ /(?=:)(?=;)/ ]`);
  expect(await ƒ('"abc" regexp "def" regexp *')).toEqual(`[ /(?=abc)(?=def)/ ]`);
});

// todo: nor, xor, etc.

test('can mul (repeat) regexp', async () => {
  expect(await ƒ('"abc" regexp 2 * type')).toEqual(`[ 'regexp' ]`);
  expect(await ƒ('":" regexp 2 *')).toEqual(`[ /:{2}/ ]`);
  expect(await ƒ('"abc" regexp 2 *')).toEqual(`[ /(?:abc){2}/ ]`);
  expect(await ƒ('"/abc/i" regexp 2 *')).toEqual(`[ /(?:abc){2}/i ]`);
  expect(await ƒ('"abc" regexp infinity *')).toEqual(`[ /(?:abc){1,}/ ]`);
  expect(await ƒ('"a;;b;c" ";" regexp 2 * /')).toEqual(`[ [ 'a' 'b;c' ] ]`);
});

test('can ~ (not) regexp', async () => {
  expect(await ƒ('"abc" regexp ~ type')).toEqual(`[ 'regexp' ]`);
  expect(await ƒ('":" regexp ~')).toEqual(`[ /(?!:)/ ]`);
  expect(await ƒ('"abc" regexp ~')).toEqual(`[ /(?!abc)/ ]`);
  expect(await ƒ('"/abc/i" regexp ~')).toEqual(`[ /(?!abc)/i ]`);
});

test('can test equality of regexp', async () => {
  expect(await ƒ('";" regexp dup =')).toEqual(`[ true ]`);
  expect(await ƒ('";" regexp ";" regexp =')).toEqual(`[ true ]`);
  expect(await ƒ('";" regexp ":" regexp =')).toEqual(`[ false ]`);
  expect(await ƒ('";|:" regexp ";" regexp ":" regexp + =')).toEqual(`[ true ]`);
});

test('can left and right "shift"', async () => {
  expect(await ƒ('"/abc/i" regexp "/def/" regexp <<')).toEqual(`[ /abcdef/i ]`);
  expect(await ƒ('"/abc/i" regexp "/def/" regexp >>')).toEqual(`[ /abcdef/ ]`);
});

test('regexp works as a macro "macro"', async () => {
  expect(await ƒ('"/abc/i":regexp')).toEqual(`[ /abc/i ]`);
  expect(await ƒ('[ "/abc/i":regexp ]')).toEqual(`[ [ /abc/i ] ]`);
});

test('regexp are not statefull', async () => {
  expect(await ƒ(`'abc' 'abc' '/abc/g' regexp dup [ =~ swap ] dip =~`)).toEqual(`[ true true ]`);
});
