import test from 'ava';
import {
  F,
  fSync,
  fSyncJSON,
  fSyncStack,
  fSyncValues,
  Action,
  Decimal,
  D,
  Complex,
  Word
} from './setup';
import { stringifyStrict } from '../dist/utils/json';

test('prims', t => {
  testStringify('number', 42, '42');
  testStringify('negative number', -42, '-42');
  testStringify('string', 'woo!!!', '"woo!!!"');
  testStringify('boolean', true, 'true');
  testStringify('null', null, 'null');

  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

test('special', t => {
  testStringify('negative zero', -0, '{"$numberDecimal":"-0"}');
  testStringify('undefined', undefined, '{"$undefined":true}');
  testStringify('NaN', NaN, '{"$numberDecimal":"NaN"}');
  testStringify('Infinity', Infinity, '{"$numberDecimal":"Infinity"}');
  testStringify('Infinity', -Infinity, '{"$numberDecimal":"-Infinity"}');
  testStringify('RegExp', /regexp/img, '{"$regex":"regexp","$options":"gim"}');
  testStringify('Date', new Date(1e12), '{"$date":"2001-09-09T01:46:40.000Z"}');
  testStringify('Symbol', Symbol('a'), '{"$symbol":"a"}');

  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

test('nested', t => {
  testStringify('Array', ['a', 'b', 'c'], '["a","b","c"]');
  testStringify('Array (empty)', [], '[]');
  testStringify('Array (sparse)', [,'b',,], '[null,"b",null]');
  testStringify('Object', {foo: 'bar', 'x-y': 'z'}, '{"foo":"bar","x-y":"z"}');
  testStringify('Set', new Set([1, 2, 3]), '{"$set":[1,2,3]}');
  testStringify('Map', new Map([['a', 'b']]), '{"$map":[["a","b"]]}');
  
  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

test('nested - special', t => {
  testStringify('Array', ['a', new Date(1e12), 'c'], '["a",{"$date":"2001-09-09T01:46:40.000Z"},"c"]');
  testStringify('Object', {foo: 'bar', 'x-y': new Date(1e12)}, '{"foo":"bar","x-y":{"$date":"2001-09-09T01:46:40.000Z"}}');
  testStringify('Set', new Set([1, new Date(1e12), 3]), '{"$set":[1,{"$date":"2001-09-09T01:46:40.000Z"},3]}');
  testStringify('Map', new Map([['a', new Date(1e12)]]), '{"$map":[["a",{"$date":"2001-09-09T01:46:40.000Z"}]]}');
  
  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

test('fflat', t => {
  testStringify('decimal', new Decimal(42), '{"$numberDecimal":"42"}');
  testStringify('complex', new Complex(42, 3), '{"@@Complex":{"re":"42","im":"3"}}');
  testStringify('word', new Word('word'), '{"@@Action":"word"}');

  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

/* test('cycles', t => {
  const self = {};
  self.a = self;
  testStringify('Object ( cyclical)', self, '{"a":{"$ref":"#"}}');

  const arr = [];
  arr[0] = arr;
  testStringify('Array (cyclical)', arr, '[{"$ref":"#"}]');

  const map = new Map();
  map.set('self', map);
  testStringify('Map (cyclical)', map, '{"$map":[["self",{"$ref":"#"}]]}');

  const set = new Set();
  set.add(set);
  set.add(42);
  testStringify('Set (cyclical)', set, '{"$set":[{"$ref":"#"},42]}');

  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
}); */

test('deep', t => {
  const obj = {
    string: 'a_string',
    number: 42,
    decimal: new Decimal(42),
    array: ['a_string', 42, new Decimal(42)],
    object: {
      'also a string': 'string',
      'a number': 42
    }
  };

  t.snapshot(stringifyStrict(obj));

  /* obj.object.arr = obj.array;
  t.snapshot(stringifyStrict(obj));

  obj.array.push(obj.decimal);
  t.snapshot(stringifyStrict(obj)); */
});

/* test('references', t => {
  const a = {a: 1, b: {}};
  a.c = a.b;
  testStringify('Object (references)', a, '{"a":1,"b":{},"c":{"$ref":"#/b"}}');

  const b = {a: 1, b: { c: {} }};
  b.c = b.b.c;
  testStringify('Object (references)', b, '{"a":1,"b":{"c":{}},"c":{"$ref":"#/b/c"}}');

  function testStringify(name, input, expected) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
}); */

// FF JSON

test('generate json for strings', t => {
  t.deepEqual(fSyncJSON('"hello"')[0], 'hello');
  t.deepEqual(fSyncJSON('["hello" "world"]')[0], ['hello', 'world']);
  t.deepEqual(fSyncJSON('{ x: ["hello" "world"] }')[0], {
    x: ['hello', 'world']
  });
});

test('generate json for decimals', t => {
  t.deepEqual(fSyncJSON('1')[0], { $numberDecimal: '1' });
  t.deepEqual(fSyncJSON('[1 2]')[0], [
    { $numberDecimal: '1' },
    { $numberDecimal: '2' }
  ]);
  t.deepEqual(fSyncJSON('{ x: [1 2] }')[0], {
    x: [{ $numberDecimal: '1' }, { $numberDecimal: '2' }]
  });
});

test('generate json for complex values', t => {
  t.deepEqual(fSyncJSON('{ x: [1 2], y: i }')[0], {
    x: [{ $numberDecimal: '1' }, { $numberDecimal: '2' }],
    y: { '@@Complex': { re: '0', im: '1' } }
  });
});

test('generate json for actions', t => {
  t.deepEqual(fSyncJSON('"word" :')[0], { '@@Action': 'word' });
  t.deepEqual(fSyncJSON('[ "a" "b" ] :')[0], { '@@Action': ["a", "b"] });
  t.deepEqual(fSyncJSON('[ 1 2 ] :')[0], { '@@Action': [{ $numberDecimal: '1' }, { $numberDecimal: '2' }] });
  t.deepEqual(fSyncJSON('[ a b ] :')[0], { '@@Action': [{ '@@Action': 'a' }, { '@@Action': 'b' }] });
});

test('generate json for other values', t => {  // todo create better json rep
  t.deepEqual(fSyncJSON('null')[0], null);
  t.deepEqual(fSyncJSON('nan')[0], { $numberDecimal: 'NaN' });
  t.deepEqual(fSyncJSON('-0')[0], { $numberDecimal: '-0' });
  t.deepEqual(fSyncJSON('infinity')[0], { $numberDecimal: 'Infinity' });
  t.deepEqual(fSyncJSON('-infinity')[0], { $numberDecimal: '-Infinity' });
  t.deepEqual(fSyncJSON('"1/1/1990" date')[0], { $date: '1990-01-01T07:00:00.000Z' });
  t.deepEqual(fSyncJSON('"/a./i" regexp')[0], { $regex: 'a.', $options: 'i' });
  t.deepEqual(fSyncJSON('#word')[0], { $symbol: 'word' });
});
