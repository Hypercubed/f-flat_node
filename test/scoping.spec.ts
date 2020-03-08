import { ƒ } from './helpers/setup';

test('in', async () => {
  expect(await ƒ(`a: [ 'before' ] ; [ a ] in`)).toEqual(`[ [ 'before' ] ]`);
  expect(await ƒ(`a: [ "outer" ] ; [ a: [ "inner" ] ; a ] in a`)).toEqual(
    `[ [ 'inner' ] 'outer' ]`
  );
  expect(await ƒ(`a: [ 'outer' ] ; [ b: [ 'inner' ] ; a ] in b: defined?`)).toEqual(
    `[ [ 'outer' ] false ]`
  );
});

describe('module `use` scoping', () => {
  test('scoped words', async () => {
    expect(
      await ƒ(`
      [
        δx: [ 1 2 + ] ;
        δy: [ δx 2 * ] ;
      ] :module use
      δx δy
    `)
    ).toEqual(`[ 3 6 ]`);
  });

  test('local words over scoped words', async () => {
    expect(
      await ƒ(`
      [
        δx: [ 1 2 + ] ;
        δy: [ δx 2 * ] ;
      ] :module use
      δx: [ 8 ] ;
      δx δy
    `)
    ).toEqual(`[ 8 6 ]`);

    expect(
      await ƒ(`
      δx: [ 8 ] ;
      [
        δx: [ 1 2 + ] ;
        δy: [ δx 2 * ] ;
      ] module use
      δx δy
    `)
    ).toEqual(`[ 8 6 ]`);
  });
});

test('module def scoping', async () => {
  expect(
    await ƒ(`
    s: [
      x: [ 1 2 + ] ;
      y: [ x 3 * ] ;
    ] module ;
    x: [ 5 ] ;
    y: [ 7 ] ;
    x y s.x s.y
  `)
  ).toEqual(`[ 5 7 3 9 ]`);

  expect(
    await ƒ(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      x: [ 1 2 + ] ;
      y: [ x 3 * ] ;
    ] module ;
    x y s.x s.y
  `)
  ).toEqual(`[ 5 7 3 9 ]`);

  expect(
    await ƒ(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      y: [ x 3 * ] ;
    ] module ;
    x y s.y
  `)
  ).toEqual(`[ 5 7 15 ]`);
});

test('calling within child', async () => {
  expect(
    await ƒ(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      x: [ 1 2 + ] ;
      y: [ x 3 * ] ;
    ] module ;
    [
      x y s.x s.y
    ] in
  `)
  ).toEqual(`[ [ 5 7 3 9 ] ]`);
});

test('deep calling within child', async () => {
  expect(
    await ƒ(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      s: [
        x: [ 1 2 + ] ;
        y: [ x 3 * ] ;
      ] module ;
      vocab
    ] module ;
    [
      x y s.s.x s.s.y
    ] in
  `)
  ).toEqual(`[ [ 5 7 3 9 ] ]`);
});

test(`locals don't collide with scoped definitions`, async () => {
  expect(
    await ƒ(`
    x: [ 128 ] ;
    y: [ x x + ] ;
    [
      x: [ 256 ] ;
      y
    ] in
  `)
  ).toEqual(`[ [ 256 ] ]`);
});

test(`defined?`, async () => {
  expect(await ƒ(`'swap' defined?`)).toEqual(`[ true ]`);
  expect(await ƒ(`'slip' defined?`)).toEqual(`[ true ]`);
  expect(await ƒ(`'junk' defined?`)).toEqual(`[ false ]`);
  expect(ƒ(`'%top' defined?`)).rejects.toThrow(`'defined?' invalid key: "%top"`);  // ????
});

test('hides private', async () => {
  expect(
    await ƒ(`
    [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
    ] module use
    y
    '_x' defined?
  `)
  ).toEqual(`[ 9 false ]`);

  expect(
    await ƒ(`
    s: [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
    ] module ;
    s.y
    's._x' defined?
  `)
  ).toEqual(`[ 9 false ]`);
});

test('module `include` scoping', async () => {
  expect(
    await ƒ(`
    drop2: [ dup ] ;
    [
      'shuffle.ff' include
      x: [ 1 2 3 drop2 ] ;
    ] module use
    x
  `)
  ).toEqual(`[ 1 ]`);
});

test('module `use` scoping', async () => {
  expect(
    await ƒ(`
    drop2: [ dup ] ;
    [
      'shuffle.ff' import use
      x: [ 1 2 3 drop2 ] ;
    ] module use
    x
  `)
  ).toEqual(`[ 1 ]`);
});

test('only `use` modules', async () => {
  expect(ƒ(`{ x: [ 1 2 + ] } use`)).rejects.toThrow(`'use' invalid vocabulary. Vocabulary should be a map of global symbols`);
  // expect(ƒ(`{ x: #y } use`)).rejects.toThrow(`'use' invalid vocabulary. Symbol is undefined: y`);
});

test('explicit locals are not bound', async () => {
  expect(
    await ƒ(`
    s: [
      x: [ 1 2 + ] ;
      y: [ .x 3 * ] ;
    ] module ;
    x: [ 5 ] ;
    y: [ 7 ] ;
    x y s.x s.y
  `)
  ).toEqual(`[ 5 7 3 15 ]`);
});

test('core words are bound', async () => {
  expect(
    await ƒ(`
    x: [ 25 sqrt ] ;
    sqrt: [ 4 ] ;
    x
  `)
  ).toEqual(`[ 5 ]`);
});

describe('inline at defintion', () => {
  test(`; does inline`, async () => {
    expect(
      await ƒ(`
      x: [ 5 ! ] ;
      !: [ drop 4 ] ;
      x
    `)
    ).toEqual(`[ 120 ]`);
  });

  test(`explicit non-inline`, async () => {
    expect(
      await ƒ(`
      x: [ 5 .! ] ;
      !: [ drop 4 ] ;
      x
    `)
    ).toEqual(`[ 4 ]`);
  });
});

test('binding vocab', async () => {
  expect(
    await ƒ(`
    [
      δy: [
        δz: [ 8 ] ;
      ] module ;
      δx: [ δy.δz ] ;
    ] module use
    δx
    'δx' defined?
    'δy' defined?
    'δz' defined?
  `)
  ).toEqual(`[ 8 true true false ]`);

  expect(
    await ƒ(`
    [
      [
        δy: [
          δz: [ 13 ] ;
        ] module ;
      ] module use
      δx: [ δy.δz ] ;
    ] module use
    δx
    'δx' defined?
    'δy' defined?
    'δz' defined?
  `)
  ).toEqual(`[ 13 true false false ]`);
});
