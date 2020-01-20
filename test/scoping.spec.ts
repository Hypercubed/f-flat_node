import test from 'ava';
import { fValues } from './helpers/setup';

test('in/fork', async t => {
  t.deepEqual(
    await fValues('a: ["before"] def [ a ] in'),
    [['before']],
    'fork should have access to parent scope'
  );
  t.deepEqual(
    await fValues('a: ["outer"] def [ a: ["inner"] def a ] fork a'),
    [['inner'], 'outer'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    await fValues('a: ["outer"] def [ b: ["inner"] def a ] in b'),
    [['outer'], 'inner'],
    'in does not isolate child scope'
  );
});

test('module `use` scoping', async t => {
  t.deepEqual(await fValues(`
    [
      x: [ 1 2 + ] ;
      y: [ x 2 * ] ;
      export
    ] fork drop use
    x: [ 8 ] ;
    x y
  `), [8, 6]);

  t.deepEqual(await fValues(`
    x: [ 8 ] ;
    [
      x: [ 1 2 + ] ;
      y: [ x 2 * ] ;
      export
    ] fork drop use
    x y
  `), [8, 6]);

  t.deepEqual(await fValues(`
    [
      x: [ 1 2 + ] ;
      y: [ x 2 * ] ;
      export
    ] fork drop use
    x y
  `), [3, 6]);
});

test('module def scoping', async t => {
  t.deepEqual(await fValues(`
    s: [
      x: [ 1 2 + ] ;
      y: [ x 3 * ] ;
      export
    ] fork drop ;
    x: [ 5 ] ;
    y: [ 7 ] ;
    x y s.x s.y
  `), [5, 7, 3, 9]);

  t.deepEqual(await fValues(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      x: [ 1 2 + ] ;
      y: [ x 3 * ] ;
      export
    ] fork drop ;
    x y s.x s.y
  `), [5, 7, 3, 9]);

  t.deepEqual(await fValues(`
    x: [ 5 ] ;
    y: [ 7 ] ;
    s: [
      y: [ x 3 * ] ;
      export
    ] fork drop ;
    x y s.y
  `), [5, 7, 15]);
});

test('calling within child', async t => {
  t.deepEqual(await fValues(`
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
  `), [[5, 7, 3, 9]]);
});

test('deep calling within child', async t => {
  t.deepEqual(await fValues(`
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
  `), [[5, 7, 3, 9]]);
});

test(`locals don't collide with scoped definitions`, async t => {
  t.deepEqual(await fValues(`
    x: 128 ;
    y: [ x x + ] ;
    [
      x: 256 ;
      y
    ] fork
  `), [ [ 256 ] ]);
});

test('hides private', async t => {
  t.deepEqual(await fValues(`
    [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
      export
    ] fork drop use
    y 'x' defined?
  `), [9, false]);

  t.deepEqual(await fValues(`
    s: [
      _x: [ 1 2 + ] ;
      y: [ _x 3 * ] ;
      export
    ] fork drop ;
    s.y 's._x' defined?
  `), [9, false]);
});

