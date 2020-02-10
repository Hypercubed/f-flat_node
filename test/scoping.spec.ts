import { ƒ } from './helpers/setup';

test('in/fork', async () => {
  expect(await ƒ(`a: [ 'before' ] def [ a ] in`)).toEqual(`[ [ 'before' ] ]`);
  expect(await ƒ(`a: [ "outer" ] def [ a: [ "inner" ] def a ] fork a`)).toEqual(
    `[ [ 'inner' ] 'outer' ]`
  );
  expect(await ƒ(`a: [ 'outer' ] def [ b: [ 'inner' ] def a ] in b`)).toEqual(
    `[ [ 'outer' ] 'inner' ]`
  );
});

describe('module `use` scoping', () => {
  test('scoped words', async () => {
    expect(
      await ƒ(`
      [
        δx: [ 1 2 + ] ;
        δy: [ δx 2 * ] ;
        export
      ] fork drop use
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
        export
      ] fork drop use
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
        export
      ] fork drop use
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
      export
    ] fork drop ;
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
      export
    ] fork drop ;
    x y s.x s.y
  `)
  ).toEqual(`[ 5 7 3 9 ]`);

  expect(
    await ƒ(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      y: [ x 3 * ] ;
      export
    ] fork drop ;
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
      export
    ] fork drop ;
    [
      x y s.x s.y
    ] fork
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
        export
      ] fork drop ;
      export
    ] fork drop ;
    [
      x y s.s.x s.s.y
    ] fork
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
    ] fork
  `)
  ).toEqual(`[ [ 256 ] ]`);
});

test('hides private', async () => {
  expect(
    await ƒ(`
    [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
      export
    ] fork drop use
    y
    '_x' defined?
  `)
  ).toEqual(`[ 9 false ]`);

  expect(
    await ƒ(`
    s: [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
      export
    ] fork drop ;
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
      export
    ] fork drop use
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
      export
    ] fork drop use
    x
  `)
  ).toEqual(`[ 1 ]`);
});

test('def does not bind', async () => {
  expect(
    await ƒ(`
    s: [
      x: [ 1 2 + ] def
      y: [ x 3 * ] def
      export
    ] fork drop ;
    x: [ 5 ] ;
    y: [ 7 ] ;
    x y s.x s.y
  `)
  ).toEqual(`[ 5 7 3 15 ]`);
});

test('explicit locals are not bound', async () => {
  expect(
    await ƒ(`
    s: [
      x: [ 1 2 + ] ;
      y: [ .x 3 * ] ;
      export
    ] fork drop ;
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

describe('bind at defintion', () => {
  // Def does not bind
  test('def does not bind', async () => {
    expect(
      await ƒ(`
      x: [ 5 ! ] def
      !: [ drop 4 ] ;
      x
    `)
    ).toEqual(`[ 4 ]`);
  });

  test(`explicit bind`, async () => {
    expect(
      await ƒ(`
      x: [ 5 ! ] bind def
      !: [ drop 4 ] ;
      x
    `)
    ).toEqual(`[ 120 ]`);
  });

  test(`; does bind`, async () => {
    expect(
      await ƒ(`
      x: [ 5 ! ] ;
      !: [ drop 4 ] ;
      x
    `)
    ).toEqual(`[ 120 ]`);
  });

  test(`explicit non-bind`, async () => {
    expect(
      await ƒ(`
      x: [ 5 .! ] bind def
      !: [ drop 4 ] ;
      x
    `)
    ).toEqual(`[ 4 ]`);
  });
});

describe('bind', () => {
  test('without bind, uses local scope', async () => {
    expect(
      await ƒ(`
      [ 5 ! ]
      !: [ drop 4 ] ;
      eval
    `)
    ).toEqual(`[ 4 ]`);
  });

  test('with bind, binds to defintion at bind time', async () => {
    expect(
      await ƒ(`
      [ 5 ! ] bind
      !: [ drop 4 ] ;
      eval
    `)
    ).toEqual(`[ 120 ]`);
  });

  test('with explicit non-bind at bind time', async () => {
    expect(
      await ƒ(`
      [ 5 .! ] bind
      !: [ drop 4 ] ;
      eval
    `)
    ).toEqual(`[ 4 ]`);
  });
});

test('binding vocab', async () => {
  expect(
    await ƒ(`
    δx: { δy: [ 1 ] } ;
    δx.δy
    'δx' defined?
    'δy' defined?
  `)
  ).toEqual(`[ 1 true false ]`);

  expect(
    await ƒ(`
    δx: { δy: [ 2 ] } ;
    [ δx.δy ] bind eval
    'δx' defined?
    'δy' defined?
  `)
  ).toEqual(`[ 2 true false ]`);

  expect(
    await ƒ(`
    δx: { δy: [ 3 ] } ;
    [ δx.δy ] inline
    'δx' defined?
    'δy' defined?
  `)
  ).toEqual(`[ [ 3 ] true false ]`);

  expect(
    await ƒ(`
    [
      δy: { δz: [ 5 ] } ;
      δx: [ δy.δz ] ;
      export
    ] fork drop use
    δx
    'δx' defined?
    'δy' defined?
    'δz' defined?
  `)
  ).toEqual(`[ 5 true true false ]`);

  expect(
    await ƒ(`
    [
      δy: [
        δz: [ 8 ] ;
        export
      ] fork drop ;
      δx: [ δy.δz ] ;
      export
    ] fork drop use
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
          export
        ] fork drop ;
        export
      ] fork drop use
      δx: [ δy.δz ] ;
      export
    ] fork drop use
    δx
    'δx' defined?
    'δy' defined?
    'δz' defined?
  `)
  ).toEqual(`[ 13 true false false ]`);
});
