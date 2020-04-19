import { ƒ } from './helpers/setup';

test('get-system-property', async () => {
  expect(await ƒ(`'log-level' get-system-property`)).toEqual(`[ 'test' ]`);
  expect(await ƒ(`'decimal-precision' get-system-property`)).toEqual(`[ 20 ]`);

  expect(ƒ(`'unknown-prop' get-system-property`)).rejects.toThrow(
    `Error calling 'get-system-property': "unknown-prop" is not a valid flag`
  );
});

test('set-system-property', async () => {
  expect(await ƒ(`'decimal-precision' 20 set-system-property`)).toEqual(`[ ]`);
  expect(ƒ(`'unknown-prop' true set-system-property`)).rejects.toThrow(
    `Error calling 'set-system-property': "unknown-prop" is not a valid flag`
  );
});
