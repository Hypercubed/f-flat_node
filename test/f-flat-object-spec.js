import test from 'ava';
import {Stack as F} from '../';
import {log} from '../src/logger';

log.level = process.env.NODE_ENV || 'error';

process.chdir('..');

function fSync (a) {
  return new F(a).toArray();
}

test('should create objects object', t => {
  t.same(fSync('[ "first" "Manfred" "last" "von Thun" ] object'), [{first: 'Manfred', last: 'von Thun'}], 'should create objects from arrays');
  t.same(fSync('{ first: "Manfred" last: "von Thun" }'), [{first: 'Manfred', last: 'von Thun'}], 'should create objects');
  t.same(fSync('{ name: { first: "Manfred" last: "von Thun" } }'), [{name: {first: 'Manfred', last: 'von Thun'}}], 'should create nested objects');
  t.same(fSync('{ name: [ { first: "Manfred" } { last: "von Thun" } ] }'), [{name: [{first: 'Manfred'}, {last: 'von Thun'}]}]);
});

test('should create objects object, cont', t => {
  // t.same(fSync('{ name: [ { first: "Manfred" } { last: "von" " Thun" + } ] }'), [{ name: [{first: 'Manfred'}, {last: 'von Thun'}] }]);
  t.same(fSync('{ first: "Manfred", last: "von Thun" }'), [{first: 'Manfred', last: 'von Thun'}], 'commas are optional');
  t.same(fSync('{ first: "Manfred", last: [ "von" "Thun" ] " " * }'), [{first: 'Manfred', last: 'von Thun'}], 'should evaluate in objects');
});

test('should test is object', t => {
  t.same(fSync('{ first: "Manfred" last: "von Thun" } object?'), [true]);
  t.same(fSync('[ first: "Manfred" last: "von Thun" ] object?'), [false]);
});

test('should get keys and values', t => {
  t.same(fSync('{ first: "Manfred" last: "von Thun" } keys'), [['first', 'last']]);
  t.same(fSync('{ "first" "Manfred" "last" "von Thun" } vals'), [['Manfred', 'von Thun']]);
});

test('should get single values usint @', t => {
  t.same(fSync('{ first: "Manfred" last: "von Thun" } first: @'), ['Manfred']);
  t.same(fSync('{ first: "Manfred" last: "von Thun" } last: @'), ['von Thun']);
});

test('should join objects', t => {
  t.same(fSync('{ first: "Manfred" } { last: "von Thun" } +'), [{first: 'Manfred', last: 'von Thun'}]);
  t.same(fSync('{ first: "Manfred" } { first: "John" last: "von Thun" } <<'), [{first: 'John', last: 'von Thun'}]);
  t.same(fSync('{ first: "Manfred" } { first: "John" last: "von Thun" } >>'), [{first: 'Manfred', last: 'von Thun'}]);
});

test('should join objects without mutations', t => {
  t.same(fSync('{ first: "Manfred" } dup { last: "von Thun" } +'), [{first: 'Manfred'}, {first: 'Manfred', last: 'von Thun'}]);
  t.same(fSync('{ first: "Manfred" } dup { last: "von Thun" } >>'), [{first: 'Manfred'}, {first: 'Manfred', last: 'von Thun'}]);
  t.same(fSync('{ first: "Manfred" } dup { last: "von Thun" } <<'), [{first: 'Manfred'}, {first: 'Manfred', last: 'von Thun'}]);
});

test('', t => {
  t.same(fSync('{ name: [ "Manfred" "von Thun" ] }'), [{name: ['Manfred', 'von Thun']}]);
  t.same(fSync('{ name: "Manfred" " von Thun" + }'), [{name: 'Manfred von Thun'}]);
  t.same(fSync('{ name: ( "Manfred" " von Thun" + ) }'), [{name: ['Manfred von Thun']}]);
  t.same(fSync('{ first: "Manfred" last: "von Thun" } length'), [2], 'should get keys length');
});
