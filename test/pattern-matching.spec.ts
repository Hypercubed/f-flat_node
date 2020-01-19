import test from 'ava';
import { fJSON } from './helpers/setup';

test('should test equality for strings', async t => {
  t.deepEqual(await fJSON('"abc" "def" =~'), [false]);
  t.deepEqual(await fJSON('"abc" "abc" =~'), [true]);
});

test('should test equality for numbers', async t => {
  t.deepEqual(await fJSON('1 2 =~'), [false]);
  t.deepEqual(await fJSON('2 2 =~'), [true]);
});

test('should match words', async t => {
  t.deepEqual(await fJSON('x: y: =~'), [false]);
  t.deepEqual(await fJSON('x: x: =~'), [true]);
});

test('should match objects', async t => {
  t.deepEqual(await fJSON('{} {} =~'), [true]);
  t.deepEqual(await fJSON('{x: 1} {} =~'), [true]);
  t.deepEqual(await fJSON('{x: 1} {x: 1} =~'), [true]);
  t.deepEqual(await fJSON('{x: 1} {x: 2} =~'), [false]);
  t.deepEqual(await fJSON('{x: 1} {x: 1, y: 2} =~'), [false]);
  t.deepEqual(await fJSON('{x: 1, y: 2} {x: 1, y: 2} =~'), [true]);
});

test('should pattern match deep objects', async t => {
  t.deepEqual(await fJSON('{x: {y: 1}} {x: {y: 1}} =~'), [true]);
  t.deepEqual(await fJSON('{x: {y: 1}} {x: {y: 3}} =~'), [false]);
  t.deepEqual(await fJSON('{x: {y: [1]}} {x: {y: [1]}} =~'), [true]);
  t.deepEqual(await fJSON('{x: {y: [1]}} {x: {y: [3]}} =~'), [false]);
});

test('regular expressions and strings', async t => {
  t.deepEqual(await fJSON('"deadbeef" "/d./" regexp =~'), [true]);
  t.deepEqual(await fJSON('"deadbeef" "/D./" regexp =~'), [false]);
  t.deepEqual(await fJSON('"deadbeef" "/D./i" regexp =~'), [true]);
  t.deepEqual(await fJSON('"deadbeef" "/D.$/i" regexp =~'), [false]);
  t.deepEqual(await fJSON('"deadbeef" "/D.*$/i" regexp =~'), [true]);
});

test('regular expressions and numbers', async t => {
  t.deepEqual(await fJSON('5 "/5/" regexp =~'), [true]);
  t.deepEqual(await fJSON('5 "/5./" regexp =~'), [false]);
  t.deepEqual(await fJSON('55 "/5./" regexp =~'), [true]);
  t.deepEqual(await fJSON('4 "/[1-5]/" regexp =~'), [true]);
  t.deepEqual(await fJSON('6 "/[1-5]/" regexp =~'), [false]);
});

test('should match arrays', async t => {
  t.deepEqual(await fJSON('[1 2] [1 3] =~'), [false]);
  t.deepEqual(await fJSON('[1 2] [1 2] =~'), [true]);
  t.deepEqual(await fJSON('[ "dead" 1 ] [ "dead" 1 ] =~'), [true]);
  t.deepEqual(await fJSON('[ "dead" 1 ] [ "dead" 2 ] =~'), [false]);
  t.deepEqual(await fJSON('[ "dead" 1 ] [ "beef" 1 ] =~'), [false]);
});

test('should pattern match wild cards', async t => {
  t.deepEqual(await fJSON('1 _ =~'), [true]);
  t.deepEqual(await fJSON('[] _ =~'), [true]);
  t.deepEqual(await fJSON('x: _ =~'), [true]);
  t.deepEqual(await fJSON('_ _ =~'), [true]);
});

test('should pattern match arrays with wild cards', async t => {
  t.deepEqual(await fJSON('[1 2] [1 2 _] =~'), [false]);
  t.deepEqual(await fJSON('[1 2] [1 _] =~'), [true]);
  t.deepEqual(await fJSON('[1 2] [_ 2] =~'), [true]);
  t.deepEqual(await fJSON('[1 2] [ _ _ ] =~'), [true]);
});

