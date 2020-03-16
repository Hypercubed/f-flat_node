import { ƒ, τ } from './helpers/setup';

test('should push lists', async () => {
  expect(await ƒ('( 1 ) ( 2 )')).toEqual(`[ [ 1 ] [ 2 ] ]`);
  expect(await ƒ('(1) (2)')).toEqual(`[ [ 1 ] [ 2 ] ]`);
  expect(await ƒ('(1) (2 3 +)')).toEqual(`[ [ 1 ] [ 5 ] ]`);
});

test('should evaluate quoted lists', async () => {
  expect(await ƒ('[ ( 1 2 + ) ] in')).toEqual(`[ [ [ 3 ] ] ]`);
});

test('should get length', async () => {
  expect(await ƒ('( 1 2 ) ln')).toEqual(`[ 2 ]`);
});

test('should add', async () => {
  expect(await ƒ('(1) (2) +')).toEqual(`[ [ 1 2 ] ]`);
  expect(await ƒ('(1 2 3) dup (4 5 6) +')).toEqual(
    τ([
      [1, 2, 3],
      [1, 2, 3, 4, 5, 6]
    ])
  );
});

test('should multiply', async () => {
  expect(await ƒ('(1) 2 *')).toEqual(`[ [ 1 1 ] ]`);
  expect(await ƒ('(1) 3 *')).toEqual(`[ [ 1 1 1 ] ]`);
  expect(await ƒ('(1 2) 2 *')).toEqual(`[ [ 1 2 1 2 ] ]`);
  expect(await ƒ('(1 2 +) 2 *')).toEqual(`[ [ 3 3 ] ]`);
  expect(await ƒ('(1 2 +) 0 *')).toEqual(`[ [ ] ]`);
});

test('mul identities', async () => {
  expect(await ƒ('(1) 3 * sum')).toEqual(`[ 3 ]`);
  expect(await ƒ('(2) 3 * sum')).toEqual(`[ 6 ]`);
  expect(await ƒ('(1) 3 * 3 / + sum')).toEqual(`[ 3 ]`);
  expect(await ƒ('(2) 3 * 3 / + sum')).toEqual(`[ 6 ]`);
});

test('div identities', async () => {
  expect(await ƒ('(1) 1 /')).toEqual(`[ [ 1 ] [ ] ]`);
  expect(await ƒ('(1 2) 1 /')).toEqual(`[ [ 1 ] [ 2 ] ]`);
  expect(await ƒ('(1 2 3 4) 2 /')).toEqual(`[ [ 1 2 ] [ 3 4 ] ]`);
});

test('add/sub identities', async () => {
  // math-ff
  expect(await ƒ('(1) 2 + sum')).toEqual(`[ 3 ]`);
});

test('pow identities', async () => {
  // math-ff
  // right associative
  expect(await ƒ('(1) 2 pow')).toEqual(`[ [ 1 1 ] ]`); // should work with ^
  expect(await ƒ('(2) 3 pow')).toEqual(`[ [ 2 2 2 ] ]`);
  expect(await ƒ('(1 1) 3 pow')).toEqual(`[ [ 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ] ]`);
  expect(await ƒ('(1 2) 3 pow')).toEqual(`[ [ 1 1 1 2 2 1 2 2 1 1 2 2 1 2 ] ]`);
  // t.deepEqual(await ƒ('(1) 2 + 2 - sum', [1]); // ???
});

test('should test equality', async () => {
  expect(await ƒ('(1 2) (1 2) =')).toEqual(`[ true ]`);
  expect(await ƒ('(1) (2) =')).toEqual(`[ false ]`);
  expect(await ƒ('(1 2)  (1) =')).toEqual(`[ false ]`);
  expect(await ƒ('(1 2) (1 1) =')).toEqual(`[ false ]`);
});

test('should eval lists', async () => {
  expect(await ƒ('(1 2) eval')).toEqual(`[ 1 2 ]`);
});

test('should zip lists', async () => {
  expect(await ƒ('( 1 2 3 ) ( 4 ) *')).toEqual(`[ [ 1 4 2 4 3 4 ] ]`);
});

test('should join', async () => {
  expect(await ƒ('( 1 2 3 ) "-" *')).toEqual(`[ '1-2-3' ]`);
});

test('should <<', async () => {
  expect(await ƒ('( 1 2 3 ) 4 <<')).toEqual(`[ [ 1 2 3 4 ] ]`);
  expect(await ƒ('( 1 2 3 ) dup 4 <<')).toEqual(`[ [ 1 2 3 ] [ 1 2 3 4 ] ]`);
});

test('should >>', async () => {
  expect(await ƒ('4 ( 1 2 3 ) >>')).toEqual(`[ [ 4 1 2 3 ] ]`);
  expect(await ƒ('4 ( 1 2 3 ) tuck >>')).toEqual(`[ [ 1 2 3 ] [ 4 1 2 3 ] ]`);
});

test('should @', async () => {
  expect(await ƒ('( 4 5 6 ) 0 @')).toEqual(`[ 4 ]`);
  expect(await ƒ('( 4 5 6 ) 1 @')).toEqual(`[ 5 ]`);
  expect(await ƒ('( 4 5 6 ) 2 @')).toEqual(`[ 6 ]`);
});

test('should @ from end', async () => {
  expect(await ƒ('( 4 5 6 ) -1 @')).toEqual(`[ 6 ]`);
  expect(await ƒ('( 4 5 6 ) -2 @')).toEqual(`[ 5 ]`);
  expect(await ƒ('( 4 5 6 ) -3 @')).toEqual(`[ 4 ]`);
});

test('should @ out of range', async () => {
  expect(await ƒ('( 4 5 6 ) 10 @')).toEqual(`[ null ]`); // undefined?
  expect(await ƒ('( 4 5 6 ) -10 @')).toEqual(`[ null ]`);
});

test('should pop and shift without mutation', async () => {
  expect(await ƒ('( 1 2 3 ) dup pop')).toEqual(`[ [ 1 2 3 ] [ 1 2 ] ]`);
  expect(await ƒ('( 1 2 3 ) dup shift')).toEqual(`[ [ 1 2 3 ] [ 2 3 ] ]`);
});

test('should fine maximum and minimum', async () => {
  // math-ff
  expect(await ƒ('( 2 3 1 6 3 ) maximum')).toEqual(`[ 6 ]`);
  expect(await ƒ('( 2 3 1 6 3 ) minimum')).toEqual(`[ 1 ]`);
});

test('should split at', async () => {
  // base
  expect(await ƒ('["a" "b" "c" "d"] 1 /')).toEqual(τ([['a'], ['b', 'c', 'd']]));
  expect(await ƒ('["a" "b" "c" "d"] -1 /')).toEqual(
    τ([['a', 'b', 'c'], ['d']])
  );
});
