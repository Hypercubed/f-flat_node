import { ƒ } from './helpers/setup';

test('get-system-property', async () => {
  expect(await ƒ(`'log-level' get-system-property`)).toEqual(`[ 'test' ]`);
  expect(await ƒ(`'decimal-precision' get-system-property`)).toEqual(`[ 20 ]`);
  expect(await ƒ(`'auto-undo' get-system-property`)).toEqual(`[ true ]`);

  expect(ƒ(`'unknown-prop' get-system-property`)).rejects.toThrow(
    `'get-system-property' value is not a valid flag: "unknown-prop"`
  );
});

test('set-system-property', async () => {
  expect(await ƒ(`'decimal-precision' 20 set-system-property`)).toEqual(`[ ]`);
  expect(ƒ(`'unknown-prop' true set-system-property`)).rejects.toThrow(`'set-system-property' value is not a valid flag: "unknown-prop"`);
});