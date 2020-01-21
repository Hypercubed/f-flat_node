import { fJSON } from './helpers/setup';

test('should test equality for strings', async () => {
  expect(await fJSON('"abc" "def" =~')).toEqual([false]);
  expect(await fJSON('"abc" "abc" =~')).toEqual([true]);
});

test('should test equality for numbers', async () => {
  expect(await fJSON('1 2 =~')).toEqual([false]);
  expect(await fJSON('2 2 =~')).toEqual([true]);
});

test('should match words', async () => {
  expect(await fJSON('x: y: =~')).toEqual([false]);
  expect(await fJSON('x: x: =~')).toEqual([true]);
});

test('should match objects', async () => {
  expect(await fJSON('{} {} =~')).toEqual([true]);
  expect(await fJSON('{x: 1} {} =~')).toEqual([true]);
  expect(await fJSON('{x: 1} {x: 1} =~')).toEqual([true]);
  expect(await fJSON('{x: 1} {x: 2} =~')).toEqual([false]);
  expect(await fJSON('{x: 1} {x: 1, y: 2} =~')).toEqual([false]);
  expect(await fJSON('{x: 1, y: 2} {x: 1, y: 2} =~')).toEqual([true]);
});

test('should pattern match deep objects', async () => {
  expect(await fJSON('{x: {y: 1}} {x: {y: 1}} =~')).toEqual([true]);
  expect(await fJSON('{x: {y: 1}} {x: {y: 3}} =~')).toEqual([false]);
  expect(await fJSON('{x: {y: [1]}} {x: {y: [1]}} =~')).toEqual([true]);
  expect(await fJSON('{x: {y: [1]}} {x: {y: [3]}} =~')).toEqual([false]);
});

test('regular expressions and strings', async () => {
  expect(await fJSON('"deadbeef" "/d./" regexp =~')).toEqual([true]);
  expect(await fJSON('"deadbeef" "/D./" regexp =~')).toEqual([false]);
  expect(await fJSON('"deadbeef" "/D./i" regexp =~')).toEqual([true]);
  expect(await fJSON('"deadbeef" "/D.$/i" regexp =~')).toEqual([false]);
  expect(await fJSON('"deadbeef" "/D.*$/i" regexp =~')).toEqual([true]);
});

test('regular expressions and numbers', async () => {
  expect(await fJSON('5 "/5/" regexp =~')).toEqual([true]);
  expect(await fJSON('5 "/5./" regexp =~')).toEqual([false]);
  expect(await fJSON('55 "/5./" regexp =~')).toEqual([true]);
  expect(await fJSON('4 "/[1-5]/" regexp =~')).toEqual([true]);
  expect(await fJSON('6 "/[1-5]/" regexp =~')).toEqual([false]);
});

test('should match arrays', async () => {
  expect(await fJSON('[1 2] [1 3] =~')).toEqual([false]);
  expect(await fJSON('[1 2] [1 2] =~')).toEqual([true]);
  expect(await fJSON('[ "dead" 1 ] [ "dead" 1 ] =~')).toEqual([true]);
  expect(await fJSON('[ "dead" 1 ] [ "dead" 2 ] =~')).toEqual([false]);
  expect(await fJSON('[ "dead" 1 ] [ "beef" 1 ] =~')).toEqual([false]);
});

test('should pattern match wild cards', async () => {
  expect(await fJSON('1 _ =~')).toEqual([true]);
  expect(await fJSON('[] _ =~')).toEqual([true]);
  expect(await fJSON('x: _ =~')).toEqual([true]);
  expect(await fJSON('_ _ =~')).toEqual([true]);
});

test('should pattern match arrays with wild cards', async () => {
  expect(await fJSON('[1 2] [1 2 _] =~')).toEqual([false]);
  expect(await fJSON('[1 2] [1 _] =~')).toEqual([true]);
  expect(await fJSON('[1 2] [_ 2] =~')).toEqual([true]);
  expect(await fJSON('[1 2] [ _ _ ] =~')).toEqual([true]);
});

