import { ƒ } from './helpers/setup';

test('should convert an array to an action', async () => {
  expect(await ƒ('[ 1 2 + ] :')).toEqual(`[ [ 1 2 + ] ]`);
});

test('actions can be converted to strings', async () => {
  expect(await ƒ('[ 1 2 + ] : string')).toEqual(`[ '[ 1 2 + ]' ]`);
  expect(await ƒ('[ dup [ floor = ] [ im 0 = ] bi * ] : string')).toEqual(
    `[ '[ dup [ floor = ] [ im 0 = ] bi * ]' ]`
  );
});
