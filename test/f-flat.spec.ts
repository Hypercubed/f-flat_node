import { F, Decimal, ƒ, τ } from './helpers/setup';

test('setup', async () => {
  expect(F().eval).toBeDefined();
  expect(F().promise).toBeDefined();
  expect(F().depth).toBeDefined();
  expect(await ƒ('')).toEqual(`[ ]`);
  expect(await ƒ('1 2 3')).toEqual(`[ 1 2 3 ]`);
});

test('should be chainable', async () => {
  const f = F('1').eval('2 3');
  expect(f.stack).toEqual([1, 2, 3].map(x => new Decimal(x)));
  f.eval('4 +');
  expect(f.stack).toEqual([1, 2, 7].map(x => new Decimal(x)));
});

test('should push numeric values', async () => {
  expect(await ƒ('1 2 -3 +5')).toEqual(τ([1, 2, -3, 5]));
  expect(await ƒ('1.1 2.2 -3.14, +2.17')).toEqual(τ([1.1, 2.2, -3.14, 2.17]));
  expect(await ƒ('1.1e-1 2.2e+2 -3.14e-1')).toEqual(τ([0.11, 220, -0.314]));
  expect(await ƒ('10_000 1_00')).toEqual(τ([10000, 100]));
  expect(await ƒ('9007199254740993')).toEqual(`[ 9007199254740993 ]`);
  expect(await ƒ('-9007199254740993')).toEqual(`[ -9007199254740993 ]`);
  expect(await ƒ('1.7976931348623159077e+308')).toEqual(
    `[ 1.7976931348623159077e+308 ]`
  );
});

test('should push hexidecimal numeric values', async () => {
  expect(await ƒ('0x5 0x55 0xff')).toEqual(τ([5, 85, 255]));
  expect(await ƒ('0x5.5 0xff.ff')).toEqual(
    τ([85 * Math.pow(16, -1), 65535 * Math.pow(16, -2)])
  );
  expect(await ƒ('0x1p+1 0xffp-2')).toEqual(τ([2, 255 * Math.pow(2, -2)]));
});

test('should push binary numeric values', async () => {
  expect(await ƒ('0b1 0b10 0b11')).toEqual(τ([1, 2, 3]));
  expect(await ƒ('0b1.1 0b11.11')).toEqual(
    τ([3 * Math.pow(2, -1), 15 * Math.pow(2, -2)])
  );
  expect(await ƒ('0b1p+1 0b11p-2')).toEqual(τ([2, 3 * Math.pow(2, -2)]));
});

test('empty', async () => {
  // base
  expect(await ƒ('"abc" empty')).toEqual(`[ '' ]`);
  expect(await ƒ('123 empty')).toEqual(`[ 0 ]`);
});

describe('errors on unknown command', () => {
  test('sync', () => {
    expect(() => {
      F().eval('abc');
    }).toThrow('Word is not defined: "abc"');
  });

  test('async', () => {
    expect(ƒ(`abc`)).rejects.toThrow('Word is not defined: "abc"');
  });

  test('in child', () => {
    expect(ƒ(`[ abc ] in`)).rejects.toThrow('Word is not defined: "abc"');
  });
});

describe('errors on async command in eval', () => {
  test('eval', async () => {
    expect(() => {
      F().eval('[ 1 2 + ] await');
    }).toThrow('Do Not Release Zalgo');
  });

  test('in', async () => {
    expect(() => {
      F().eval('[ 100 sleep ] in');
    }).toThrow('Do Not Release Zalgo');
  });
});

test('can spawn a future', async () => {
  expect(await ƒ('[ 1 2 + 100 sleep ] spawn 3 4 +')).toEqual(
    `[ [Future:pending [1,2,+,100,sleep]] 7 ]`
  );
});

test('keys', async () => {
  expect(await ƒ('eval:')).toEqual(`[ eval: ]`);
  expect(await ƒ('eval: :')).toEqual(`[ eval: ]`);
});

test('=', async () => {
  // base
  expect(await ƒ('1 1 =')).toEqual(`[ true ]`);
  expect(await ƒ('1 i * 1 i * =')).toEqual(`[ true ]`);
  expect(await ƒ('null null =')).toEqual(`[ true ]`);
  expect(await ƒ('nan nan =')).toEqual(`[ true ]`); // todo: This is open the array
  expect(await ƒ('{} {} =')).toEqual(`[ true ]`);
  expect(await ƒ('{ x: 1 } { x: 1 } =')).toEqual(`[ true ]`);
  expect(await ƒ('"1/1/1990" date "1/1/1990" date =')).toEqual(`[ true ]`);
});

