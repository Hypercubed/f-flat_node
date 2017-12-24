import test from 'ava';
import {
  F,
  fSyncJSON,
  fSyncStack,
  fSyncValues,
  fSyncString,
  Word,
  Sentence,
  Decimal,
  D, V
} from './setup';

test('should convert a string to a regexp', t => {
  t.deepEqual(fSyncValues('"[;:]" regexp type'), ['regexp']);
});

test('should split string using regexp', t => {  // todo: better comparisons with NaN
  t.deepEqual(fSyncValues('"a;b:c" "[;:]" regexp /'), [['a', 'b', 'c']]);
});

test('should replace string using regexp', t => {  // todo: better comparisons with NaN
  t.deepEqual(fSyncValues('"a;b:c" "[;:]" regexp "-->" replace'), ['a-->b-->c']);
});

test('regular expressions, replace', t => {
  t.deepEqual(fSyncJSON('"abc" "/a./" regexp "X" replace'), ['Xc']);
  t.deepEqual(fSyncJSON('"abc" "/a.$/" regexp "X" replace'), ['abc']);
  t.deepEqual(fSyncJSON('"abc" "/a.*$/" regexp "X" replace'), ['X']);
  t.deepEqual(fSyncJSON('"bcd" "/a./" regexp "X" replace'), ['bcd']);
});

test('regular expressions, match', t => {
  t.deepEqual(fSyncJSON('"abc" "/a./" regexp match'), [['ab']]);
  t.deepEqual(fSyncJSON('"abc" "/a.$/" regexp match'), [[]]);
  t.deepEqual(fSyncJSON('"abc" "/a.*$/" regexp match'), [['abc']]);
  t.deepEqual(fSyncJSON('"bcd" "/a./" regexp match'), [[]]);
  t.deepEqual(fSyncJSON('"bcd" "/a./" regexp match'), [[]]);
});

test('regular expressions, match?', t => {
  t.deepEqual(fSyncJSON('"abc" "/a./" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('"abc" "/A./" regexp =~'), [false]);
  t.deepEqual(fSyncJSON('"abc" "/A./i" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('"abc" "/a.$/" regexp =~'), [false]);
  t.deepEqual(fSyncJSON('"abc" "/a.*$/" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('"bcd" "/a./" regexp =~'), [false]);
});

test('regular expressions, match @', t => {
  t.deepEqual(fSyncJSON('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 0 @'), ['1']);
  t.deepEqual(fSyncJSON('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 1 @'), ['2']);
  t.deepEqual(fSyncJSON('"aaaa1aaaa2aaaa3" "/[0-9]/g" regexp match 2 @'), ['3']);
});

test('can add (or) regexp', t => {
  t.deepEqual(fSyncValues('"abc" regexp "def" regexp + type'), ['regexp']);
  t.deepEqual(fSyncValues('"\:" regexp "\;" regexp +'), [/:|;/], 'no enclosure needed');
  t.deepEqual(fSyncValues('"abc" regexp "def" regexp +'), [/abc|def/], 'enclosure needed');
  t.deepEqual(fSyncValues('"/abc/i" regexp "/def/" regexp +'), [/abc|def/i], 'keep lhs flags');
  t.deepEqual(fSyncJSON('"a;b:c" ";" regexp ":" regexp + /'), [['a', 'b', 'c']]);
});

test('can mul (and) regexp', t => {
  t.deepEqual(fSyncValues('"abc" regexp "def" regexp * type'), ['regexp']);
  t.deepEqual(fSyncValues('"\:" regexp "\;" regexp *'), [/(?=:)(?=;)/], 'no enclosure needed');
  t.deepEqual(fSyncValues('"abc" regexp "def" regexp *'), [/(?=abc)(?=def)/], 'enclosure needed');
});

// todo: nor, xor, etc.

test('can mul (repeat) regexp', t => {
  t.deepEqual(fSyncValues('"abc" regexp 2 * type'), ['regexp']);
  t.deepEqual(fSyncValues('":" regexp 2 *'), [/:{2}/], 'no enclosure needed');
  t.deepEqual(fSyncValues('"abc" regexp 2 *'), [/(?:abc){2}/], 'enclosure needed');
  t.deepEqual(fSyncValues('"/abc/i" regexp 2 *'), [/(?:abc){2}/i], 'keep flags');
  t.deepEqual(fSyncValues('"abc" regexp infinity *'), [/(?:abc){1,}/]);
  t.deepEqual(fSyncJSON('"a;;b;c" ";" regexp 2 * /'), [['a', 'b;c']]);
});

test('can ~ (not) regexp', t => {
  t.deepEqual(fSyncValues('"abc" regexp ~ type'), ['regexp']);
  t.deepEqual(fSyncValues('":" regexp ~'), [/(?!:)/], 'no enclosure needed');
  t.deepEqual(fSyncValues('"abc" regexp ~'), [/(?!abc)/], 'enclosure needed');
  t.deepEqual(fSyncValues('"/abc/i" regexp ~'), [/(?!abc)/i], 'keeps flags');
});

test('can test equality of regexp', t => {
  t.deepEqual(fSyncValues('";" regexp dup ='), [true]);
  t.deepEqual(fSyncValues('";" regexp ";" regexp ='), [true]);
  t.deepEqual(fSyncValues('";" regexp ":" regexp ='), [false]);
  t.deepEqual(fSyncValues('";|:" regexp ";" regexp ":" regexp + ='), [true]);
});

test('can left and right "shift"', t => {
  t.deepEqual(fSyncValues('"/abc/i" regexp "/def/" regexp <<'), [/abcdef/i], 'keep lhs flags');
  t.deepEqual(fSyncValues('"/abc/i" regexp "/def/" regexp >>'), [/abcdef/], 'keep rhs flags');
});



