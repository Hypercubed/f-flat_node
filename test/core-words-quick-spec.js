import test from 'ava';
import { check, gen } from 'ava-check';

import {
  F,
  fSyncJSON,
  fSyncValues,
  fSyncStack,
  D,
  options,
  fflatValue,
  fflatPrim,
  ffString,
  ffNumber,
  Decimal
} from './setup';

test(
  'should drop',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} drop ${c}`;
    t.deepEqual(fSyncJSON(s), [a.toJSON(), c.toJSON()]);
  })
);

test(
  'should q<',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} q< drop ${c}`;
    t.deepEqual(fSyncJSON(s), [c.toJSON(), b.toJSON()]);
  })
);

test(
  'should q>',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} q< drop q> ${c}`;
    t.deepEqual(fSyncJSON(s), [b.toJSON(), c.toJSON()]);
  })
);

test(
  'should stack',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} ${c} stack`;
    const r = fSyncJSON(s);
    t.is(r.length, 1);
    t.deepEqual(r[0], [a.toJSON(), b.toJSON(), c.toJSON()]);
  })
);

test(
  'should get depth',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} ${c} depth`;
    t.deepEqual(fSyncJSON(s), [a.toJSON(), b.toJSON(), c.toJSON(), 3]);
  })
);

test(
  'should nop',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} ${c} nop`;
    t.deepEqual(fSyncJSON(s), [a.toJSON(), b.toJSON(), c.toJSON()]);
  })
);

// eval

// fork

test(
  'should swap',
  check(options, fflatValue, fflatValue, (t, a, b) => {
    const s = `${a} ${b} swap`;
    t.deepEqual(fSyncJSON(s), [b.toJSON(), a.toJSON()]);
  })
);

test(
  'should dup',
  check(options, fflatValue, fflatValue, (t, a, b) => {
    const s = `${a} dup`;
    const f = new F().eval(s);
    t.deepEqual(f.toJSON(), [a.toJSON(), a.toJSON()]);
    t.is(f.stack[0], f.stack[1]);
  })
);

test(
  'should unstack',
  check(options, ffString, ffString, ffString, (t, a, b, c) => {
    // shoudl work with fflatValue
    const s = `[ ${a} ${b} ${c} ] unstack`;
    t.deepEqual(fSyncJSON(s), [a.toJSON(), b.toJSON(), c.toJSON()]);
  })
);

// length
test(
  'should get length of an array',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `( ${a} ${b} ${c} ) length`;
    const r = fSyncJSON(s);
    t.is(r.length, 1);
    t.is(r[0].valueOf(), 3);
  })
);

test(
  'should get "length" of an object',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `{ a: ${a} b: ${b} c: ${c} } length`;
    const r = fSyncJSON(s);
    t.is(r.length, 1);
    t.is(r[0].valueOf(), 3);
  })
);

test(
  'should get length of a string',
  check(options, ffString, (t, a) => {
    const s = `${a} length`;
    const r = fSyncJSON(s);
    t.is(r.length, 1);
    t.is(r[0].valueOf(), a.valueOf().length);
  })
);

test(
  'should get precision of a number',
  check(options, ffNumber, (t, a) => {
    const s = `${a} length`;
    const r = fSyncJSON(s);
    t.is(r.length, 1);
    const v = a.valueOf();
    if (Number.isFinite(v) && !Number.isNaN(v)) {
      t.is(r[0].valueOf(), new Decimal(v).sd());
    }
  })
);

// slice

// indexof

// zip

// (, ), [, ], {, }

// template

// sleep

// get-log-level

// set-log-level