// immutable tests

test('immutable array actions', async () => {
  expect(await ƒ('[ 1 ] dup 2 <<')).toEqual(`[ [ 1 ] [ 1 2 ] ]`);
  expect(await ƒ('[ 1 ] dup 2 swap >>')).toEqual(`[ [ 1 ] [ 2 1 ] ]`);
  expect(await ƒ('[ 1 ] dup [ 2 ] +')).toEqual(`[ [ 1 ] [ 1 2 ] ]`);
});

test('immutable object actions', async () => {
  const first = 'Manfred';
  const last = 'Von Thun';
  expect(await ƒ('{ first: "Manfred" } dup { last: "Von Thun" } +')).toEqual(
    τ([{ first }, { first, last }])
  );
  expect(await ƒ('{ first: "Manfred" } dup { last: "Von Thun" } <<')).toEqual(
    τ([{ first }, { first, last }])
  );
  expect(await ƒ('{ first: "Manfred" } dup { last: "Von Thun" } >>')).toEqual(
    τ([{ first }, { last, first }])
  );
});

test('immutable sto', async () => {
  const first = 'Manfred';
  const last = 'Von Thun';
  expect(
    await ƒ(`
  name: { } ;
  name
  name { first: "Manfred" } <<
  name { last: "Von Thun" } <<
  name
`)
  ).toEqual(τ([{}, { first }, { last }, {}]));
});

test('atoms are not executed by stack actions', async () => {
  expect(await ƒ('a: dup')).toEqual(`[ a: a: ]`);
  expect(await ƒ('true a: b: choose')).toEqual(`[ a: ]`);
  expect(await ƒ('false a: b: choose')).toEqual(`[ b: ]`);
  expect(await ƒ('a: b: q< drop q>')).toEqual(`[ b: ]`);
  expect(await ƒ('[a: b:] 1 @')).toEqual(`[ b: ]`); // fix this?
  expect(await ƒ('[a: b:] unstack')).toEqual(`[ a: b: ]`); // fix this?
});

test('can perform actions from module', async () => {
  expect(await ƒ(`core: 'math.ff' import ; 5 core.pred`)).toEqual(`[ 5 4 ]`);
  expect(await ƒ(`math: 'math.ff' import ; 12 math.!`)).toEqual(
    `[ 479001600 ]`
  );
});

test('postfix "macros"', async () => {
  expect(await ƒ('5 :pred')).toEqual(`[ 5 4 ]`);
  expect(await ƒ('12 :!')).toEqual(`[ 479001600 ]`);
  expect(await ƒ('1000 10 :logn')).toEqual(`[ 3 ]`);
  expect(await ƒ('"a" 5 :dupn')).toEqual(`[ 'a' 'a' 'a' 'a' 'a' 'a' ]`);
});

test('prefix "macros"', async () => {
  expect(await ƒ('pred: (5) sap')).toEqual(`[ 5 4 ]`);
  expect(await ƒ('!: (12) sap')).toEqual(`[ 479001600 ]`);
  expect(await ƒ('+: (5,4) sap')).toEqual(`[ 9 ]`);
  expect(await ƒ('+: (pred: (5) sap) sap')).toEqual(`[ 9 ]`);
  expect(await ƒ('+: (*: (5, 6) sap, *: (5,2) sap) sap')).toEqual(`[ 40 ]`);
  expect(await ƒ('logn: (1000, 10) sap')).toEqual(`[ 3 ]`);
  expect(await ƒ('!: (2 6 *) sap')).toEqual(`[ 479001600 ]`);
  expect(await ƒ('regexp: ("/a./") sap')).toEqual(`[ /a./ ]`);
  expect(await ƒ('[i *] (10) sap')).toEqual(`[ 0+10i ]`);
});

test('length', async () => {
  // base
  expect(await ƒ('null ln')).toEqual(`[ 0 ]`);
});

test('hex, bin', async () => {
  // types-ff
  expect(await ƒ('18446744073709551615 hex')).toEqual(
    `[ '0xFFFFFFFFFFFFFFFF' ]`
  );
  expect(await ƒ('18446744073709551615 bin')).toEqual(
    `[ '0b1111111111111111111111111111111111111111111111111111111111111111' ]`
  );
  expect(await ƒ('18446744073709551615 oct')).toEqual(
    `[ '0o1777777777777777777777' ]`
  );

  expect(await ƒ('0.125 hex')).toEqual(`[ '0x0.2' ]`);

  expect(await ƒ('-18446744073709551615 hex')).toEqual(
    `[ '-0xFFFFFFFFFFFFFFFF' ]`
  );
  expect(await ƒ('-18446744073709551615 bin')).toEqual(
    `[ '-0b1111111111111111111111111111111111111111111111111111111111111111' ]`
  );
  expect(await ƒ('-0.125 hex')).toEqual(`[ '-0x0.2' ]`);
});

