import { ƒ } from './helpers/setup';

test('in/fork', async () => {
  expect(await ƒ('a: ["before"] def [ a ] in')).toEqual(`[ [ 'before' ] ]`);
  expect(
    await ƒ('a: ["outer"] def [ a: ["inner"] def a ] fork a')
  ).toEqual(`[ [ 'inner' ] 'outer' ]`);
  expect(
    await ƒ('a: ["outer"] def [ b: ["inner"] def a ] in b')
  ).toEqual(`[ [ 'outer' ] 'inner' ]`);
});

test('module `use` scoping', async () => {
  expect(
    await ƒ(`
    [
      x: [ 1 2 + ] ;
      y: [ x 2 * ] ;
      export
    ] fork drop use
    x: [ 8 ] ;
    x y
  `)
  ).toEqual(`[ 8 6 ]`);

  expect(
    await ƒ(`
    x: [ 8 ] ;
    [
      x: [ 1 2 + ] ;
      y: [ x 2 * ] ;
      export
    ] fork drop use
    x y
  `)
  ).toEqual(`[ 8 6 ]`);

  expect(
    await ƒ(`
    [
      x: [ 1 2 + ] ;
      y: [ x 2 * ] ;
      export
    ] fork drop use
    x y
  `)
  ).toEqual(`[ 3 6 ]`);
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
    x: 128 ;
    y: [ x x + ] ;
    [
      x: 256 ;
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
    y 'x' defined?
  `)
  ).toEqual(`[ 9 false ]`);

  expect(
    await ƒ(`
    s: [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
      export
    ] fork drop ;
    s.y 's._x' defined?
  `)
  ).toEqual(`[ 9 false ]`);
});

test('module `include` scoping', async () => {
  expect(
    await ƒ(`
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

test('explicit locals', async () => {
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

test.skip('prelude binding', async () => { // TODO
  expect(
    await ƒ(`
    x: [ 25 sqrt ] ;
    sqrt: [ 4 ] ;
    x
  `)
  ).toEqual(`[ 5 ]`);
});

test('bind at defintion', async () => {
  // Def does not bind
  expect(
    await ƒ(`
    x: [ 5 ! ] def
    !: [ drop 4 ] ;
    x
  `)
  ).toEqual(`[ 4 ]`);

  // ; does
  expect(
    await ƒ(`
    x: [ 5 ! ] ;
    !: [ drop 4 ] ;
    x
  `)
  ).toEqual(`[ 120 ]`);

  // with explicit non-bind
  expect(
    await ƒ(`
    x: [ 5 .! ] ;
    !: [ drop 4 ] ;
    x
  `)
  ).toEqual(`[ 4 ]`);
});

test('bind', async () => {
  // without bind, uses local scope
  expect(
    await ƒ(`
    [ 5 ! ]
    !: [ drop 4 ] ;
    eval
  `)
  ).toEqual(`[ 4 ]`);

  // with bind, binds to defintion at bind time
  expect(
    await ƒ(`
    [ 5 ! ] bind
    !: [ drop 4 ] ;
    eval
  `)
  ).toEqual(`[ 120 ]`);

  // with explicit non-bind at bind time
  expect(
    await ƒ(`
    [ 5 .! ] bind
    !: [ drop 4 ] ;
    eval
  `)
  ).toEqual(`[ 4 ]`);
});