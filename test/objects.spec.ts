import { ƒ } from './helpers/setup';

test('should create objects object', async () => {
  expect(await ƒ('[ "first" "Manfred" "last" "von Thun" ] object')).toEqual(
    `[ { first: 'Manfred', last: 'von Thun' } ]`
  );

  expect(await ƒ('{ first: "Manfred" last: "von Thun" }')).toEqual(
    `[ { first: 'Manfred', last: 'von Thun' } ]`
  );

  expect(await ƒ('{ name: { first: "Manfred" last: "von Thun" } }')).toEqual(
    `[ { name: { first: 'Manfred', last: 'von Thun' } } ]`
  );

  expect(
    await ƒ('{ name: [ { first: "Manfred" } { last: "von Thun" } ] }')
  ).toEqual(`[ { name: [ { first: 'Manfred' } { last: 'von Thun' } ] } ]`);
});

test('should create objects object with cased keys', async () => {
  expect(await ƒ('[ "First" "Manfred" "Last" "von Thun" ] object')).toEqual(
    `[ { First: 'Manfred', Last: 'von Thun' } ]`
  );

  expect(await ƒ('{ First: "Manfred" Last: "von Thun" }')).toEqual(
    `[ { First: 'Manfred', Last: 'von Thun' } ]`
  );
});

test('should create objects object, cont', async () => {
  // t.deepEqual(await ƒ('{ name: [ { first: "Manfred" } { last: "von" " Thun" + } ] }'), [{ name: [{first: 'Manfred'}, {last: 'von Thun'}] }]);
  expect(await ƒ('{ first: "Manfred", last: "von Thun" }')).toEqual(
    `[ { first: 'Manfred', last: 'von Thun' } ]`
  );
  expect(await ƒ('{ first: "Manfred", last: [ "von" "Thun" ] " " * }')).toEqual(
    `[ { first: 'Manfred', last: 'von Thun' } ]`
  );
});

test('should test is object', async () => {
  expect(await ƒ('{ first: "Manfred" last: "von Thun" } object?')).toEqual(
    `[ true ]`
  );
  expect(await ƒ('[ first: "Manfred" last: "von Thun" ] object?')).toEqual(
    `[ false ]`
  );
});

test('should create objects object, cont2', async () => {
  expect(await ƒ('{ "first": "Manfred", "last": "von Thun" }')).toEqual(
    `[ { first: 'Manfred', last: 'von Thun' } ]`
  );

  expect(await ƒ('[ { first: "Manfred", last: "von Thun" } ]')).toEqual(
    `[ [ { first: 'Manfred', last: 'von Thun' } ] ]`
  );

  expect(await ƒ('[ { "first": "Manfred", "last": "von Thun" } ]')).toEqual(
    `[ [ { first: 'Manfred', last: 'von Thun' } ] ]`
  );
});

test('should test is object', async () => {
  expect(await ƒ('{ first: "Manfred" last: "von Thun" } object?')).toEqual(
    `[ true ]`
  );
  expect(await ƒ('[ first: "Manfred" last: "von Thun" ] object?')).toEqual(
    `[ false ]`
  );
});

test('should get keys and values', async () => {
  expect(await ƒ('{ first: "Manfred" last: "von Thun" } keys')).toEqual(
    `[ [ 'first' 'last' ] ]`
  );
  expect(await ƒ('{ "first" "Manfred" "last" "von Thun" } vals')).toEqual(
    `[ [ 'Manfred' 'von Thun' ] ]`
  );
});

test('should get single values usint @', async () => {
  expect(await ƒ('{ first: "Manfred" last: "von Thun" } first: @')).toEqual(
    `[ 'Manfred' ]`
  );
  expect(await ƒ('{ first: "Manfred" last: "von Thun" } last: @')).toEqual(
    `[ 'von Thun' ]`
  );
});

test('should join objects', async () => {
  expect(await ƒ('{ first: "Manfred" } { last: "von Thun" } +')).toEqual(
    `[ { first: 'Manfred', last: 'von Thun' } ]`
  );
  expect(
    await ƒ('{ first: "Manfred" } { first: "John" last: "von Thun" } <<')
  ).toEqual(`[ { first: 'John', last: 'von Thun' } ]`);
  expect(
    await ƒ('{ first: "Manfred" } { first: "John" last: "von Thun" } >>')
  ).toEqual(`[ { last: 'von Thun', first: 'Manfred' } ]`);
});

test('should join objects without mutations', async () => {
  expect(await ƒ('{ first: "Manfred" } dup { last: "von Thun" } +')).toEqual(
    `[ { first: 'Manfred' } { first: 'Manfred', last: 'von Thun' } ]`
  );
  expect(await ƒ('{ first: "Manfred" } dup { last: "von Thun" } >>')).toEqual(
    `[ { first: 'Manfred' } { last: 'von Thun', first: 'Manfred' } ]`
  );
  expect(await ƒ('{ first: "Manfred" } dup { last: "von Thun" } <<')).toEqual(
    `[ { first: 'Manfred' } { first: 'Manfred', last: 'von Thun' } ]`
  );
});

test('objects', async () => {
  expect(await ƒ('{ name: [ "Manfred" "von Thun" ] }')).toEqual(
    `[ { name: [ 'Manfred' 'von Thun' ] } ]`
  );
  expect(await ƒ('{ name: "Manfred" " von Thun" + }')).toEqual(
    `[ { name: 'Manfred von Thun' } ]`
  );
  expect(await ƒ('{ name: ( "Manfred" " von Thun" + ) }')).toEqual(
    `[ { name: [ 'Manfred von Thun' ] } ]`
  );
  expect(await ƒ('{ first: "Manfred" last: "von Thun" } ln')).toEqual(`[ 2 ]`);
});

test('should <=> objects by key length', async () => {
  expect(await ƒ('{ x: 123 } { y: 456 } <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('{ x: 123, z: 789 } { y: 456 } <=>')).toEqual(`[ 1 ]`);
  expect(await ƒ('{ x: 123 } { y: 456, z: 789 } <=>')).toEqual(`[ -1 ]`);
});

test('objects in defintions', async () => {
  expect(await ƒ('x: [ { x: "123" } ] ; x')).toEqual(`[ { x: '123' } ]`);
  expect(await ƒ('x: [ { "x" : "123" } ] ; x')).toEqual(`[ { x: '123' } ]`);
  expect(await ƒ('x: [ { 1: "123" } ] ; x')).toEqual(`[ { "1": '123' } ]`); // todo: stringify should single quote strings
});
