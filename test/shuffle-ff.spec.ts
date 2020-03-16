import { ƒ, τ } from './helpers/setup';

test('should slip', async () => {
  expect(await ƒ('[ 1 2 + ] 4 slip')).toEqual(`[ 3 4 ]`);
});
