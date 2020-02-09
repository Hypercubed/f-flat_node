import { ƒ } from './helpers/setup';

test('symbols type', async () => {
  expect(await ƒ('#test type')).toEqual(`[ 'symbol' ]`);
  expect(await ƒ('"test" # type')).toEqual(`[ 'symbol' ]`);
});

test('symbols equality', async () => {
  expect(await ƒ('#test dup =')).toEqual(`[ true ]`);
  expect(await ƒ('#test #test =')).toEqual(`[ false ]`);
  expect(await ƒ('"test" # dup =')).toEqual(`[ true ]`);
  expect(await ƒ('"test" # "test" # =')).toEqual(`[ false ]`);
});
