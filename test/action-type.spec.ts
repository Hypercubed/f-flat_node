import test from 'ava';

import { Word, Sentence } from '../src/types';
import { fJSON, D } from './helpers/setup';

test('should convert an array to an action', async t => {
  const plus = new Word('+').toJSON();
  const sen = new Sentence(D([1, 2, plus])).toJSON();
  t.deepEqual(await fJSON('[ 1 2 + ] :'), [sen]);
});

test('actions can be converted to strings', async t => {
  t.deepEqual(await fJSON('[ 1 2 + ] : string'), ['[ 1 2 + ]']);
  t.deepEqual(await fJSON('[ dup [ floor = ] [ im 0 = ] bi * ] : string'), ['[ dup [ floor = ] [ im 0 = ] bi * ]']);
});