/* test('should <=> with nan, null', async t => {  // todo: better comparisons with NaN
  t.deepEqual(await fValues('nan nan <=>'), [0]);
  t.deepEqual(await fValues('null null <=>'), [0]);

  t.deepEqual(await fValues('null nan <=>'), [NaN]);
  t.deepEqual(await fValues('nan null <=>'), [NaN]);

  t.deepEqual(await fValues('null -Infinity <=>'), [-1]);
  t.deepEqual(await fValues('-Infinity null <=>'), [1]);
}); */

test('should div rem', async () => {
  // math.ff
  expect(await ƒ('5 2 divrem')).toEqual(`[ 2 1 ]`);
});

test('integer number formats', async () => {
  expect(await ƒ('5')).toEqual(`[ 5 ]`);
  expect(await ƒ('+5')).toEqual(`[ 5 ]`);
});

test('decimal number formats', async () => {
  expect(await ƒ('0.5')).toEqual(`[ 0.5 ]`);
  expect(await ƒ('.5')).toEqual(`[ 0.5 ]`);
  expect(await ƒ('+.5e1')).toEqual(`[ 5 ]`);
  expect(await ƒ('+5e0')).toEqual(`[ 5 ]`);
  expect(await ƒ('+5e+0')).toEqual(`[ 5 ]`);
  expect(await ƒ('+5e-0')).toEqual(`[ 5 ]`);
  expect(await ƒ('+5e-9')).toEqual(`[ 5e-9 ]`);
  expect(await ƒ('+5e+9')).toEqual(`[ 5000000000 ]`);
  expect(await ƒ('+5e+10')).toEqual(`[ 50000000000 ]`);
});

test('integer precent formats', async () => {
  expect(await ƒ('5%')).toEqual(`[ 0.05 ]`);
  expect(await ƒ('+5%')).toEqual(`[ 0.05 ]`);
  expect(await ƒ('-5%')).toEqual(`[ -0.05 ]`);
});

test('hexadecimal integer formats', async () => {
  expect(await ƒ('0xDEAD')).toEqual(τ([0xdead]));
  expect(await ƒ('-0xBEEF')).toEqual(τ([-0xbeef]));
});

test('hexadecimal float formats', async () => {
  // expect(await ƒ('0xDEAD.BEEF')).toEqual(τ([0xdeadbeef / 2 ** 16]));  // rouding issue
  // expect(await ƒ('-0xDEAD.BEEF')).toEqual(τ([-0xdeadbeef / 2 ** 16]));  // rouding issue
  expect(await ƒ('0x1.1p5')).toEqual(`[ 34 ]`);
});

test('underscore seperators', async () => {
  expect(await ƒ('5_000')).toEqual(`[ 5000 ]`);
  expect(await ƒ('5_000_000')).toEqual(`[ 5000000 ]`);
  expect(await ƒ('+5_000e+6')).toEqual(`[ 5000000000 ]`);
  expect(await ƒ('+5_000_000e+3')).toEqual(`[ 5000000000 ]`);
  expect(await ƒ('+5_000.000_000e+1_0')).toEqual(`[ 50000000000000 ]`);
  expect(await ƒ('-5_000.000_000e-1_0')).toEqual(`[ -5e-7 ]`);
});

test('underscore seperators hexadecimal integer formats', async () => {
  expect(await ƒ('0xDE_AD')).toEqual(τ([0xdead]));
  expect(await ƒ('-0xBE_EF')).toEqual(τ([-0xbeef]));
  expect(await ƒ('0xDE_AD_BE_EF')).toEqual(τ([0xdeadbeef]));
});

test('should resolve', async () => {
  // node
  expect(await ƒ('"core" resolve')).toMatch(/^\[ 'file:.*core' \]$/);
  expect(await ƒ('"core.ff" resolve')).toMatch(/^\[ 'file:.*core.ff' \]$/);
  expect(await ƒ('"/home/core.ff" resolve')).toMatch(
    /^\[ 'file:\/\/\/.*home\/core.ff' \]$/
  );
  expect(await ƒ('"file:///home/core.ff" resolve')).toMatch(
    /^\[ 'file:\/\/\/.*home\/core.ff' \]$/
  );
  expect(await ƒ('"http://www.home.com/core.ff" resolve')).toEqual(
    `[ 'http://home.com/core.ff' ]`
  );
});