test('should pattern match complex arrays', async () => {
  expect(await fJSON('[ "abc" ] ( "/a./" regexp ) =~')).toEqual([true]);
  expect(await fJSON('[ "abc" ] ( "/b./" regexp ) =~')).toEqual([true]);
  expect(await fJSON('[ 1 "abc" 2 3 ] ( 1 regexp:("/b./"). 2 3 ) =~')).toEqual([
    true
  ]);
  expect(await fJSON('[ 1 "abc" 2 3 ] ( 1 regexp:("/b./"). _ 3 ) =~')).toEqual([
    true
  ]);

  expect(await fJSON('[ 1 [] ] [ _ [] ] =~')).toEqual([true]);
  expect(await fJSON('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~')).toEqual([true]);
  expect(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~')).toEqual([false]);
  expect(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2  3 ] ] =~')).toEqual([true]);
});

test('should pattern match deep arrays', async () => {
  expect(await fJSON('[ 1 [] ] [ _ [] ] =~')).toEqual([true]);
  expect(await fJSON('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~')).toEqual([true]);
  expect(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~')).toEqual([false]);
  expect(await fJSON('[ 1 [ 2 3 ] ] [ _ [ 2 3 ] ] =~')).toEqual([true]);
  expect(await fJSON('[1,[2,3]] [_,[2,_]] =~')).toEqual([true]);
});

test('should pattern match arrays with rest', async () => {
  expect(await fJSON('[1 2 3] [1 ...] =~')).toEqual([true]);
  expect(await fJSON('[ 1 [ 2 3 ] ] [ 1 [...] ] =~')).toEqual([true]);
  expect(await fJSON('[1[2[3]]] [1[2[4]]] =~')).toEqual([false]);
  expect(await fJSON('[1[2[3]]] [1[2[...]]] =~')).toEqual([true]);
});

test('should pattern match objects with wildcards', async () => {
  expect(await fJSON('{x: 1} {x: _} =~')).toEqual([true]);
  expect(await fJSON('{x: 1} {x: _, y: 2} =~')).toEqual([false]);
  expect(await fJSON('{x: 1} {x: _, y: _} =~')).toEqual([false]);
});

test('should pattern match deep objects and wildcards', async () => {
  expect(await fJSON('{x: {y: 1}} {x: {y: _}} =~')).toEqual([true]);
  expect(await fJSON('{x: {y: [1]}} {x: {y: [_]}} =~')).toEqual([true]);
  expect(await fJSON('{x: {y: [1]}} {x: {y: [...]}} =~')).toEqual([true]);
});

test('should pattern match p-cond', async () => {
  expect(
    await fJSON(`

  0
  [
    [0 [drop 'zero']]
    [5 [drop 'five']]
    [_ [string ' = other' + ]]
  ] p-cond

  `)
  ).toEqual(['zero']);

  expect(
    await fJSON(`

  2
  [
    [0 [drop 'zero']]
    [5 [drop 'five']]
    [_ [string ' = other' + ]]
  ] p-cond

  `)
  ).toEqual(['2 = other']);

  expect(
    await fJSON(`

  5
  [
    [0 [drop 'zero']]
    [5 [drop 'five']]
    [_ [string ' = other' + ]]
  ] p-cond

  `)
  ).toEqual(['five']);
});

test('should pattern match p-choose', async () => {
  expect(
    await fJSON(`

  0
  [
    [0 'zero']
    [5 'five']
    [_ 'other']
  ] p-choose

  `)
  ).toEqual(['zero']);

  expect(
    await fJSON(`

  2
  [
    [0 'zero']
    [5 'five']
    [_ 'other']
  ] p-choose

  `)
  ).toEqual(['other']);

  expect(
    await fJSON(`

  5
  [
    [0 'zero']
    [5 'five']
    [_ 'other']
  ] p-choose

  `)
  ).toEqual(['five']);
});
