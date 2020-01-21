import { fJSON } from './helpers/setup';

test('symbols type', async () => {
  expect(await fJSON('#test type')).toEqual(['symbol']);
  expect(await fJSON('"test" # type')).toEqual(['symbol']);
});

test('symbols equality', async () => {
  expect(await fJSON('#test dup =')).toEqual([true]);
  expect(await fJSON('#test #test =')).toEqual([false]);
  expect(await fJSON('"test" # dup =')).toEqual([true]);
  expect(await fJSON('"test" # "test" # =')).toEqual([false]);
});
