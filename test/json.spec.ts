import { μ, Decimal, Complex, Word, Key, Sentence } from './helpers/setup';
import { stringifyStrict } from '../src/utils/json';

test('prims', () => {
  expect(stringifyStrict(42)).toEqual('42');
  expect(stringifyStrict(-42)).toEqual('-42');
  expect(stringifyStrict('woo!!!')).toEqual('"woo!!!"');
  expect(stringifyStrict(true)).toEqual('true');
  expect(stringifyStrict(null)).toEqual('null');
});

test('special', () => {
  expect(stringifyStrict(-0)).toEqual('{"$numberDecimal":"-0"}');
  expect(stringifyStrict(undefined)).toEqual('{"$undefined":true}');
  expect(stringifyStrict(NaN)).toEqual('{"$numberDecimal":"NaN"}');
  expect(stringifyStrict(Infinity)).toEqual('{"$numberDecimal":"Infinity"}');
  expect(stringifyStrict(-Infinity)).toEqual('{"$numberDecimal":"-Infinity"}');
  expect(stringifyStrict(/regexp/gim)).toEqual(
    '{"$regex":"regexp","$options":"gim"}'
  );
  expect(stringifyStrict(new Date(1e12))).toEqual(
    '{"$date":"2001-09-09T01:46:40.000Z"}'
  );
  expect(stringifyStrict(Symbol('a'))).toEqual('{"$symbol":"a"}');
});

test('nested', () => {
  testStringify('Array', ['a', 'b', 'c'], '["a","b","c"]');
  testStringify('Array (empty)', [], '[]');
  // tslint:disable-next-line: whitespace
  testStringify('Array (sparse)', [, 'b', ,], '[null,"b",null]');
  testStringify(
    'Object',
    { foo: 'bar', 'x-y': 'z' },
    '{"foo":"bar","x-y":"z"}'
  );
  testStringify('Set', new Set([1, 2, 3]), '{"$set":[1,2,3]}');
  testStringify('Map', new Map([['a', 'b']]), '{"$map":[["a","b"]]}');

  function testStringify(name: string, input: any, expected: string) {
    expect(stringifyStrict(input)).toEqual(expected);
  }
});

test('nested - special', () => {
  testStringify(
    'Array',
    ['a', new Date(1e12), 'c'],
    '["a",{"$date":"2001-09-09T01:46:40.000Z"},"c"]'
  );
  testStringify(
    'Object',
    { foo: 'bar', 'x-y': new Date(1e12) },
    '{"foo":"bar","x-y":{"$date":"2001-09-09T01:46:40.000Z"}}'
  );
  testStringify(
    'Set',
    new Set([1, new Date(1e12), 3]),
    '{"$set":[1,{"$date":"2001-09-09T01:46:40.000Z"},3]}'
  );
  testStringify(
    'Map',
    new Map([['a', new Date(1e12)]]),
    '{"$map":[["a",{"$date":"2001-09-09T01:46:40.000Z"}]]}'
  );

  function testStringify(name: string, input: any, expected: string) {
    expect(stringifyStrict(input)).toEqual(expected);
  }
});

test('fflat', () => {
  expect(stringifyStrict(new Decimal(42))).toEqual('{"$numberDecimal":"42"}');
  expect(stringifyStrict(new Complex(42, 3))).toEqual(
    '{"@@Complex":{"re":"42","im":"3"}}'
  );
  expect(stringifyStrict(new Word('word'))).toEqual('{"@@Word":"word"}');
  expect(stringifyStrict(new Key('word'))).toEqual('{"@@Key":"word"}');
  expect(stringifyStrict(new Sentence(['word']))).toEqual('{"@@Sentence":["word"]}');
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

test('deep', async () => {
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

  expect(stringifyStrict(obj)).toMatchSnapshot();

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

test('generate json for strings', async () => {
  expect((await μ('"hello"'))[0]).toEqual('hello');
  expect((await μ('["hello" "world"]'))[0]).toEqual(['hello', 'world']);
  expect((await μ('{ x: ["hello" "world"] }'))[0]).toEqual({
    x: ['hello', 'world']
  });
});

test('generate json for decimals', async () => {
  expect((await μ('1'))[0]).toEqual({ $numberDecimal: '1' });
  expect((await μ('[1 2]'))[0]).toEqual([
    { $numberDecimal: '1' },
    { $numberDecimal: '2' }
  ]);
  expect((await μ('{ x: [1 2] }'))[0]).toEqual({
    x: [{ $numberDecimal: '1' }, { $numberDecimal: '2' }]
  });
});

test('generate json for complex values', async () => {
  expect((await μ('{ x: [1 2], y: i }'))[0]).toEqual({
    x: [{ $numberDecimal: '1' }, { $numberDecimal: '2' }],
    y: { '@@Complex': { re: '0', im: '1' } }
  });
});

test('generate json for other values', async () => {
  // todo create better json rep
  expect((await μ('null'))[0]).toEqual(null);
  expect((await μ('nan'))[0]).toEqual({ $numberDecimal: 'NaN' });
  expect((await μ('-0'))[0]).toEqual({ $numberDecimal: '-0' });
  expect((await μ('infinity'))[0]).toEqual({ $numberDecimal: 'Infinity' });
  expect((await μ('-infinity'))[0]).toEqual({
    $numberDecimal: '-Infinity'
  });
  expect((await μ('"1/1/1990" date'))[0]).toEqual({
    $date: '1990-01-01T07:00:00.000Z'
  });
  expect((await μ('"/a./i" regexp'))[0]).toEqual({
    $regex: 'a.',
    $options: 'i'
  });
});
