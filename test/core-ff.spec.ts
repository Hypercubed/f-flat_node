import { ƒ, τ } from './helpers/setup';

test('stackd', async () => {
  expect(await ƒ('1 2 3 4 stackd')).toBe(`[ [ 1 2 3 ] 4 ]`);
});

test('nullary', async () => {
  expect(await ƒ('1 2 3 [ 3 * ] nullary')).toBe(`[ 1 2 3 9 ]`);
});

test('should branch on truthy and falsy', async () => {
  expect(await ƒ('5 false [ 2 + ] [ 2 * ] branch')).toEqual(τ([10]));
  expect(await ƒ('5 true [ 2 + ] [ 2 * ] branch')).toEqual(τ([7]));
  // expect(await ƒ('5 null [ 2 + ] [ 2 * ] branch')).toEqual(τ([10]));
  expect(await ƒ('5 "this is truthy" [ 2 + ] [ 2 * ] [ boolean ] dip2 branch')).toEqual(τ([7]));
});

test('should slice', async () => {
  expect(await ƒ('["a" "b" "c" "d"] 0 1 slice')).toEqual(τ([['a']]));
  expect(await ƒ('["a" "b" "c" "d"] 0 -1 slice')).toEqual(τ([['a', 'b', 'c']]));
  expect(await ƒ('["a" "b" "c" "d"] 1 -1 slice')).toEqual(τ([['b', 'c']]));
});

test('map', async () => {
  expect(await ƒ('[ 3 2 1 ] [ 2 * ] map')).toEqual(τ([[6, 4, 2]]));
  expect(await ƒ('[ -3 -2 -1 ] [ abs ] map')).toEqual(τ([[3, 2, 1]]));
});

test('filter and reduce', async () => {
  expect(await ƒ('[ 10 2 5 3 1 6 7 4 2 3 4 8 9 ] [ even? ] filter')).toEqual(
    `[ [ 10 2 6 4 2 4 8 ] ]`
  );
  expect(await ƒ('10 integers [ even? ] filter')).toEqual(`[ [ 2 4 6 8 10 ] ]`);
  expect(await ƒ('10 integers 0 [ + ] reduce')).toEqual(`[ 55 ]`);
  expect(await ƒ('10 integers 1 [ * ] reduce')).toEqual(`[ 3628800 ]`);
  expect(await ƒ('10 integers [ + ] fold')).toEqual(`[ 55 ]`);
  expect(await ƒ('10 integers [ * ] fold')).toEqual(`[ 3628800 ]`);
});

test('zipwith', async () => {
  expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in')).toEqual(
    `[ [ 5 7 9 ] ]`
  );
});

test('dot', async () => {
  expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] dot')).toEqual(`[ 32 ]`);
  expect(await ƒ('[ 1 2 3 4 ] [ 4 5 6 ] dot')).toEqual(`[ 32 ]`);
});

test('!=', async () => {
  expect(await ƒ('1 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('1 i * 2 i * =')).toEqual(`[ false ]`);
  expect(await ƒ('null 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('nan 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('{ x: 1 } { x: 2 } =')).toEqual(`[ false ]`);
  expect(await ƒ('"1/1/1990" date "1/2/1990" date =')).toEqual(`[ false ]`);
});

test('should foldl and foldr', async () => {
  expect(await ƒ('10 integers 0 [+] foldl')).toEqual(`[ 55 ]`);
  expect(await ƒ('10 integers 0 [+] foldr')).toEqual(`[ 55 ]`);
  expect(await ƒ('10 integers 0 [-] foldl')).toEqual(`[ -55 ]`);
  expect(await ƒ('10 integers 0 [-] foldr')).toEqual(`[ -5 ]`);
});

test('should uncons', async () => {
  expect(await ƒ('(5 4 3) uncons')).toEqual(`[ 5 [ 4 3 ] ]`);
});

test('nop', async () => {
  // core-ff
  expect(await ƒ('"abc" nop')).toEqual(`[ 'abc' ]`);
  // t.deepEqual(await fJSON('"abc" id'), ['abc']);
});
