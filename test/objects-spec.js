import test from 'ava';
import { fSync } from './setup';

test('should create objects object', t => {
  t.deepEqual(
    fSync('[ "first" "Manfred" "last" "von Thun" ] object'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'should create objects from arrays'
  );
  t.deepEqual(
    fSync('{ first: "Manfred" last: "von Thun" }'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'should create objects'
  );
  t.deepEqual(
    fSync('{ name: { first: "Manfred" last: "von Thun" } }'),
    [{ name: { first: 'Manfred', last: 'von Thun' } }],
    'should create nested objects'
  );
  t.deepEqual(
    fSync('{ name: [ { first: "Manfred" } { last: "von Thun" } ] }'),
    [{ name: [{ first: 'Manfred' }, { last: 'von Thun' }] }]
  );
});

test('should create objects object, cont', t => {
  // t.deepEqual(fSync('{ name: [ { first: "Manfred" } { last: "von" " Thun" + } ] }'), [{ name: [{first: 'Manfred'}, {last: 'von Thun'}] }]);
  t.deepEqual(
    fSync('{ first: "Manfred", last: "von Thun" }'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'commas are optional'
  );
  t.deepEqual(
    fSync('{ first: "Manfred", last: [ "von" "Thun" ] " " * }'),
    [{ first: 'Manfred', last: 'von Thun' }],
    'should evaluate in objects'
  );
});

test('should test is object', t => {
  t.deepEqual(fSync('{ first: "Manfred" last: "von Thun" } object?'), [true]);
  t.deepEqual(fSync('[ first: "Manfred" last: "von Thun" ] object?'), [false]);
});

test('should get keys and values', t => {
  t.deepEqual(fSync('{ first: "Manfred" last: "von Thun" } keys'), [
    ['first', 'last']
  ]);
  t.deepEqual(fSync('{ "first" "Manfred" "last" "von Thun" } vals'), [
    ['Manfred', 'von Thun']
  ]);
});

test('should get single values usint @', t => {
  t.deepEqual(fSync('{ first: "Manfred" last: "von Thun" } first: @'), [
    'Manfred'
  ]);
  t.deepEqual(fSync('{ first: "Manfred" last: "von Thun" } last: @'), [
    'von Thun'
  ]);
});

test('should join objects', t => {
  t.deepEqual(fSync('{ first: "Manfred" } { last: "von Thun" } +'), [
    { first: 'Manfred', last: 'von Thun' }
  ]);
  t.deepEqual(
    fSync('{ first: "Manfred" } { first: "John" last: "von Thun" } <<'),
    [{ first: 'John', last: 'von Thun' }]
  );
  t.deepEqual(
    fSync('{ first: "Manfred" } { first: "John" last: "von Thun" } >>'),
    [{ first: 'Manfred', last: 'von Thun' }]
  );
});

test('should join objects without mutations', t => {
  t.deepEqual(fSync('{ first: "Manfred" } dup { last: "von Thun" } +'), [
    { first: 'Manfred' },
    { first: 'Manfred', last: 'von Thun' }
  ]);
  t.deepEqual(fSync('{ first: "Manfred" } dup { last: "von Thun" } >>'), [
    { first: 'Manfred' },
    { first: 'Manfred', last: 'von Thun' }
  ]);
  t.deepEqual(fSync('{ first: "Manfred" } dup { last: "von Thun" } <<'), [
    { first: 'Manfred' },
    { first: 'Manfred', last: 'von Thun' }
  ]);
});

test('', t => {
  t.deepEqual(fSync('{ name: [ "Manfred" "von Thun" ] }'), [
    { name: ['Manfred', 'von Thun'] }
  ]);
  t.deepEqual(fSync('{ name: "Manfred" " von Thun" + }'), [
    { name: 'Manfred von Thun' }
  ]);
  t.deepEqual(fSync('{ name: ( "Manfred" " von Thun" + ) }'), [
    { name: ['Manfred von Thun'] }
  ]);
  t.deepEqual(
    fSync('{ first: "Manfred" last: "von Thun" } length'),
    [2],
    'should get keys length'
  );
});