test('keywords are case insenstivive', async () => {
  expect(await ƒ('null NULL')).toEqual(`[ null null ]`);
  expect(await ƒ('nan NAN NaN nAn')).toEqual(`[ NaN NaN NaN NaN ]`); // todo: shoulf be nan
  expect(await ƒ('i I')).toEqual('[ 0+1i 0+1i ]');
  expect(await ƒ('true TRUE tRue')).toEqual(`[ true true true ]`);
  expect(await ƒ('false FALSE fAlsE')).toEqual(`[ false false false ]`);
});

test('type errors', async () => {
  expect(ƒ('4 "d" *')).rejects.toThrow(`'*' Unexpected type of arguments`);
});

test('stack underflow', async () => {
  expect(ƒ('4 *')).rejects.toThrow(
    `'*' stack underflow. Too few values in the stack. Requires 2 values, 1 found.`
  );
  expect(ƒ('4 slip')).rejects.toThrow(
    `'<<' stack underflow. Too few values in the stack. Requires 2 values, 1 found.`
  );
});

test('lambdas', async () => {
  // lambdas-ff
  expect(
    await ƒ('l: [ [ a: b: c: ] => [ .b .c .c .a ] lambda ] ; 1 2 3 l')
  ).toEqual(`[ 2 3 3 1 ]`);
  expect(
    await ƒ('d: [ [ a: b: ] => [ .a .b - abs .a / ] lambda ] ; 10 5 d')
  ).toEqual(`[ 0.5 ]`);
});

describe('unicode words', () => {
  test('character with ASCII code \\yyy octa', async () => {
    expect(await ƒ('[ \\251 ]')).toEqual(`[ [ © ] ]`);
    expect(await ƒ('\\251:')).toEqual(`[ ©: ]`);
    expect(ƒ('\\251')).rejects.toThrow(`Word is not defined: "©"`);
    expect(await ƒ('\\251: [ 1 2 + ] ; \\251')).toEqual(`[ 3 ]`);
  });

  test('character with ASCII code \\xhh hexadecimal', async () => {
    expect(await ƒ('[ \\x62 ]')).toEqual(`[ [ b ] ]`);
    expect(await ƒ('\\x62:')).toEqual(`[ b: ]`);
    expect(ƒ('\\x62')).rejects.toThrow(`Word is not defined: "b"`);
    expect(await ƒ('\\x62: [ 1 2 + ] ; \\x62')).toEqual(`[ 3 ]`);
  });

  test('character with code \\uhhhh hexadecimal', async () => {
    expect(await ƒ('[ \\u266D ]')).toEqual(`[ [ ♭ ] ]`);
    expect(await ƒ('\\u266D:')).toEqual(`[ ♭: ]`);
    expect(ƒ('\\u266D')).rejects.toThrow(`Word is not defined: "♭"`);
    expect(await ƒ('\\u266D: [ 1 2 + ] ; \\u266D')).toEqual(`[ 3 ]`);
  });

  test('character with code \\u{h} hexadecimal', async () => {
    expect(await ƒ('[ \\u{266D} ]')).toEqual(`[ [ ♭ ] ]`);
    expect(await ƒ('\\u{266D}:')).toEqual(`[ ♭: ]`);
    expect(ƒ('\\u{266D}')).rejects.toThrow(`Word is not defined: "♭"`);
    expect(await ƒ('\\u{266D}: [ 1 2 + ] ; \\u266D')).toEqual(`[ 3 ]`);
  });

  test('character with code \\Uhhhhhhhh hexadecimal', async () => {
    expect(await ƒ('[ \\U0001F4A9 ]')).toEqual(`[ [ 💩 ] ]`);
    expect(await ƒ('\\U0001F4A9:')).toEqual(`[ 💩: ]`);
    expect(ƒ('\\U0001F4A9')).rejects.toThrow(`Word is not defined: "💩"`);
    expect(await ƒ('\\U0001F4A9: [ 1 2 + ] ; \\U0001F4A9')).toEqual(`[ 3 ]`);
  });

  // todo
  // test('character with given Unicode name', async () => {
  //   expect(await ƒ('[ \\u[flat] ]')).toEqual(`[ [ ♭ ] ]`);
  //   expect(await ƒ('\\u[flat]:')).toEqual(`[ ♭: ]`);
  //   expect(ƒ('\\u[flat]')).rejects.toThrow(`Word is not defined: "♭"`);
  //   expect(await ƒ('\\u[flat]: [ 1 2 + ] ; \\u[flat]')).toEqual(`[ 3 ]`);
  // });
});
