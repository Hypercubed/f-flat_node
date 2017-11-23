import test from 'ava';

import { Action } from '../dist/types';
import { fSync } from './setup';

test('should convert an arrya to an action', async t => {
  const plus = new Action('+').toJSON();
  const sen = new Action([1, 2, plus]).toJSON();
  t.deepEqual(fSync('[ 1 2 + ] :'), [sen]);
});

test('actions can be converted to strings', async t => {
  t.deepEqual(fSync('[ 1 2 + ] : string'), ['[ 1 2 + ]']);
  t.deepEqual(fSync('[ dup [ floor = ] [ im 0 = ] bi * ] : string'), ['[ dup [ floor = ] [ im 0 = ] bi * ]']);
});