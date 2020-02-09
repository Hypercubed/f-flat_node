import { F, Decimal, ƒ, τ } from './helpers/setup';

test('setup', async () => {
  expect(F().eval).toBeDefined();
  expect(F().promise).toBeDefined();
  expect(F().depth).toBeDefined();
  expect(await ƒ('')).toEqual(`[ ]`);
  expect(await ƒ('1 2 3')).toEqual(`[ 1 2 3 ]`);
});

test('get-system-property', async () => {
  expect(await ƒ(`'log-level' get-system-property`)).toEqual(`[ 'test' ]`);
  expect(await ƒ(`'decimal-precision' get-system-property`)).toEqual(`[ 20 ]`);
  expect(await ƒ(`'auto-undo' get-system-property`)).toEqual(`[ true ]`);

  expect(ƒ(`'unknown-prop' get-system-property`)).rejects.toThrow(
    'Invalid flag: unknown-prop'
  );
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

test('should drop swap slip', async () => {
  expect(await ƒ('1 2 drop 3')).toEqual(τ([1, 3]));
  expect(await ƒ('1 2 swap 3')).toEqual(τ([2, 1, 3]));
  expect(await ƒ('[ 1 2 + ] 4 slip')).toEqual(τ([3, 4]));
});

test('should dup', async () => {
  expect(await ƒ('1 2 dup 3')).toEqual(τ([1, 2, 2, 3]));
  expect(await ƒ('[ 1 2 + ] dup swap drop eval')).toEqual(τ([3]));
});

test('should dup arrays', async () => {
  const f = F().eval('[ 1 2 3 ] dup');
  expect(f.stack).toEqual([
    [1, 2, 3].map(x => new Decimal(x)),
    [1, 2, 3].map(x => new Decimal(x))
  ]);
  expect(f.stack[0]).toBe(f.stack[1]);
});

test('should clr', async () => {
  expect(await ƒ('1 2 clr 3')).toEqual(τ([3]));
});

test('should stack unstack', async () => {
  expect(await ƒ('1 2 3 stack')).toEqual(`[ [ 1 2 3 ] ]`);
  expect(await ƒ('[ 1 2 3 ] unstack')).toEqual(`[ 1 2 3 ]`);
});

test('should choose on true and false', async () => {
  expect(await ƒ('true 3 4 choose')).toEqual(τ([3]));
  expect(await ƒ('false 3 4 choose')).toEqual(τ([4]));
});

test('should branch on truthy and falsy', async () => {
  expect(await ƒ('5 false [ 2 + ] [ 2 * ] branch')).toEqual(τ([10]));
  expect(await ƒ('5 true [ 2 + ] [ 2 * ] branch')).toEqual(τ([7]));
  expect(await ƒ('5 null [ 2 + ] [ 2 * ] branch')).toEqual(τ([10]));
  expect(await ƒ('5 "this is truthy" [ 2 + ] [ 2 * ] branch')).toEqual(τ([7]));
});

test('in', async () => {
  expect(await ƒ('[ 2 1 + ] in')).toEqual(τ([[3]]));
});

test('fork', async () => {
  expect(await ƒ('[1 2 +] fork')).toEqual(τ([[3]]));
});

test('clr in in and fork', async () => {
  expect(await ƒ('1 2 [ 2 1 clr 3 ] fork')).toEqual(τ([1, 2, [3]]));
});

test('map', async () => {
  expect(await ƒ('[ 3 2 1 ] [ 2 * ] map')).toEqual(τ([[6, 4, 2]]));
  expect(await ƒ('[ -3 -2 -1 ] [ abs ] map')).toEqual(τ([[3, 2, 1]]));
});

test('should undo on error', async () => {
  const f = F('1 2').eval();
  expect(f.stack).toEqual([1, 2].map(x => new Decimal(x)));

  expect(() => f.eval('+ whatwhat')).toThrow('whatwhat is not defined');
  expect(f.stack).toEqual([1, 2].map(x => new Decimal(x)));
});

test('should undo', async () => {
  const f = F('1').eval();

  f.eval('2');
  expect(f.stack).toEqual([1, 2].map(x => new Decimal(x)));

  f.eval('+');
  expect(f.stack).toEqual([3].map(x => new Decimal(x)));

  f.eval('undo');
  expect(f.stack).toEqual([1, 2].map(x => new Decimal(x)));

  f.eval('undo');
  expect(f.stack).toEqual([1].map(x => new Decimal(x)));
});

/* test('apply', async t => {
  t.deepEqual(await fValues('10 [ 9 4 ] max: rcl ||>'), [10, 9]);
  t.deepEqual(await fValues('10 [ 9 4 ] min: rcl ||>'), [10, 3]);
}); */

/* test('apply', async t => {
  t.plan(2);
  t.deepEqual(await fJSON('10 [ 9 4 3 ] \\max rcl ||>', [10, 9]);
  t.deepEqual(await fJSON('10 [ 9 4 3 ] \\min rcl ||>', [10, 3]);
}); */

test('of', async () => {
  expect(await ƒ('"abc" 123 of')).toEqual(`[ '123' ]`);
  expect(await ƒ('123 "456" of')).toEqual(`[ 456 ]`);
});

test('empty', async () => {
  expect(await ƒ('"abc" empty')).toEqual(`[ '' ]`);
  expect(await ƒ('123 empty')).toEqual(`[ 0 ]`);
});

test('nop', async () => {
  expect(await ƒ('"abc" nop')).toEqual(`[ 'abc' ]`);
  // t.deepEqual(await fJSON('"abc" id'), ['abc']);
});

test('depth', async () => {
  expect(await ƒ('"abc" depth')).toEqual(`[ 'abc' 1 ]`); // todo: should return a decimal
  expect(await ƒ('"abc" 123 depth')).toEqual(`[ 'abc' 123 2 ]`);
});

test('is?', async () => {
  expect(await ƒ('"abc" "abc" is?')).toEqual(`[ true ]`);
  expect(await ƒ('["abc"] ["abc"] is?')).toEqual(`[ false ]`);
  expect(await ƒ('["abc"] dup is?')).toEqual(`[ true ]`);
});

test('others2', async () => {
  expect(await ƒ('"abc" "b" indexof')).toEqual(`[ 1 ]`);
  expect(await ƒ('"abc" "def" swap')).toEqual(`[ 'def' 'abc' ]`);
  expect(await ƒ('abc: def: swap')).toEqual(`[ def: abc: ]`);
  expect(await ƒ('abc: dup')).toEqual(`[ abc: abc: ]`);
  expect(await ƒ('[2 1 +] unstack')).toEqual(`[ 2 1 + ]`); // check this... action on the stack!!
});

test('should slice', async () => {
  expect(await ƒ('["a" "b" "c" "d"] 0 1 slice')).toEqual(τ([['a']]));
  expect(await ƒ('["a" "b" "c" "d"] 0 -1 slice')).toEqual(τ([['a', 'b', 'c']]));
  expect(await ƒ('["a" "b" "c" "d"] 1 -1 slice')).toEqual(τ([['b', 'c']]));
});

test('should split at', async () => {
  expect(await ƒ('["a" "b" "c" "d"] 1 /')).toEqual(τ([['a'], ['b', 'c', 'd']]));
  expect(await ƒ('["a" "b" "c" "d"] -1 /')).toEqual(
    τ([['a', 'b', 'c'], ['d']])
  );
});

test('filter and reduce', async () => {
  expect(await ƒ('10 integers [ even? ] filter')).toEqual(`[ [ 2 4 6 8 10 ] ]`);
  expect(await ƒ('10 integers 0 [ + ] reduce')).toEqual(`[ 55 ]`);
  expect(await ƒ('10 integers 1 [ * ] reduce')).toEqual(`[ 3628800 ]`);
  expect(await ƒ('10 integers [ + ] fold')).toEqual(`[ 55 ]`);
  expect(await ƒ('10 integers [ * ] fold')).toEqual(`[ 3628800 ]`);
});

test('zip, zipwith and dot', async () => {
  expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] zip')).toEqual(`[ [ 1 4 2 5 3 6 ] ]`);
  expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in')).toEqual(
    `[ [ 5 7 9 ] ]`
  );
  expect(await ƒ('[ 1 2 3 ] [ 4 5 6 ] dot')).toEqual(`[ 32 ]`);
  expect(await ƒ('[ 1 2 3 4 ] [ 4 5 6 ] dot')).toEqual(`[ 32 ]`);
});

