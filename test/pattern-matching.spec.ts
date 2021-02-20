import { ƒ } from './helpers/setup';

test('test equality for strings', async () => {
  expect(await ƒ('"abc" "def" =~')).toEqual(`[ false ]`);
  expect(await ƒ('"abc" "abc" =~')).toEqual(`[ true ]`);
});

test('test equality for numbers', async () => {
  expect(await ƒ('1 2 =~')).toEqual(`[ false ]`);
  expect(await ƒ('2 2 =~')).toEqual(`[ true ]`);
});

test('match words', async () => {
  expect(await ƒ('x: y: =~')).toEqual(`[ false ]`);
  expect(await ƒ('x: x: =~')).toEqual(`[ true ]`);
});

test('match objects', async () => {
  expect(await ƒ('{} {} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: 1} {} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: 1} {x: 1} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: 1} {x: 2} =~')).toEqual(`[ false ]`);
  expect(await ƒ('{x: 1} {x: 1, y: 2} =~')).toEqual(`[ false ]`);
  expect(await ƒ('{x: 1, y: 2} {x: 1, y: 2} =~')).toEqual(`[ true ]`);
});

test('pattern match deep objects', async () => {
  expect(await ƒ('{x: {y: 1}} {x: {y: 1}} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: {y: 1}} {x: {y: 3}} =~')).toEqual(`[ false ]`);
  expect(await ƒ('{x: {y: [1]}} {x: {y: [1]}} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: {y: [1]}} {x: {y: [3]}} =~')).toEqual(`[ false ]`);
});

