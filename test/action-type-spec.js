import test from 'ava';

import { Word, Sentence } from '../dist/types';
import { fSyncJSON, D } from './setup';

test('should convert an arrya to an action', async t => {
  const plus = new Word('+').toJSON();
  const sen = new Sentence(D([1, 2, plus])).toJSON();
  t.deepEqual(fSyncJSON('[ 1 2 + ] :'), [sen]);
});

test('actions can be converted to strings', async t => {
  t.deepEqual(fSyncJSON('[ 1 2 + ] : string'), ['[ 1 2 + ]']);
  t.deepEqual(fSyncJSON('[ dup [ floor = ] [ im 0 = ] bi * ] : string'), ['[ dup [ floor = ] [ im 0 = ] bi * ]']);
});