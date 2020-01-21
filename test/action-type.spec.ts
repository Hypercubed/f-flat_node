import { Word, Sentence } from '../src/types';
import { fJSON, D } from './helpers/setup';

test('should convert an array to an action', async () => {
  const plus = new Word('+').toJSON();
  const sen = new Sentence(D([1, 2, plus])).toJSON();
  expect(await fJSON('[ 1 2 + ] :')).toEqual([sen]);
});

test('actions can be converted to strings', async () => {
  expect(await fJSON('[ 1 2 + ] : string')).toEqual(['[ 1 2 + ]']);
  expect(await fJSON('[ dup [ floor = ] [ im 0 = ] bi * ] : string')).toEqual([
    '[ dup [ floor = ] [ im 0 = ] bi * ]'
  ]);
});
