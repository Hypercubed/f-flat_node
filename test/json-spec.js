import test from 'ava';
import {
  F,
  fSync,
  fSyncJSON,
  fSyncStack,
  fSyncValues,
  Action,
  Decimal,
  D
} from './setup';

// JSON

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

test('generate json for cother values', t => {  // todo create better json rep
  t.deepEqual(fSyncJSON('null')[0], null);
  t.deepEqual(fSyncJSON('nan')[0], null);
  t.deepEqual(fSyncJSON('infinity')[0], null);
  t.deepEqual(fSyncJSON('"1/1/1990" date')[0], '1990-01-01T07:00:00.000Z'); // { "$date": "<date>" }
  // regex { "$regex": "<sRegex>", "$options": "<sOptions>" }
  // undefined? { "$undefined": true }
});