test('should pattern match complex arrays', async t => {
  t.deepEqual(await fJSON('[ "abc" ] ( "/a./" regexp ) =~'), [true]);
  t.deepEqual(await fJSON('[ "abc" ] ( "/b./" regexp ) =~'), [true]);
  t.deepEqual(await fJSON('[ 1 "abc" 2 3 ] ( 1 regexp:("/b./"). 2 3 ) =~'), [true]);
  t.deepEqual(await fJSON('[ 1 "abc" 2 3 ] ( 1 regexp:("/b./"). _ 3 ) =~'), [true]);

  t.deepEqual(await fJSON('[ 1 [] ] [ _ [] ] =~'), [true]);
  t.deepEqual(await fJSON('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~'), [true]);
  t.deepEqual(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~'), [false]);
  t.deepEqual(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2  3 ] ] =~'), [true]);
});

test('should pattern match deep arrays', async t => {
  t.deepEqual(await fJSON('[ 1 [] ] [ _ [] ] =~'), [true]);
  t.deepEqual(await fJSON('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~'), [true]);
  t.deepEqual(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~'), [false]);
  t.deepEqual(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2 3 ] ] =~'), [true]);
  t.deepEqual(await fJSON('[1,[2,3]] [_,[2,_]] =~'), [true]);
});

test('should pattern match arrays with rest', async t => {
  t.deepEqual(await fJSON('[1 2 3] [1 ...] =~'), [true]);
  t.deepEqual(await fJSON('[ 1 [ 2 3 ] ] [ 1 [...] ] =~'), [true]);
  t.deepEqual(await fJSON('[1[2[3]]] [1[2[4]]] =~'), [false], 'negitive test');
  t.deepEqual(await fJSON('[1[2[3]]] [1[2[...]]] =~'), [true]);
});

test('should pattern match objects with wildcards', async t => {
  t.deepEqual(await fJSON('{x: 1} {x: _} =~'), [true]);
  t.deepEqual(await fJSON('{x: 1} {x: _, y: 2} =~'), [false]);
  t.deepEqual(await fJSON('{x: 1} {x: _, y: _} =~'), [false]);
});

test('should pattern match deep objects and wildcards', async t => {
  t.deepEqual(await fJSON('{x: {y: 1}} {x: {y: _}} =~'), [true]);
  t.deepEqual(await fJSON('{x: {y: [1]}} {x: {y: [_]}} =~'), [true]);
  t.deepEqual(await fJSON('{x: {y: [1]}} {x: {y: [...]}} =~'), [true]);
});

test('should pattern match p-cond', async t => {
  t.deepEqual(await fJSON(`

  0
  [
    [0 [drop 'zero']]
    [5 [drop 'five']]
    [_ [string ' = other' + ]]
  ] p-cond

  `), ['zero']);

  t.deepEqual(await fJSON(`

  2
  [
    [0 [drop 'zero']]
    [5 [drop 'five']]
    [_ [string ' = other' + ]]
  ] p-cond

  `), ['2 = other']);

  t.deepEqual(await fJSON(`

  5
  [
    [0 [drop 'zero']]
    [5 [drop 'five']]
    [_ [string ' = other' + ]]
  ] p-cond

  `), ['five']);
});


test('should pattern match p-choose', async t => {
  t.deepEqual(await fJSON(`

  0
  [
    [0 'zero']
    [5 'five']
    [_ 'other']
  ] p-choose

  `), ['zero']);

  t.deepEqual(await fJSON(`

  2
  [
    [0 'zero']
    [5 'five']
    [_ 'other']
  ] p-choose

  `), ['other']);

  t.deepEqual(await fJSON(`

  5
  [
    [0 'zero']
    [5 'five']
    [_ 'other']
  ] p-choose

  `), ['five']);
});

