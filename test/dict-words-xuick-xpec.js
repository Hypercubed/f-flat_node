import test from 'ava';
import { check, gen } from 'ava-check';

import {
  F,
  fSyncJSON,
  fSyncValues,
  options,
  fflatValue,
  fflatPrim,
  ffString,
  ffNumber,
  ffBoolean
} from './setup';

test(
  'should sto value',
  check(options, ffString, gen.oneOf([ffString, ffNumber, ffBoolean]), (t, a, b) => {
    const s = `${a} ${b} sto`;
    const r = fSyncJSON(s);
    t.is(r.length, 0);
  })
);

test(
  'should sto and rcl value',
  check(options, ffString, gen.oneOf([ffString, ffNumber, ffBoolean]), (t, b, a) => {
    const s = `${a} ${b} sto ${b} rcl`;
    const r = fSyncValues(s);
    t.is(r.length, 1);
    t.is(r[0], a.valueOf());
  })
);

// delete

// define

// expand

// see

// words

// locals
