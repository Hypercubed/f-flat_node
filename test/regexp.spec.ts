import test from 'ava';
import {
  fJSON,
  fValues,
} from './helpers/setup';

test('should convert a string to a regexp', async t => {
  t.deepEqual(await fValues('"[;:]" regexp type'), ['regexp']);
});

test('should split string using regexp', async t => {  // todo: better comparisons with NaN
  t.deepEqual(await fValues('"a;b:c" "[;:]" regexp /'), [['a', 'b', 'c']]);
});

test('should replace string using regexp', async t => {  // todo: better comparisons with NaN
  t.deepEqual(await fValues('"a;b:c" "[;:]" regexp "-->" replace'), ['a-->b-->c']);
});

test('regular expressions, replace', async t => {
  t.deepEqual(await fJSON('"abc" "/a./" regexp "X" replace'), ['Xc']);
  t.deepEqual(await fJSON('"abc" "/a.$/" regexp "X" replace'), ['abc']);
  t.deepEqual(await fJSON('"abc" "/a.*$/" regexp "X" replace'), ['X']);
  t.deepEqual(await fJSON('"bcd" "/a./" regexp "X" replace'), ['bcd']);
});

test('regular expressions, match', async t => {
  t.deepEqual(await fJSON('"abc" "/a./" regexp match'), [['ab']]);
  t.deepEqual(await fJSON('"abc" "/a.$/" regexp match'), [[]]);
  t.deepEqual(await fJSON('"abc" "/a.*$/" regexp match'), [['abc']]);
  t.deepEqual(await fJSON('"bcd" "/a./" regexp match'), [[]]);
  t.deepEqual(await fJSON('"bcd" "/a./" regexp match'), [[]]);
});

test('regular expressions, match?', async t => {
  t.deepEqual(await fJSON('"abc" "/a./" regexp =~'), [true]);
  t.deepEqual(await fJSON('"abc" "/A./" regexp =~'), [false]);
  t.deepEqual(await fJSON('"abc" "/A./i" regexp =~'), [true]);
  t.deepEqual(await fJSON('"abc" "/a.$/" regexp =~'), [false]);
  t.deepEqual(await fJSON('"abc" "/a.*$/" regexp =~'), [true]);
  t.deepEqual(await fJSON('"bcd" "/a./" regexp =~'), [false]);
});

test('regular expressions, match @', async t => {
  t.deepEqual(await fJSON('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 0 @'), ['1']);
  t.deepEqual(await fJSON('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 1 @'), ['2']);
  t.deepEqual(await fJSON('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 2 @'), ['3']);
});

test('can add (or) regexp', async t => {
  t.deepEqual(await fValues('"abc" regexp "def" regexp + type'), ['regexp']);
  t.deepEqual(await fValues('"\:" regexp "\;" regexp +'), [/:|;/], 'no enclosure needed');
  t.deepEqual(await fValues('"abc" regexp "def" regexp +'), [/abc|def/], 'enclosure needed');
  t.deepEqual(await fValues('"/abc/i" regexp "/def/" regexp +'), [/abc|def/i], 'keep lhs flags');
  t.deepEqual(await fJSON('"a;b:c" ";" regexp ":" regexp + /'), [['a', 'b', 'c']]);
});

test('can mul (and) regexp', async t => {
  t.deepEqual(await fValues('"abc" regexp "def" regexp * type'), ['regexp']);
  t.deepEqual(await fValues('"\:" regexp "\;" regexp *'), [/(?=:)(?=;)/], 'no enclosure needed');
  t.deepEqual(await fValues('"abc" regexp "def" regexp *'), [/(?=abc)(?=def)/], 'enclosure needed');
});

// todo: nor, xor, etc.

test('can mul (repeat) regexp', async t => {
  t.deepEqual(await fValues('"abc" regexp 2 * type'), ['regexp']);
  t.deepEqual(await fValues('":" regexp 2 *'), [/:{2}/], 'no enclosure needed');
  t.deepEqual(await fValues('"abc" regexp 2 *'), [/(?:abc){2}/], 'enclosure needed');
  t.deepEqual(await fValues('"/abc/i" regexp 2 *'), [/(?:abc){2}/i], 'keep flags');
  t.deepEqual(await fValues('"abc" regexp infinity *'), [/(?:abc){1,}/]);
  t.deepEqual(await fJSON('"a;;b;c" ";" regexp 2 * /'), [['a', 'b;c']]);
});

test('can ~ (not) regexp', async t => {
  t.deepEqual(await fValues('"abc" regexp ~ type'), ['regexp']);
  t.deepEqual(await fValues('":" regexp ~'), [/(?!:)/], 'no enclosure needed');
  t.deepEqual(await fValues('"abc" regexp ~'), [/(?!abc)/], 'enclosure needed');
  t.deepEqual(await fValues('"/abc/i" regexp ~'), [/(?!abc)/i], 'keeps flags');
});

test('can test equality of regexp', async t => {
  t.deepEqual(await fValues('";" regexp dup ='), [true]);
  t.deepEqual(await fValues('";" regexp ";" regexp ='), [true]);
  t.deepEqual(await fValues('";" regexp ":" regexp ='), [false]);
  t.deepEqual(await fValues('";|:" regexp ";" regexp ":" regexp + ='), [true]);
});

test('can left and right "shift"', async t => {
  t.deepEqual(await fValues('"/abc/i" regexp "/def/" regexp <<'), [/abcdef/i], 'keep lhs flags');
  t.deepEqual(await fValues('"/abc/i" regexp "/def/" regexp >>'), [/abcdef/], 'keep rhs flags');
});

test('regexp works as a macro "macro"', async t => {
  t.deepEqual(await fValues('"/abc/i":regexp'), [/abc/i]);
  t.deepEqual(await fValues('[ "/abc/i":regexp ]'), [[ /abc/i ]]);
});