test('regular expressions and strings', async () => {
  expect(await ƒ('"deadbeef" "/d./" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('"deadbeef" "/D./" regexp =~')).toEqual(`[ false ]`);
  expect(await ƒ('"deadbeef" "/D./i" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('"deadbeef" "/D.$/i" regexp =~')).toEqual(`[ false ]`);
  expect(await ƒ('"deadbeef" "/D.*$/i" regexp =~')).toEqual(`[ true ]`);
});

test('regular expressions and numbers', async () => {
  expect(await ƒ('5 "/5/" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('5 "/5./" regexp =~')).toEqual(`[ false ]`);
  expect(await ƒ('55 "/5./" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('4 "/[1-5]/" regexp =~')).toEqual(`[ true ]`);
  expect(await ƒ('6 "/[1-5]/" regexp =~')).toEqual(`[ false ]`);
});

test('match arrays', async () => {
  expect(await ƒ('[] [] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[1 2] [1 3] =~')).toEqual(`[ false ]`);
  expect(await ƒ('[1 2] [1 2] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ "dead" 1 ] [ "dead" 1 ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ "dead" 1 ] [ "dead" 2 ] =~')).toEqual(`[ false ]`);
  expect(await ƒ('[ "dead" 1 ] [ "beef" 1 ] =~')).toEqual(`[ false ]`);
});

test('pattern match wild cards', async () => {
  expect(await ƒ('1 _ =~')).toEqual(`[ true ]`);
  expect(await ƒ('[] _ =~')).toEqual(`[ true ]`);
  expect(await ƒ('x: _ =~')).toEqual(`[ true ]`);
  expect(await ƒ('_ _ =~')).toEqual(`[ true ]`);
});

test('pattern match arrays with wild cards', async () => {
  expect(await ƒ('[1 2] [1 2 _] =~')).toEqual(`[ false ]`);
  expect(await ƒ('[1 2] [1 _] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[1 2] [_ 2] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[1 2] [ _ _ ] =~')).toEqual(`[ true ]`);
});

test('pattern match complex arrays', async () => {
  expect(await ƒ(`[ 'abc' ] [ '/a./' :regexp ] =~`)).toEqual(`[ true ]`);
  expect(await ƒ(`[ "abc" ] [ '/b./' :regexp ] =~`)).toEqual(`[ true ]`);
  expect(await ƒ(`[ 'abc' ] [ '/f./' :regexp ] =~`)).toEqual(`[ false ]`);
  expect(await ƒ(`[ 1 'abc' 2 3 ] [ 1 '/b./' :regexp 2 3 ] =~`)).toEqual(`[ true ]`);
  expect(await ƒ(`[ 1 'abc' 2 3 ] [ 1 '/b./' :regexp _ 3 ] =~`)).toEqual(`[ true ]`);

  expect(await ƒ('[ 1 [] ] [ _ [] ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~')).toEqual(`[ false ]`);
  expect(await ƒ('[ 1 [ 2 3 ] ] [ _ [ 2  3 ] ] =~')).toEqual(`[ true ]`);
});

test('pattern match deep arrays', async () => {
  expect(await ƒ('[ 1 [] ] [ _ [] ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ 1 [ 2 ] ] [ _ [ 2 ] ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ 1 [ 2 3 ] ] [ _ [ 2 ] ] =~')).toEqual(`[ false ]`);
  expect(await ƒ('[ 1 [ 2 3 ] ] [ _ [ 2 3 ] ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[1,[2,3]] [_,[2,_]] =~')).toEqual(`[ true ]`);
});

test('pattern match arrays with rest', async () => {
  expect(await ƒ('[1 2 3] [1 ...] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[ 1 [ 2 3 ] ] [ 1 [...] ] =~')).toEqual(`[ true ]`);
  expect(await ƒ('[1[2[3]]] [1[2[4]]] =~')).toEqual(`[ false ]`);
  expect(await ƒ('[1[2[3]]] [1[2[...]]] =~')).toEqual(`[ true ]`);
});

test('pattern match objects with wildcards', async () => {
  expect(await ƒ('{x: 1} {x: _} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: 1} {x: _, y: 2} =~')).toEqual(`[ false ]`);
  expect(await ƒ('{x: 1} {x: _, y: _} =~')).toEqual(`[ false ]`);
});

test('pattern match deep objects and wildcards', async () => {
  expect(await ƒ('{x: {y: 1}} {x: {y: _}} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: {y: [1]}} {x: {y: [_]}} =~')).toEqual(`[ true ]`);
  expect(await ƒ('{x: {y: [1]}} {x: {y: [...]}} =~')).toEqual(`[ true ]`);
});

test('case', async () => {
  expect(await ƒ('1 2 3 [ 3 = ] case')).toEqual(`[ 1 2 3 true ]`);
  expect(await ƒ('1 2 3 [ > ] case')).toEqual(`[ 1 2 3 false ]`);
});

test('p-case', async () => {
  expect(await ƒ('1 2 3 3 p-case')).toEqual(`[ 1 2 3 true ]`);
  expect(await ƒ('1 [ 2 3 ] [ 2 _ ] p-case')).toEqual(`[ 1 [ 2 3 ] true ]`);
});

test('switch', async () => {
  expect(
    await ƒ(`
    0
    [
      [ dup 0 = [drop 'no apples']]
      [ dup 1 = [drop 'one apple']]
      [ true    [string ' apples' +]]
    ] switch
    `)
  ).toEqual(`[ 'no apples' ]`);
  expect(
    await ƒ(`
    1
    [
      [ dup 0 = [drop 'no apples']]
      [ dup 1 = [drop 'one apple']]
      [ true    [string ' apples' +]]
    ] switch
    `)
  ).toEqual(`[ 'one apple' ]`);
  expect(
    await ƒ(`
    2
    [
      [ dup 0 = [drop 'no apples']]
      [ dup 1 = [drop 'one apple']]
      [ true    [string ' apples' +]]
    ] switch
    `)
  ).toEqual(`[ '2 apples' ]`);
});

test('switch -> (case)', async () => {
  expect(
    await ƒ(`
    0
    [
      [[ 0 = ] ->  [drop 'no apples']]
      [[ 1 = ] ->  [drop 'one apple']]
      [[ true ] -> [string ' apples' +]]
    ] switch
    `)
  ).toEqual(`[ 'no apples' ]`);

  expect(
    await ƒ(`
    1
    [
      [[ 0 = ] ->  [drop 'no apples']]
      [[ 1 = ] ->  [drop 'one apple']]
      [[ true ] -> [string ' apples' +]]
    ] switch
    `)
  ).toEqual(`[ 'one apple' ]`);

  expect(
    await ƒ(`
    3
    [
      [[ 0 = ] ->  [drop 'no apples']]
      [[ 1 = ] ->  [drop 'one apple']]
      [[ true ] -> [string ' apples' +]]
    ] switch
    `)
  ).toEqual(`[ '3 apples' ]`);
});

test('switch ~> (pattern case)', async () => {
  expect(
    await ƒ(`
      0
      [
        [ 0 ~> [drop 'no apples']]
        [ 5 ~> [drop 'one apple']]
        [ _ ~> [string ' apples' +]]
      ] switch
  `)
  ).toEqual(`[ 'no apples' ]`);

  expect(
    await ƒ(`
      1
      [
        [ 0 ~> [drop 'no apples']]
        [ 1 ~> [drop 'one apple']]
        [ _ ~> [string ' apples' +]]
      ] switch
  `)
  ).toEqual(`[ 'one apple' ]`);

  expect(
    await ƒ(`
      5
      [
        [ 0 ~> [drop 'no apples']]
        [ 1 ~> [drop 'one apple']]
        [ _ ~> [string ' apples' +]]
      ] switch
  `)
  ).toEqual(`[ '5 apples' ]`);
});
