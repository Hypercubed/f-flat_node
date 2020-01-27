import { fJSON } from './helpers/setup';

test('should create objects object', async () => {
  expect(
    await fJSON('[ "first" "Manfred" "last" "von Thun" ] object')
  ).toEqual([{ first: 'Manfred', last: 'von Thun' }]);

  expect(await fJSON('{ first: "Manfred" last: "von Thun" }')).toEqual([
    { first: 'Manfred', last: 'von Thun' }
  ]);

  expect(
    await fJSON('{ name: { first: "Manfred" last: "von Thun" } }')
  ).toEqual([{ name: { first: 'Manfred', last: 'von Thun' } }]);

  expect(
    await fJSON('{ name: [ { first: "Manfred" } { last: "von Thun" } ] }')
  ).toEqual([{ name: [{ first: 'Manfred' }, { last: 'von Thun' }] }]);
});

test('should create objects object, cont', async () => {
  // t.deepEqual(await fJSON('{ name: [ { first: "Manfred" } { last: "von" " Thun" + } ] }'), [{ name: [{first: 'Manfred'}, {last: 'von Thun'}] }]);
  expect(await fJSON('{ first: "Manfred", last: "von Thun" }')).toEqual([
    { first: 'Manfred', last: 'von Thun' }
  ]);
  expect(
    await fJSON('{ first: "Manfred", last: [ "von" "Thun" ] " " * }')
  ).toEqual([{ first: 'Manfred', last: 'von Thun' }]);
});

test('should test is object', async () => {
  expect(await fJSON('{ first: "Manfred" last: "von Thun" } object?')).toEqual([
    true
  ]);
  expect(await fJSON('[ first: "Manfred" last: "von Thun" ] object?')).toEqual([
    false
  ]);
});

test('should create objects object, cont2', async () => {
  expect(await fJSON('{ "first": "Manfred", "last": "von Thun" }')).toEqual([
    { first: 'Manfred', last: 'von Thun' }
  ]);

  expect(await fJSON('[ { first: "Manfred", last: "von Thun" } ]')).toEqual([
    [{ first: 'Manfred', last: 'von Thun' }]
  ]);

  expect(await fJSON('[ { "first": "Manfred", "last": "von Thun" } ]')).toEqual([
    [{ first: 'Manfred', last: 'von Thun' }]
  ]);
});

test('should test is object', async () => {
  expect(await fJSON('{ first: "Manfred" last: "von Thun" } object?')).toEqual([
    true
  ]);
  expect(await fJSON('[ first: "Manfred" last: "von Thun" ] object?')).toEqual([
    false
  ]);
});

test('should get keys and values', async () => {
  expect(await fJSON('{ first: "Manfred" last: "von Thun" } keys')).toEqual([
    ['first', 'last']
  ]);
  expect(await fJSON('{ "first" "Manfred" "last" "von Thun" } vals')).toEqual([
    ['Manfred', 'von Thun']
  ]);
});

test('should get single values usint @', async () => {
  expect(
    await fJSON('{ first: "Manfred" last: "von Thun" } first: @')
  ).toEqual(['Manfred']);
  expect(await fJSON('{ first: "Manfred" last: "von Thun" } last: @')).toEqual([
    'von Thun'
  ]);
});

test('should join objects', async () => {
  expect(await fJSON('{ first: "Manfred" } { last: "von Thun" } +')).toEqual([
    { first: 'Manfred', last: 'von Thun' }
  ]);
  expect(
    await fJSON('{ first: "Manfred" } { first: "John" last: "von Thun" } <<')
  ).toEqual([{ first: 'John', last: 'von Thun' }]);
  expect(
    await fJSON('{ first: "Manfred" } { first: "John" last: "von Thun" } >>')
  ).toEqual([{ first: 'Manfred', last: 'von Thun' }]);
});

test('should join objects without mutations', async () => {
  expect(
    await fJSON('{ first: "Manfred" } dup { last: "von Thun" } +')
  ).toEqual([{ first: 'Manfred' }, { first: 'Manfred', last: 'von Thun' }]);
  expect(
    await fJSON('{ first: "Manfred" } dup { last: "von Thun" } >>')
  ).toEqual([{ first: 'Manfred' }, { first: 'Manfred', last: 'von Thun' }]);
  expect(
    await fJSON('{ first: "Manfred" } dup { last: "von Thun" } <<')
  ).toEqual([{ first: 'Manfred' }, { first: 'Manfred', last: 'von Thun' }]);
});

test('objects', async () => {
  expect(await fJSON('{ name: [ "Manfred" "von Thun" ] }')).toEqual([
    { name: ['Manfred', 'von Thun'] }
  ]);
  expect(await fJSON('{ name: "Manfred" " von Thun" + }')).toEqual([
    { name: 'Manfred von Thun' }
  ]);
  expect(await fJSON('{ name: ( "Manfred" " von Thun" + ) }')).toEqual([
    { name: ['Manfred von Thun'] }
  ]);
  expect(await fJSON('{ first: "Manfred" last: "von Thun" } ln')).toEqual([2]);
});

test('should <=> objects by key length', async () => {
  expect(await fJSON('{ x: 123 } { y: 456 } <=>')).toEqual([0]);
  expect(await fJSON('{ x: 123, z: 789 } { y: 456 } <=>')).toEqual([1]);
  expect(await fJSON('{ x: 123 } { y: 456, z: 789 } <=>')).toEqual([-1]);
});

test('objects in defintions', async () => {
  expect(await fJSON('x: [ { x: "123" } ] ; x')).toEqual([{ x: '123' }]);
  expect(await fJSON('x: [ { "x" : "123" } ] ; x')).toEqual([{ x: '123' }]);
  expect(await fJSON('x: [ { 1: "123" } ] ; x')).toEqual([{ '1': '123' }]);
});
