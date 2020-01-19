import test from 'ava';
import { fJSON } from './helpers/setup';

test('should create objects object', async t => {
  t.deepEqual(
    await fJSON('[ "first" "Manfred" "last" "von Thun" ] object'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'should create objects from arrays'
  );
  t.deepEqual(
   await fJSON('{ first: "Manfred" last: "von Thun" }'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'should create objects'
  );
  t.deepEqual(
   await fJSON('{ name: { first: "Manfred" last: "von Thun" } }'),
    [{ name: { first: 'Manfred', last: 'von Thun' } }],
    'should create nested objects'
  );
  t.deepEqual(
   await fJSON('{ name: [ { first: "Manfred" } { last: "von Thun" } ] }'),
    [{ name: [{ first: 'Manfred' }, { last: 'von Thun' }] }]
  );
});

test('should create objects object, cont', async t => {
  // t.deepEqual(await fJSON('{ name: [ { first: "Manfred" } { last: "von" " Thun" + } ] }'), [{ name: [{first: 'Manfred'}, {last: 'von Thun'}] }]);
  t.deepEqual(
   await fJSON('{ first: "Manfred", last: "von Thun" }'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'commas are optional'
  );
  t.deepEqual(
   await fJSON('{ first: "Manfred", last: [ "von" "Thun" ] " " * }'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'should evaluate in objects'
  );
});

test('should test is object', async t => {
  t.deepEqual(await fJSON('{ first: "Manfred" last: "von Thun" } object?'), [true]);
  t.deepEqual(await fJSON('[ first: "Manfred" last: "von Thun" ] object?'), [false]);
});

test('should get keys and values', async t => {
  t.deepEqual(await fJSON('{ first: "Manfred" last: "von Thun" } keys'), [
    ['first', 'last']
  ]);
  t.deepEqual(await fJSON('{ "first" "Manfred" "last" "von Thun" } vals'), [
    ['Manfred', 'von Thun']
  ]);
});

test('should get single values usint @', async t => {
  t.deepEqual(await fJSON('{ first: "Manfred" last: "von Thun" } first: @'), [
    'Manfred'
  ]);
  t.deepEqual(await fJSON('{ first: "Manfred" last: "von Thun" } last: @'), [
    'von Thun'
  ]);
});

test('should join objects', async t => {
  t.deepEqual(await fJSON('{ first: "Manfred" } { last: "von Thun" } +'), [
    { first: 'Manfred', last: 'von Thun' }
  ]);
  t.deepEqual(
   await fJSON('{ first: "Manfred" } { first: "John" last: "von Thun" } <<'),
    [{ first: 'John', last: 'von Thun' }]
  );
  t.deepEqual(
   await fJSON('{ first: "Manfred" } { first: "John" last: "von Thun" } >>'),
    [{ first: 'Manfred', last: 'von Thun' }]
  );
});

test('should join objects without mutations', async t => {
  t.deepEqual(await fJSON('{ first: "Manfred" } dup { last: "von Thun" } +'), [
    { first: 'Manfred' },
    { first: 'Manfred', last: 'von Thun' }
  ]);
  t.deepEqual(await fJSON('{ first: "Manfred" } dup { last: "von Thun" } >>'), [
    { first: 'Manfred' },
    { first: 'Manfred', last: 'von Thun' }
  ]);
  t.deepEqual(await fJSON('{ first: "Manfred" } dup { last: "von Thun" } <<'), [
    { first: 'Manfred' },
    { first: 'Manfred', last: 'von Thun' }
  ]);
});

test('objects', async t => {
  t.deepEqual(await fJSON('{ name: [ "Manfred" "von Thun" ] }'), [
    { name: ['Manfred', 'von Thun'] }
  ]);
  t.deepEqual(await fJSON('{ name: "Manfred" " von Thun" + }'), [
    { name: 'Manfred von Thun' }
  ]);
  t.deepEqual(await fJSON('{ name: ( "Manfred" " von Thun" + ) }'), [
    { name: ['Manfred von Thun'] }
  ]);
  t.deepEqual(
   await fJSON('{ first: "Manfred" last: "von Thun" } ln'),
    [2],
    'should get keys length'
  );
});

test('should <=> objects by key length', async t => {
  t.deepEqual(await fJSON('{ x: 123 } { y: 456 } <=>'), [0]);
  t.deepEqual(await fJSON('{ x: 123, z: 789 } { y: 456 } <=>'), [1]);
  t.deepEqual(await fJSON('{ x: 123 } { y: 456, z: 789 } <=>'), [-1]);
});
