import test from 'ava';
import {
  fJSON
} from './setup';

test('symbols type', async t => {
  t.deepEqual(await fJSON('#test type'), ['symbol']);
  t.deepEqual(await fJSON('"test" # type'), ['symbol']);
});

test('symbols equality', async t => {
  t.deepEqual(await fJSON('#test dup ='), [true]);
  t.deepEqual(await fJSON('#test #test ='), [false]);
  t.deepEqual(await fJSON('"test" # dup ='), [true]);
  t.deepEqual(await fJSON('"test" # "test" # ='), [false]);
});