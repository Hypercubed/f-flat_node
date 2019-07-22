import test from 'ava';
import {
  fJSON,
  fValue,
  Decimal,
  Complex,
  Word
} from './setup';
import { stringifyStrict } from '../src/utils/json';

test('prims', t => {
  t.deepEqual(stringifyStrict(42), '42', 'number');
  t.deepEqual(stringifyStrict(-42), '-42', 'negative number');
  t.deepEqual(stringifyStrict('woo!!!'), '"woo!!!"', 'string');
  t.deepEqual(stringifyStrict(true), 'true', 'boolean');
  t.deepEqual(stringifyStrict(null), 'null', 'null');
});

test('special', t => {
  t.deepEqual(stringifyStrict(-0), '{"$numberDecimal":"-0"}', 'negative zero');
  t.deepEqual(stringifyStrict(undefined), '{"$undefined":true}', 'undefined');
  t.deepEqual(stringifyStrict(NaN), '{"$numberDecimal":"NaN"}', 'NaN');
  t.deepEqual(stringifyStrict(Infinity), '{"$numberDecimal":"Infinity"}', 'Infinity');
  t.deepEqual(stringifyStrict(-Infinity), '{"$numberDecimal":"-Infinity"}', 'Infinity');
  t.deepEqual(stringifyStrict(/regexp/img), '{"$regex":"regexp","$options":"gim"}', 'RegExp');
  t.deepEqual(stringifyStrict(new Date(1e12)), '{"$date":"2001-09-09T01:46:40.000Z"}', 'Date');
  t.deepEqual(stringifyStrict(Symbol('a')), '{"$symbol":"a"}', 'Symbol');
});

test('nested', t => {
  testStringify('Array', ['a', 'b', 'c'], '["a","b","c"]');
  testStringify('Array (empty)', [], '[]');
  testStringify('Array (sparse)', [, 'b', , ], '[null,"b",null]');
  testStringify('Object', {foo: 'bar', 'x-y': 'z'}, '{"foo":"bar","x-y":"z"}');
  testStringify('Set', new Set([1, 2, 3]), '{"$set":[1,2,3]}');
  testStringify('Map', new Map([['a', 'b']]), '{"$map":[["a","b"]]}');

  function testStringify(name: string, input: any, expected: string) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

test('nested - special', t => {
  testStringify('Array', ['a', new Date(1e12), 'c'], '["a",{"$date":"2001-09-09T01:46:40.000Z"},"c"]');
  testStringify('Object', {foo: 'bar', 'x-y': new Date(1e12)}, '{"foo":"bar","x-y":{"$date":"2001-09-09T01:46:40.000Z"}}');
  testStringify('Set', new Set([1, new Date(1e12), 3]), '{"$set":[1,{"$date":"2001-09-09T01:46:40.000Z"},3]}');
  testStringify('Map', new Map([['a', new Date(1e12)]]), '{"$map":[["a",{"$date":"2001-09-09T01:46:40.000Z"}]]}');

  function testStringify(name: string, input: any, expected: string) {
    t.deepEqual(stringifyStrict(input), expected, name);
  }
});

test('fflat', t => {
  t.deepEqual(stringifyStrict(new Decimal(42)), '{"$numberDecimal":"42"}', 'decimal');
  t.deepEqual(stringifyStrict(new Complex(42, 3)), '{"@@Complex":{"re":"42","im":"3"}}', 'complex');
  t.deepEqual(stringifyStrict(new Word('word')), '{"@@Action":"word"}', 'word');
});

/* test('cycles', async t => {
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

test('deep', async t => {
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

/* test('references', async t => {
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

test('generate json for strings', async t => {
  t.deepEqual((await fJSON('"hello"'))[0], 'hello');
  t.deepEqual((await fJSON('["hello" "world"]'))[0], ['hello', 'world']);
  t.deepEqual((await fJSON('{ x: ["hello" "world"] }'))[0], {
    x: ['hello', 'world']
  });
});

test('generate json for decimals', async t => {
  t.deepEqual((await fJSON('1'))[0], { $numberDecimal: '1' });
  t.deepEqual((await fJSON('[1 2]'))[0], [
    { $numberDecimal: '1' },
    { $numberDecimal: '2' }
  ]);
  t.deepEqual((await fJSON('{ x: [1 2] }'))[0], {
    x: [{ $numberDecimal: '1' }, { $numberDecimal: '2' }]
  });
});

test('generate json for complex values', async t => {
  t.deepEqual((await fJSON('{ x: [1 2], y: i }'))[0], {
    x: [{ $numberDecimal: '1' }, { $numberDecimal: '2' }],
    y: { '@@Complex': { re: '0', im: '1' } }
  });
});

test('generate json for actions', async t => {
  t.deepEqual((await fJSON('"word" :'))[0], { '@@Action': 'word' });
  t.deepEqual((await fJSON('[ "a" "b" ] :'))[0], { '@@Action': ['a', 'b'] });
  t.deepEqual((await fJSON('[ 1 2 ] :'))[0], { '@@Action': [{ $numberDecimal: '1' }, { $numberDecimal: '2' }] });
  t.deepEqual((await fJSON('[ a b ] :'))[0], { '@@Action': [{ '@@Action': 'a' }, { '@@Action': 'b' }] });
});

test('generate json for other values', async t => {  // todo create better json rep
  t.deepEqual((await fJSON('null'))[0], null);
  t.deepEqual((await fJSON('nan'))[0], { $numberDecimal: 'NaN' });
  t.deepEqual((await fJSON('-0'))[0], { $numberDecimal: '-0' });
  t.deepEqual((await fJSON('infinity'))[0], { $numberDecimal: 'Infinity' });
  t.deepEqual((await fJSON('-infinity'))[0], { $numberDecimal: '-Infinity' });
  t.deepEqual((await fJSON('"1/1/1990" date'))[0], { $date: '1990-01-01T07:00:00.000Z' });
  t.deepEqual((await fJSON('"/a./i" regexp'))[0], { $regex: 'a.', $options: 'i' });
  t.deepEqual((await fJSON('#word'))[0], { $symbol: 'word' });
});
