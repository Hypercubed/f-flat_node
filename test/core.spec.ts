import { F, Decimal, ƒ, τ } from './helpers/setup';

test('choose', async () => {
  expect(await ƒ('true 3 4 choose')).toEqual(τ([3]));
  expect(await ƒ('false 3 4 choose')).toEqual(τ([4]));
});

describe('@', () => {
  test('pick', async () => {
    expect(await ƒ('{a: 1} a: @')).toEqual(`[ 1 ]`);
    expect(await ƒ('{a: 2} "a" @')).toEqual(`[ 2 ]`);
    expect(await ƒ('{a: 3} b: @')).toEqual(`[ null ]`); // s/b undefined?
    expect(await ƒ('{a: {b: 5}} "a.b" @')).toEqual(`[ 5 ]`);
    expect(await ƒ('{a: {b: 5}} a.b: @')).toEqual(`[ 5 ]`);
    expect(await ƒ('{a: 7} "A" lcase @')).toEqual(`[ 7 ]`);
  });

  test('pick into object', async () => {
    expect(await ƒ('{ a: { a: 1 } a: @ }')).toEqual(`[ { a: 1 } ]`);
    expect(await ƒ('{ a: 2 } q< { a: q> over @ }')).toEqual(`[ { a: 2 } ]`);
    expect(await ƒ('{ a: 3 } q< { b: q> a: @ }')).toEqual(`[ { b: 3 } ]`);
  });

  test('pick into object with default', async () => {
    expect(await ƒ('{ a: { a: 1 } b: @ 2 orelse }')).toEqual(`[ { a: 2 } ]`);
    expect(await ƒ('{ a: 3 } q< { b: q> over @ 5 orelse }')).toEqual(`[ { b: 5 } ]`);
    expect(await ƒ('{ a: 7 } q< { c: q> b: @ 11 orelse }')).toEqual(`[ { c: 11 } ]`);
  });

  test('pick into array', async () => {
    expect(await ƒ('( { a: 1 } a: @ )')).toEqual(`[ [ 1 ] ]`);
  });

  test('pick from array', async () => {
    expect(await ƒ('[1 2] 0 @')).toEqual(`[ 1 ]`);
    expect(await ƒ('[3 5] 1 @')).toEqual(`[ 5 ]`);
    expect(await ƒ('([7 11] 0 @)')).toEqual(`[ [ 7 ] ]`);
  });

  test('pick from null', async () => {
    expect(await ƒ('null 0 @')).toEqual(`[ null ]`);
    expect(await ƒ('[ 1 2 3 ] null @')).toEqual(`[ null ]`);
    expect(await ƒ('null null @')).toEqual(`[ null ]`);
  });

  test('pick is nullish coalescing ', async () => {
    expect(await ƒ('[ 1 2 3 ] 4 @ 1 @')).toEqual(`[ null ]`);
    expect(await ƒ(`{ x: { y: 1 } } y: @ x: @`)).toEqual(`[ null ]`);
  });
});

test('q< q>', async () => {
  expect(await ƒ('1 2 q< 3 q>')).toEqual(`[ 1 3 2 ]`);
});

test('stack unstack', async () => {
  expect(await ƒ('1 2 3 stack')).toEqual(`[ [ 1 2 3 ] ]`);
  expect(await ƒ('[ 1 2 3 ] unstack')).toEqual(`[ 1 2 3 ]`);
  expect(await ƒ('1 2 3 [ 4 5 6 ] unstack')).toEqual(`[ 1 2 3 4 5 6 ]`);
  expect(await ƒ('[2 1 +] unstack')).toEqual(`[ 2 1 + ]`); // check this... action on the stack!!
});

test('clr', async () => {
  expect(await ƒ('1 2 clr 3')).toEqual(τ([3]));
});

test('depth', async () => {
  expect(await ƒ('"abc" depth')).toEqual(`[ 'abc' 1 ]`); // todo: return a decimal
  expect(await ƒ('"abc" 123 depth')).toEqual(`[ 'abc' 123 2 ]`);
});

// eval

describe('in', () => {
  test('in', async () => {
    expect(await ƒ('[ 2 1 + ] in')).toEqual(`[ [ 3 ] ]`);
  });

  test('clr in', async () => {
    expect(await ƒ('1 2 [ 2 1 clr 3 ] in')).toEqual(`[ 1 2 [ 3 ] ]`);
  });
});

test('in-catch', async () => {
  expect(await ƒ(`[ 1 2 + ] [ 'err' ] in-catch`)).toEqual(`[ [ 3 ] ]`);
  expect(await ƒ(`[ 1 '2' + ] [ 'err' ] in-catch`)).toEqual(`[ [ 'err' ] ]`);
});

test('throw', () => {
  expect(ƒ(`'Err' throw`)).rejects.toThrow('Err');
});

test('send', async () => {
  expect(await ƒ('[ 1 2 3 send 4 ] in')).toEqual(`[ 3 [ 1 2 4 ] ]`);
});

test('drop', async () => {
  expect(await ƒ('1 2 drop 3')).toEqual(τ([1, 3]));
});

test('swap', async () => {
  expect(await ƒ('1 2 swap 3')).toEqual(τ([2, 1, 3]));
  expect(await ƒ('"abc" "def" swap')).toEqual(`[ 'def' 'abc' ]`);
  expect(await ƒ('abc: def: swap')).toEqual(`[ def: abc: ]`);
});

describe('dup', () => {
  test('dup', async () => {
    expect(await ƒ('1 2 dup 3')).toEqual(τ([1, 2, 2, 3]));
    expect(await ƒ('[ 1 2 + ] dup swap drop eval')).toEqual(τ([3]));
    expect(await ƒ('abc: dup')).toEqual(`[ abc: abc: ]`);
  });

  test('dup arrays', async () => {
    const f = F().eval('[ 1 2 3 ] dup');
    expect(f.stack).toEqual([[1, 2, 3].map(x => new Decimal(x)), [1, 2, 3].map(x => new Decimal(x))]);
    expect(f.stack[0]).toBe(f.stack[1]);
  });
});

test('indexof', async () => {
  expect(await ƒ('"abc" "b" indexof')).toEqual(`[ 1 ]`);
  expect(await ƒ(`[ 'a' 'b' 'c' ] "c" indexof`)).toEqual(`[ 2 ]`);
  expect(await ƒ(`[ 1 2 3 ] 2 indexof`)).toEqual(`[ 1 ]`);
  expect(await ƒ(`{ x: 1, y: 2 } 1 indexof`)).toEqual(`[ 'x' ]`);
  expect(await ƒ(`{ x: 1, y: 2 } 2 indexof`)).toEqual(`[ 'y' ]`);
});

test('zip', async () => {
  expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] zip')).toEqual(`[ [ [ 1 4 ] [ 2 5 ] [ 3 6 ] ] ]`);
  expect(await ƒ(`[ 1 ] [ 'a' 'b' ] zip`)).toEqual(`[ [ [ 1 'a' ] ] ]`);
});

// test('zipinto', async () => {
//   expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto')).toEqual(
//     `[ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]`
//   );
//   expect(await ƒ('[ 1 ] [ 4 5 6 ] [ 7 8 9 ] zipinto')).toEqual(
//     `[ [ 1 4 7 8 9 ] ]`
//   );
// });

// template
// sleep
