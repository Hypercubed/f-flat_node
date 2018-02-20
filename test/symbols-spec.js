import test from 'ava';
import {
  fSyncJSON
} from './setup';

test('symbols equality', t => {
  t.deepEqual(fSyncJSON('#test type'), ['symbol']);
  t.deepEqual(fSyncJSON('"test" # type'), ['symbol']);
});

test('symbols equality', t => {
  t.deepEqual(fSyncJSON('#test dup ='), [true]);
  t.deepEqual(fSyncJSON('#test #test ='), [false]);
  t.deepEqual(fSyncJSON('"test" # dup ='), [true]);
  t.deepEqual(fSyncJSON('"test" # "test" # ='), [false]);
});