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

test('should test equality for strings', t => {
  t.deepEqual(fSyncJSON('"abc" "def" =~'), [false]);
  t.deepEqual(fSyncJSON('"abc" "abc" =~'), [true]);
});

test('should test equality for numbers', t => {
  t.deepEqual(fSyncJSON('1 2 =~'), [false]);
  t.deepEqual(fSyncJSON('2 2 =~'), [true]);
});

test('should match words', t => {
  t.deepEqual(fSyncJSON('x: y: =~'), [false]);
  t.deepEqual(fSyncJSON('x: x: =~'), [true]);
});

test('should match objects', t => {
  t.deepEqual(fSyncJSON('{} {} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: 1} {} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: 1} {x: 1} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: 1} {x: 2} =~'), [false]);
  t.deepEqual(fSyncJSON('{x: 1} {x: 1, y: 2} =~'), [false]);
  t.deepEqual(fSyncJSON('{x: 1, y: 2} {x: 1, y: 2} =~'), [true]);
});

test('should pattern match deep objects', t => {
  t.deepEqual(fSyncJSON('{x: {y: 1}} {x: {y: 1}} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: {y: 1}} {x: {y: 3}} =~'), [false]);
  t.deepEqual(fSyncJSON('{x: {y: [1]}} {x: {y: [1]}} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: {y: [1]}} {x: {y: [3]}} =~'), [false]);
});

test('regular expressions and strings', t => {
  t.deepEqual(fSyncJSON('"deadbeef" "/d./" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('"deadbeef" "/D./" regexp =~'), [false]);
  t.deepEqual(fSyncJSON('"deadbeef" "/D./i" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('"deadbeef" "/D.$/i" regexp =~'), [false]);
  t.deepEqual(fSyncJSON('"deadbeef" "/D.*$/i" regexp =~'), [true]);
});

test('regular expressions and numbers', t => {
  t.deepEqual(fSyncJSON('5 "/5/" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('5 "/5./" regexp =~'), [false]);
  t.deepEqual(fSyncJSON('55 "/5./" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('4 "/[1-5]/" regexp =~'), [true]);
  t.deepEqual(fSyncJSON('6 "/[1-5]/" regexp =~'), [false]);
});

test('should match arrays', t => {
  t.deepEqual(fSyncJSON('[1 2] [1 3] =~'), [false]);
  t.deepEqual(fSyncJSON('[1 2] [1 2] =~'), [true]);
  t.deepEqual(fSyncJSON('[ "dead" 1 ] [ "dead" 1 ] =~'), [true]);
  t.deepEqual(fSyncJSON('[ "dead" 1 ] [ "dead" 2 ] =~'), [false]);
  t.deepEqual(fSyncJSON('[ "dead" 1 ] [ "beef" 1 ] =~'), [false]);
});

test('should pattern match wild cards', t => {
  t.deepEqual(fSyncJSON('1 _ =~'), [true]);
  t.deepEqual(fSyncJSON('[] _ =~'), [true]);
  t.deepEqual(fSyncJSON('x: _ =~'), [true]);
  t.deepEqual(fSyncJSON('_ _ =~'), [true]);
});

test('should pattern match arrays with wild cards', t => {
  t.deepEqual(fSyncJSON('[1 2] [1 2 _] =~'), [false]);
  t.deepEqual(fSyncJSON('[1 2] [1 _] =~'), [true]);
  t.deepEqual(fSyncJSON('[1 2] [_ 2] =~'), [true]);
  t.deepEqual(fSyncJSON('[1 2] [ _ _ ] =~'), [true]);
});

test('should pattern match complex arrays', t => {
  t.deepEqual(fSyncJSON('[ "abc" ] ( "/a./" regexp ) =~'), [true]);
  t.deepEqual(fSyncJSON('[ "abc" ] ( "/b./" regexp ) =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 "abc" 2 3 ] ( 1 regexp:("/b./"). 2 3 ) =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 "abc" 2 3 ] ( 1 regexp:("/b./"). _ 3 ) =~'), [true]);

  t.deepEqual(fSyncJSON('[ 1 [] ] [ _ [] ] =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~'), [false]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 3 ] ] [ _ [ 2  3 ] ] =~'), [true]);
});

test('should pattern match deep arrays', t => {
  t.deepEqual(fSyncJSON('[ 1 [] ] [ _ [] ] =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~'), [false]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 3 ] ] [ _ [ 2 3 ] ] =~'), [true]);
  t.deepEqual(fSyncJSON('[1,[2,3]] [_,[2,_]] =~'), [true]);
});

test('should pattern match arrays with rest', t => {
  t.deepEqual(fSyncJSON('[1 2 3] [1 ...] =~'), [true]);
  t.deepEqual(fSyncJSON('[ 1 [ 2 3 ] ] [ 1 [...] ] =~'), [true]);
  t.deepEqual(fSyncJSON('[1[2[3]]] [1[2[4]]] =~'), [false], 'negitive test');
  t.deepEqual(fSyncJSON('[1[2[3]]] [1[2[...]]] =~'), [true]);
});

test('should pattern match objects with wildcards', t => {
  t.deepEqual(fSyncJSON('{x: 1} {x: _} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: 1} {x: _, y: 2} =~'), [false]);
  t.deepEqual(fSyncJSON('{x: 1} {x: _, y: _} =~'), [false]);
});

test('should pattern match deep objects and wildcards', t => {
  t.deepEqual(fSyncJSON('{x: {y: 1}} {x: {y: _}} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: {y: [1]}} {x: {y: [_]}} =~'), [true]);
  t.deepEqual(fSyncJSON('{x: {y: [1]}} {x: {y: [...]}} =~'), [true]);
});

