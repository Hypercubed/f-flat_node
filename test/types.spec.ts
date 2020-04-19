import { ƒ } from './helpers/setup';

test('type', async () => {
  expect(await ƒ('"abc" type')).toEqual(`[ 'string' ]`);
  expect(await ƒ('123 type')).toEqual(`[ 'number' ]`);
});

test('number', async () => {
  expect(await ƒ('123 number')).toEqual(`[ 123 ]`);
  expect(await ƒ('"123" number')).toEqual(`[ 123 ]`);
  expect(ƒ('"abc" number')).rejects.toThrow(
    `Error calling 'number': [DecimalError] Invalid argument: abc`
  ); // nan?
});

test('string', async () => {
  expect(await ƒ(`123 string`)).toEqual(`[ '123' ]`);
  expect(await ƒ(`'123' string`)).toEqual(`[ '123' ]`);
});

test('itoa', async () => {
  expect(await ƒ(`65 itoa`)).toEqual(`[ 'A' ]`);
});

test('atoi', async () => {
  expect(await ƒ(`'A' atoi`)).toEqual(`[ 65 ]`);
});

test('atob', async () => {
  expect(await ƒ(`'SGVsbG8=' atob`)).toEqual(`[ 'Hello' ]`);
});

test('btoa', async () => {
  expect(await ƒ(`'Hello' btoa`)).toEqual(`[ 'SGVsbG8=' ]`);
});

test('hash', async () => {
  expect(await ƒ(`'Hello' hash`)).toEqual(`[ 69609650 ]`);
});

test('hex-hash', async () => {
  expect(await ƒ(`'Hello' hex-hash`)).toEqual(`[ '42628b2' ]`);
});

describe('base', () => {
  test('base, pos integers', async () => {
    expect(await ƒ('5 16 base')).toEqual(`[ '0x5' ]`);
    expect(await ƒ('5 2 base')).toEqual(`[ '0b101' ]`);

    expect(await ƒ('3735928559 16 base')).toEqual(`[ '0xDEADBEEF' ]`);
    expect(await ƒ('3735928559 2 base')).toEqual(
      `[ '0b11011110101011011011111011101111' ]`
    );

    expect(await ƒ('18446744073709551615 16 base')).toEqual(
      `[ '0xFFFFFFFFFFFFFFFF' ]`
    );
    expect(await ƒ('18446744073709551615 10 base')).toEqual(
      `[ '18446744073709551615' ]`
    );
    expect(await ƒ('18446744073709551615 8 base')).toEqual(
      `[ '0o1777777777777777777777' ]`
    );
    expect(await ƒ('18446744073709551615 4 base')).toEqual(
      `[ '33333333333333333333333333333333' ]`
    );
    expect(await ƒ('18446744073709551615 2 base')).toEqual(
      `[ '0b1111111111111111111111111111111111111111111111111111111111111111' ]`
    );
  });

  test('base, neg integers', async () => {
    expect(await ƒ('-3735928559 16 base')).toEqual(`[ '-0xDEADBEEF' ]`);
    expect(await ƒ('-18446744073709551615 16 base')).toEqual(
      `[ '-0xFFFFFFFFFFFFFFFF' ]`
    );
    expect(await ƒ('-18446744073709551615 10 base')).toEqual(
      `[ '-18446744073709551615' ]`
    );
    expect(await ƒ('-18446744073709551615 8 base')).toEqual(
      `[ '-0o1777777777777777777777' ]`
    );
    expect(await ƒ('-18446744073709551615 2 base')).toEqual(
      `[ '-0b1111111111111111111111111111111111111111111111111111111111111111' ]`
    );
  });

  test('base, pos floats', async () => {
    expect(await ƒ('0.125 16 base')).toEqual(`[ '0x0.2' ]`);
    expect(await ƒ('0.125 10 base')).toEqual(`[ '0.125' ]`);
    expect(await ƒ('0.125 8 base')).toEqual(`[ '0o0.1' ]`);
    // t.deepEqual(await ƒ('0.125 4 base'), `[ '0.02' ]`);
    expect(await ƒ('0.125 2 base')).toEqual(`[ '0b0.001' ]`);

    // t.deepEqual(await fJSON('123456789.87654321 2 base'), ['0b111010110111100110100010101.1110000001100101001000101100010001111011']);
  });

  test('base, neg floats', async () => {
    expect(await ƒ('-0.125 16 base')).toEqual(`[ '-0x0.2' ]`);
    expect(await ƒ('-0.125 10 base')).toEqual(`[ '-0.125' ]`);
    expect(await ƒ('-0.125 8 base')).toEqual(`[ '-0o0.1' ]`);
    expect(await ƒ('-0.125 2 base')).toEqual(`[ '-0b0.001' ]`);
  });

  test('base with inf and nan', async () => {
    expect(await ƒ('nan 16 base')).toEqual(`[ 'NaN' ]`);
    expect(await ƒ('Infinity 16 base')).toEqual(`[ 'Infinity' ]`);
    expect(await ƒ('-Infinity 16 base')).toEqual(`[ '-Infinity' ]`);
  });
});

test('boolean', async () => {
  expect(await ƒ(`123 boolean`)).toEqual(`[ true ]`);
  expect(await ƒ(`0 boolean`)).toEqual(`[ false ]`);
  expect(await ƒ(`'123' boolean`)).toEqual(`[ true ]`);
  expect(await ƒ(`'' boolean`)).toEqual(`[ false ]`);
});

test(':', async () => {
  expect(await ƒ(`'eval' :`)).toEqual(`[ eval: ]`);
  expect(await ƒ(`eval: :`)).toEqual(`[ eval: ]`);
});

test('of', async () => {
  expect(await ƒ('"abc" 123 of')).toEqual(`[ '123' ]`);
  expect(await ƒ('123 "456" of')).toEqual(`[ 456 ]`);
});

test('is?', async () => {
  expect(await ƒ('"abc" "abc" is?')).toEqual(`[ true ]`);
  expect(await ƒ('["abc"] ["abc"] is?')).toEqual(`[ false ]`);
  expect(await ƒ('["abc"] dup is?')).toEqual(`[ true ]`);
});

test('nothing?', async () => {
  expect(await ƒ('"abc" nothing?')).toEqual(`[ false ]`);
  expect(await ƒ('null nothing?')).toEqual(`[ true ]`);
});