/* test('operations with null', async t => {
  t.deepEqual(await fJSON('null 5 +'), [5], 'add');
  t.deepEqual(await fJSON('5 null +'), [5], 'add');
  t.deepEqual(await fJSON('null 5 -'), [-5], 'sub');
  t.deepEqual(await fJSON('5 null -'), [5], 'sub');
});

test('operations with null, cont', async t => {
  t.deepEqual(await fJSON('null 5 *'), [0]);
  t.deepEqual(await fJSON('5 null *'), [0]);
  t.deepEqual(await fJSON('null 5 /'), [0]);
  t.deepEqual(await fJSON('5 null /'), [null]); // should be infinity, bad JSON conversion
});

test('operations with null, cont2', async t => {
  t.deepEqual(await fJSON('null 5 <<'), [0]);
  t.deepEqual(await fJSON('5 null <<'), [5]);
  t.deepEqual(await fJSON('null 5 >>'), [0]);
  t.deepEqual(await fJSON('5 null >>'), [5]);
  t.deepEqual(await fJSON('null in'), [[null]]);
}); */

describe('errors on unknown command', () => {
  test('sync', () => {
    expect(() => {
      F().eval('abc');
    }).toThrow('abc is not defined');
  });

  test('async', () => {
    expect(ƒ(`abc`)).rejects.toThrow('abc is not defined');
  });

  test('in child', () => {
    expect(ƒ(`[ abc ] in`)).rejects.toThrow('abc is not defined');
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

test('pick', async () => {
  // t.deepEqual(await fValues('{a: 1} a: @'), [1]);
  expect(await ƒ('{a: 2} "a" @')).toEqual(`[ 2 ]`);
  // t.deepEqual(await fValues('{a: 3} b: @'), [null]);
  expect(await ƒ('{a: {b: 5}} "a.b" @')).toEqual(`[ 5 ]`);
  // t.deepEqual(await fValues('{a: {b: 5}} a.b: @'), [5]);
  expect(await ƒ('{a: 7} "A" lcase @')).toEqual(`[ 7 ]`);
  // t.deepEqual(await fValues('{a: 11} b: @ 13 orelse'), [13]);
  // t.deepEqual(
  //   await fValues('pickfunc: [ a: @ ] def { a: 17 } pickfunc'),
  //   [17]
  // );
});

test('pick into object', async () => {
  expect(await ƒ('{ a: { a: 1 } a: @ }')).toEqual(`[ { a: 1 } ]`);
  expect(await ƒ('{ a: 2 } q< { a: q> over @ }')).toEqual(`[ { a: 2 } ]`);
  expect(await ƒ('{ a: 3 } q< { b: q> a: @ }')).toEqual(`[ { b: 3 } ]`);
  // t.deepEqual(await ƒ('{ a: 23 } { a: } @'), [{a: 23}]);
});

test('pick into object with default', async () => {
  expect(await ƒ('{ a: { a: 1 } b: @ 2 orelse }')).toEqual(`[ { a: 2 } ]`);
  expect(await ƒ('{ a: 3 } q< { b: q> over @ 5 orelse }')).toEqual(
    `[ { b: 5 } ]`
  );
  expect(await ƒ('{ a: 7 } q< { c: q> b: @ 11 orelse }')).toEqual(
    `[ { c: 11 } ]`
  );
});

test('pick into array', async () => {
  expect(await ƒ('( { a: 1 } a: @ )')).toEqual(`[ [ 1 ] ]`);
});

test('pick from array', async () => {
  expect(await ƒ('[1 2] 0 @')).toEqual(`[ 1 ]`);
  expect(await ƒ('[3 5] 1 @')).toEqual(`[ 5 ]`);
  expect(await ƒ('([7 11] 0 @)')).toEqual(`[ [ 7 ] ]`);
});

test('actions', async () => {
  expect(await ƒ('eval:')).toEqual(`[ eval: ]`);
  expect(await ƒ('eval: :')).toEqual(`[ eval: ]`);
  expect(await ƒ('[ 1 2 eval ] :')).toEqual(`[ [ 1 2 eval ] ]`);
});

test('=', async () => {
  expect(await ƒ('1 1 =')).toEqual(`[ true ]`);
  expect(await ƒ('1 i * 1 i * =')).toEqual(`[ true ]`);
  expect(await ƒ('null null =')).toEqual(`[ true ]`);
  expect(await ƒ('nan nan =')).toEqual(`[ true ]`); // todo: This is open the array
  expect(await ƒ('{} {} =')).toEqual(`[ true ]`);
  expect(await ƒ('{ x: 1 } { x: 1 } =')).toEqual(`[ true ]`);
  expect(await ƒ('"1/1/1990" date "1/1/1990" date =')).toEqual(`[ true ]`);
});

test('!=', async () => {
  expect(await ƒ('1 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('1 i * 2 i * =')).toEqual(`[ false ]`);
  expect(await ƒ('null 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('nan 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('{ x: 1 } { x: 2 } =')).toEqual(`[ false ]`);
  expect(await ƒ('"1/1/1990" date "1/2/1990" date =')).toEqual(`[ false ]`);
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
  name: { } def
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
  expect(await ƒ(`core: 'core.ff' import ; 5 core.pred`)).toEqual(`[ 5 4 ]`);
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
  expect(await ƒ('pred: (5) |>')).toEqual(`[ 5 4 ]`);
  expect(await ƒ('!: (12) |>')).toEqual(`[ 479001600 ]`);
  expect(await ƒ('+: (5,4) |>')).toEqual(`[ 9 ]`);
  expect(await ƒ('+: (pred: (5) |>) |>')).toEqual(`[ 9 ]`);
  expect(await ƒ('+: (*: (5, 6) |>, *: (5,2) |>) |>')).toEqual(`[ 40 ]`);
  expect(await ƒ('logn: (1000, 10) |>')).toEqual(`[ 3 ]`);
  expect(await ƒ('!: (2 6 *) |>')).toEqual(`[ 479001600 ]`);
  expect(await ƒ('regexp: ("/a./") |>')).toEqual(`[ /a./ ]`);
  expect(await ƒ('[i *] (10) |>')).toEqual(`[ 0+10i ]`);
});

test('length', async () => {
  expect(await ƒ('null ln')).toEqual(`[ 0 ]`);
});

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

test('hex, bin', async () => {
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
  expect(() => {
    F().eval('4 "d" *');
  }).toThrow('Unexpected type of arguments');
});

test('stack underflow', async () => {
  expect(() => {
    F().eval('4 *');
  }).toThrow('Stack underflow');
});

test('lambdas', async () => {
  expect(
    await ƒ('l: [ [ a: b: c: ] => [ .b .c .c .a ] ] lambda ; 1 2 3 l')
  ).toEqual(`[ 2 3 3 1 ]`);
  expect(
    await ƒ('d: [ [ a: b: ] => [ .a .b - abs .a / ] ] lambda ; 10 5 d')
  ).toEqual(`[ 0.5 ]`);
});
