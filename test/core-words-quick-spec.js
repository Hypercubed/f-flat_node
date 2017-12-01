import test from 'ava';
import { check, gen } from 'ava-check';

import {
  F,
  fSyncJSON,
  options,
  fflatValue,
  fflatPrim,
  ffString
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
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} ${b} swap`;
    t.deepEqual(fSyncJSON(s), [b.toJSON(), a.toJSON()]);
  })
);

test(
  'should dup',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `${a} dup`;
    t.deepEqual(fSyncJSON(s), [a.toJSON(), a.toJSON()]);
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

test(
  'should get length of an array',
  check(options, fflatValue, fflatValue, fflatValue, (t, a, b, c) => {
    const s = `( ${a} ${b} ${c} ) length`;
    const r = fSyncJSON(s);
    t.is(r.length, 1);
    t.is(r[0].valueOf(), 3);
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
