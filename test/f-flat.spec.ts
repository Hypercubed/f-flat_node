import {
  F,
  fJSON,
  fValues,
  fValue,
  fString,
  Word,
  Sentence,
  Decimal,
  D,
  V,
  Complex
} from './helpers/setup';

const future = { '@@Future': { $undefined: true } };

test('setup', async () => {
  expect(F().eval).not.toBe(undefined);
  expect(F().promise).not.toBe(undefined);
  expect(F().depth).not.toBe(undefined);
  expect(await fJSON('')).toEqual([]);
  expect(await fValues('1 2 3')).toEqual([1, 2, 3]);
});

test('should be chainable', async () => {
  const f = F('1').eval('2 3');
  expect(f.toJSON()).toEqual([1, 2, 3].map(D));
  f.eval('4 +');
  expect(f.toJSON()).toEqual([1, 2, 7].map(D));
});

test('should push numeric values', async () => {
  expect(await fValues('1 2 -3 +5')).toEqual([1, 2, -3, 5]);
  expect(await fValues('1.1 2.2 -3.14, +2.17')).toEqual([
    1.1,
    2.2,
    -3.14,
    2.17
  ]);
  expect(await fValues('1.1e-1 2.2e+2 -3.14e-1')).toEqual([0.11, 220, -0.314]);
  expect(await fValues('10_000 1_00')).toEqual([10000, 100]);
});

test('should push hexidecimal numeric values', async () => {
  expect(await fValues('0x5 0x55 0xff')).toEqual([5, 85, 255]);
  expect(await fValues('0x5.5 0xff.ff')).toEqual([
    85 * Math.pow(16, -1),
    65535 * Math.pow(16, -2)
  ]);
  expect(await fValues('0x1p+1 0xffp-2')).toEqual([2, 255 * Math.pow(2, -2)]);
});

test('should push binary numeric values', async () => {
  expect(await fValues('0b1 0b10 0b11')).toEqual([1, 2, 3]);
  expect(await fValues('0b1.1 0b11.11')).toEqual([
    3 * Math.pow(2, -1),
    15 * Math.pow(2, -2)
  ]);
  expect(await fValues('0b1p+1 0b11p-2')).toEqual([2, 3 * Math.pow(2, -2)]);
});

test('should drop swap slip', async () => {
  expect(await fValues('1 2 drop 3')).toEqual([1, 3]);
  expect(await fValues('1 2 swap 3')).toEqual([2, 1, 3]);
  expect(await fValues('[ 1 2 + ] 4 slip')).toEqual([3, 4]);
});

test('should dup', async () => {
  expect(await fValues('1 2 dup 3')).toEqual([1, 2, 2, 3]);
  expect(await fValue('[ 1 2 + ] dup swap drop eval')).toEqual(3);
});

test('should dup cl1', async () => {
  const f = F().eval('[ 1 2 3 ] dup');
  expect(V(f.stack)).toEqual([
    [1, 2, 3],
    [1, 2, 3]
  ]);
  expect(f.stack[0]).toBe(f.stack[1]);
});

test('should clr', async () => {
  expect(await fValues('1 2 clr 3')).toEqual([3]);
});

test('should stack unstack', async () => {
  expect(await fValues('1 2 3 stack')).toEqual([[1, 2, 3]]);
  expect(await fValues('[ 1 2 3 ] <-')).toEqual([1, 2, 3]);
});

test('should choose on true and false', async () => {
  expect(await fValues('true 3 4 choose')).toEqual([3]);
  expect(await fValues('false 3 4 choose')).toEqual([4]);
});

test('should branch on truthy and falsy', async () => {
  expect(await fValues('5 false [ 2 + ] [ 2 * ] branch')).toEqual([10]);
  expect(await fValues('5 true [ 2 + ] [ 2 * ] branch')).toEqual([7]);
  expect(await fValues('5 null [ 2 + ] [ 2 * ] branch')).toEqual([10]);
  expect(await fValues('5 "this is truthy" [ 2 + ] [ 2 * ] branch')).toEqual([
    7
  ]);
});

test('in', async () => {
  expect(await fValues('[ 2 1 + ] in')).toEqual([[3]]);
});

test('fork', async () => {
  expect(await fValues('[1 2 +] fork')).toEqual([[3]]);
});

test('clr in in and fork', async () => {
  expect(await fValues('1 2 [ 2 1 clr 3 ] fork')).toEqual([1, 2, [3]]);
});

test('map', async () => {
  expect(await fValues('[ 3 2 1 ] [ 2 * ] map')).toEqual([[6, 4, 2]]);
  expect(await fValues('[ -3 -2 -1 ] [ abs ] map')).toEqual([[3, 2, 1]]);
});

test('should undo on error', async () => {
  const f = F('1 2').eval();
  expect(V(f)).toEqual([1, 2]);

  expect(() => f.eval('+ whatwhat')).toThrow('whatwhat is not defined');
  expect(V(f)).toEqual([1, 2]);
});

test('should undo', async () => {
  const f = F('1').eval();

  f.eval('2');
  expect(V(f)).toEqual([1, 2]);

  f.eval('+');
  expect(V(f)).toEqual([3]);

  f.eval('undo');
  expect(V(f)).toEqual([1, 2]);

  f.eval('undo');
  expect(V(f)).toEqual([1]);
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

test('others', async () => {
  expect(await fJSON('get-log-level set-log-level')).toEqual([]);
  expect(await fValues('1 2 + [ 4 5 ] -> 6 7')).toEqual([3, 4, 5]);
});

test('of', async () => {
  expect(await fJSON('"abc" 123 of')).toEqual(['123']);
  expect(await fValues('123 "456" of')).toEqual([456]);
});

test('empty', async () => {
  expect(await fJSON('"abc" empty')).toEqual(['']);
  expect(await fValues('123 empty')).toEqual([0]);
});

test('nop', async () => {
  expect(await fJSON('"abc" nop')).toEqual(['abc']);
  // t.deepEqual(await fJSON('"abc" id'), ['abc']);
});

test('depth', async () => {
  expect(await fJSON('"abc" depth')).toEqual(['abc', 1]); // todo: should return a decimal
  expect(await fValues('"abc" 123 depth')).toEqual(['abc', 123, 2]);
});

test('is?', async () => {
  expect(await fJSON('"abc" "abc" is?')).toEqual([true]);
  expect(await fJSON('["abc"] ["abc"] is?')).toEqual([false]);
  expect(await fJSON('["abc"] dup is?')).toEqual([true]);
});

test('others2', async () => {
  const def = new Word('def').toJSON();
  const abc = new Word('abc').toJSON();
  const plus = new Word('+').toJSON();

  expect(await fJSON('"abc" "b" indexof')).toEqual([1]);
  expect(await fJSON('"abc" "def" swap')).toEqual(['def', 'abc']);
  expect(await fJSON('abc: def: swap')).toEqual([def, abc]);
  expect(await fJSON('abc: dup')).toEqual([abc, abc]);
  expect(await fJSON('[2 1 +] unstack')).toEqual([D(2), D(1), plus]);
});

test('should slice', async () => {
  expect(await fJSON('["a" "b" "c" "d"] 0 1 slice')).toEqual([['a']]);
  expect(await fJSON('["a" "b" "c" "d"] 0 -1 slice')).toEqual([
    ['a', 'b', 'c']
  ]);
  expect(await fJSON('["a" "b" "c" "d"] 1 -1 slice')).toEqual([['b', 'c']]);
});

test('should split at', async () => {
  expect(await fJSON('["a" "b" "c" "d"] 1 /')).toEqual([
    ['a'],
    ['b', 'c', 'd']
  ]);
  expect(await fJSON('["a" "b" "c" "d"] -1 /')).toEqual([
    ['a', 'b', 'c'],
    ['d']
  ]);
});

test('filter and reduce', async () => {
  expect(await fValues('10 integers [ even? ] filter')).toEqual([
    [2, 4, 6, 8, 10]
  ]);
  expect(await fValues('10 integers 0 [ + ] reduce')).toEqual([55]);
  expect(await fValues('10 integers 1 [ * ] reduce')).toEqual([3628800]);
  expect(await fValues('10 integers [ + ] fold')).toEqual([55]);
  expect(await fValues('10 integers [ * ] fold')).toEqual([3628800]);
});

test('zip, zipwith and dot', async () => {
  expect(await fValues('[ 1 2 3 ] [ 4 5 6 ] zip')).toEqual([
    [1, 4, 2, 5, 3, 6]
  ]);
  expect(await fValues('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in')).toEqual([
    [5, 7, 9]
  ]);
  expect(await fValues('[ 1 2 3 ] [ 4 5 6 ] dot')).toEqual([32]);
  expect(await fValues('[ 1 2 3 4 ] [ 4 5 6 ] dot')).toEqual([32]);
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

test('errors on unknown command, sync', async () => {
  expect(() => {
    F().eval('abc');
  }).toThrow('abc is not defined');
});

test('errors on unknown command in child', async () => {
  expect(() => {
    F().eval('[ abc ] in');
  }).toThrow('abc is not defined');
});

test('errors on async command in eval', async () => {
  expect(() => {
    F().eval('[ 1 2 + ] await');
  }).toThrow('Do Not Release Zalgo');
});

test('errors on async child in eval', async () => {
  expect(() => {
    F().eval('[ 100 sleep ] in');
  }).toThrow('Do Not Release Zalgo');
});

test('can spawn a future in sync', async () => {
  expect(await fJSON('[ 1 2 + 100 sleep ] spawn 3 4 +')).toEqual([
    future,
    new Decimal(7).toJSON()
  ]);
});

/* function delay (ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
} */

test('should spawn, returning a future', async () => {
  const f = F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  expect(f.toJSON()).toEqual([future, new Decimal(9).toJSON()]);

  // await delay(2000);

  // t.deepEqual(f.toJSON(), [{type: '@@Future', value: [3628800]}, 9]);
  // t.deepEqual(f.eval('await slip').toJSON(), [3628800, 9]);
});

test('pick', async () => {
  // t.deepEqual(await fValues('{a: 1} a: @'), [1]);
  expect(await fValues('{a: 2} "a" @')).toEqual([2]);
  // t.deepEqual(await fValues('{a: 3} b: @'), [null]);
  expect(await fValues('{a: {b: 5}} "a.b" @')).toEqual([5]);
  // t.deepEqual(await fValues('{a: {b: 5}} a.b: @'), [5]);
  expect(await fValues('{a: 7} "A" lcase @')).toEqual([7]);
  // t.deepEqual(await fValues('{a: 11} b: @ 13 orelse'), [13]);
  // t.deepEqual(
  //   await fValues('pickfunc: [ a: @ ] def { a: 17 } pickfunc'),
  //   [17]
  // );
});

test('pick into object', async () => {
  expect(await fJSON('{ a: { a: 1 } a: @ }')).toEqual([{ a: D(1) }]);
  expect(await fJSON('{ a: 2 } q< { a: q> over @ }')).toEqual([{ a: D(2) }]);
  expect(await fJSON('{ a: 3 } q< { b: q> a: @ }')).toEqual([{ b: D(3) }]);
  // t.deepEqual(await fJSON('{ a: 23 } { a: } @'), [{a: 23}]);
});

test('pick into object with default', async () => {
  expect(await fJSON('{ a: { a: 1 } b: @ 2 orelse }')).toEqual([{ a: D(2) }]);
  expect(await fJSON('{ a: 3 } q< { b: q> over @ 5 orelse }')).toEqual([
    { b: D(5) }
  ]);
  expect(await fJSON('{ a: 7 } q< { c: q> b: @ 11 orelse }')).toEqual([
    { c: D(11) }
  ]); // [{ c: 11 }]
});

test('pick into array', async () => {
  expect(await fValues('( { a: 1 } a: @ )')).toEqual([[1]]);
});

test('pick from array', async () => {
  expect(await fValues('[1 2] 0 @')).toEqual([1]);
  expect(await fValues('[3 5] 1 @')).toEqual([5]);
  expect(await fValues('([7 11] 0 @)')).toEqual([[7]]);
});

test('actions', async () => {
  const ev = new Word('eval').toJSON();
  const sl = new Word('slip').toJSON();
  const actionEval = new Sentence(D([1, 2, ev])).toJSON();
  const actionSlip = new Sentence(D([1, 2, sl])).toJSON();

  expect(await fJSON('eval:')).toEqual([ev]);
  expect(await fJSON('eval: :')).toEqual([ev]);
  // t.deepEqual(await fJSON('[ eval ] :'), [ev]); // todo: This is open the array
  expect(await fJSON('[ 1 2 eval ] :')).toEqual([actionEval]);
  expect(await fJSON('slip:')).toEqual([sl]);
  expect(await fJSON('slip: :')).toEqual([sl]);
  // t.deepEqual(await fJSON('[ slip ] :'), [sl]);
  // t.deepEqual(await fJSON('[ 1 2 slip ] :'), [actionSlip]);
});

test('=', async () => {
  expect(await fJSON('1 1 =')).toEqual([true]);
  expect(await fJSON('1 i * 1 i * =')).toEqual([true]);
  expect(await fJSON('null null =')).toEqual([true]);
  expect(await fJSON('nan nan =')).toEqual([true]); // todo: This is open the array
  expect(await fJSON('{} {} =')).toEqual([true]);
  expect(await fJSON('{ x: 1 } { x: 1 } =')).toEqual([true]);
  expect(await fJSON('"1/1/1990" date "1/1/1990" date =')).toEqual([true]);
});

test('!=', async () => {
  expect(await fJSON('1 2 =')).toEqual([false]);
  expect(await fJSON('1 i * 2 i * =')).toEqual([false]);
  expect(await fJSON('null 2 =')).toEqual([false]);
  expect(await fJSON('nan 2 =')).toEqual([false]);
  expect(await fJSON('{ x: 1 } { x: 2 } =')).toEqual([false]);
  expect(await fJSON('"1/1/1990" date "1/2/1990" date =')).toEqual([false]);
});

// immutable tests

test('immutable array actions', async () => {
  expect(await fValues('[ 1 ] dup 2 <<')).toEqual([[1], [1, 2]]);
  expect(await fValues('[ 1 ] dup 2 swap >>')).toEqual([[1], [2, 1]]);
  expect(await fValues('[ 1 ] dup [ 2 ] +')).toEqual([[1], [1, 2]]);
});

test('immutable object actions', async () => {
  const first = 'Manfred';
  const last = 'Von Thun';
  expect(
    await fJSON('{ first: "Manfred" } dup { last: "Von Thun" } +')
  ).toEqual([{ first }, { first, last }]);
  expect(
    await fJSON('{ first: "Manfred" } dup { last: "Von Thun" } <<')
  ).toEqual([{ first }, { first, last }]);
  expect(
    await fJSON('{ first: "Manfred" } dup { last: "Von Thun" } >>')
  ).toEqual([{ first }, { first, last }]);
});

test('immutable sto', async () => {
  const first = 'Manfred';
  const last = 'Von Thun';
  expect(
    await fJSON(`
  name: { } def
  name
  name { first: "Manfred" } <<
  name { last: "Von Thun" } <<
  name
`)
  ).toEqual([{}, { first }, { last }, {}]);
});

test('atoms are not executed by stack actions', async () => {
  const a = { '@@Action': 'a' };
  const b = { '@@Action': 'b' };
  expect(await fJSON('a: dup')).toEqual([a, a]);
  expect(await fJSON('true a: b: choose')).toEqual([a]);
  expect(await fJSON('false a: b: choose')).toEqual([b]);
  expect(await fJSON('a: b: q< drop q>')).toEqual([b]);
  expect(await fJSON('[a: b:] 1 @')).toEqual([b]); // fix this
  expect(await fJSON('[a: b:] unstack')).toEqual([a, b]); // fix this
});

test('can perform actions from module', async () => {
  expect(await fValues(`core: 'core.ff' import ; 5 core.pred`)).toEqual([5, 4]);
  expect(await fValues(`math: 'math.ff' import ; 12 math.!`)).toEqual([
    479001600
  ]);
});

test('postfix "macros"', async () => {
  expect(await fValues('5:pred')).toEqual([5, 4]);
  expect(await fValues('12:!')).toEqual([479001600]);
  expect(await fValues('1000 10:logn')).toEqual([3]);
  expect(await fValues('"a" 5:dupn')).toEqual(['a', 'a', 'a', 'a', 'a', 'a']);
});

test('prefix macros', async () => {
  expect(await fValues('pred:(5).')).toEqual([5, 4]);
  expect(await fValues('!:(12).')).toEqual([479001600]);
  expect(await fValues('+:(5,4).')).toEqual([9]);
  expect(await fValues('+:(pred:(5).).')).toEqual([9]);
  expect(await fValues('+:(*:(5,6)., *:(5,2).).')).toEqual([40]);
  expect(await fValues('logn:(1000, 10).')).toEqual([3]);
  expect(await fValues('!:(2 6 *).')).toEqual([479001600]);
  expect(await fValues('regexp:"/a./".')).toEqual([/a./]);
  expect(await fValues('[i *](10).')).toEqual([new Complex(0, 10)]);
});

test('length', async () => {
  expect(await fJSON('null ln')).toEqual([0]);
});

test('base, pos integers', async () => {
  expect(await fJSON('5 16 base')).toEqual(['0x5']);
  expect(await fJSON('5 2 base')).toEqual(['0b101']);

  expect(await fJSON('3735928559 16 base')).toEqual(['0xDEADBEEF']);
  expect(await fJSON('3735928559 2 base')).toEqual([
    '0b11011110101011011011111011101111'
  ]);

  expect(await fJSON('18446744073709551615 16 base')).toEqual([
    '0xFFFFFFFFFFFFFFFF'
  ]);
  expect(await fJSON('18446744073709551615 10 base')).toEqual([
    '18446744073709551615'
  ]);
  expect(await fJSON('18446744073709551615 8 base')).toEqual([
    '0o1777777777777777777777'
  ]);
  expect(await fJSON('18446744073709551615 4 base')).toEqual([
    '33333333333333333333333333333333'
  ]);
  expect(await fJSON('18446744073709551615 2 base')).toEqual([
    '0b1111111111111111111111111111111111111111111111111111111111111111'
  ]);
});

test('base, neg integers', async () => {
  expect(await fJSON('-3735928559 16 base')).toEqual(['-0xDEADBEEF']);
  expect(await fJSON('-18446744073709551615 16 base')).toEqual([
    '-0xFFFFFFFFFFFFFFFF'
  ]);
  expect(await fJSON('-18446744073709551615 10 base')).toEqual([
    '-18446744073709551615'
  ]);
  expect(await fJSON('-18446744073709551615 8 base')).toEqual([
    '-0o1777777777777777777777'
  ]);
  expect(await fJSON('-18446744073709551615 2 base')).toEqual([
    '-0b1111111111111111111111111111111111111111111111111111111111111111'
  ]);
});

test('base, pos floats', async () => {
  expect(await fJSON('0.125 16 base')).toEqual(['0x0.2']);
  expect(await fJSON('0.125 10 base')).toEqual(['0.125']);
  expect(await fJSON('0.125 8 base')).toEqual(['0o0.1']);
  // t.deepEqual(await fJSON('0.125 4 base'), ['0.02']);
  expect(await fJSON('0.125 2 base')).toEqual(['0b0.001']);

  // t.deepEqual(await fJSON('123456789.87654321 2 base'), ['0b111010110111100110100010101.1110000001100101001000101100010001111011']);
});

test('base, neg floats', async () => {
  expect(await fJSON('-0.125 16 base')).toEqual(['-0x0.2']);
  expect(await fJSON('-0.125 10 base')).toEqual(['-0.125']);
  expect(await fJSON('-0.125 8 base')).toEqual(['-0o0.1']);
  expect(await fJSON('-0.125 2 base')).toEqual(['-0b0.001']);
});

test('base with inf and nan', async () => {
  expect(await fJSON('nan 16 base')).toEqual(['NaN']);
  expect(await fJSON('Infinity 16 base')).toEqual(['Infinity']);
  expect(await fJSON('-Infinity 16 base')).toEqual(['-Infinity']);
});

test('hex, bin', async () => {
  expect(await fJSON('18446744073709551615 hex')).toEqual([
    '0xFFFFFFFFFFFFFFFF'
  ]);
  expect(await fJSON('18446744073709551615 bin')).toEqual([
    '0b1111111111111111111111111111111111111111111111111111111111111111'
  ]);
  expect(await fJSON('18446744073709551615 oct')).toEqual([
    '0o1777777777777777777777'
  ]);

  expect(await fJSON('0.125 hex')).toEqual(['0x0.2']);

  expect(await fJSON('-18446744073709551615 hex')).toEqual([
    '-0xFFFFFFFFFFFFFFFF'
  ]);
  expect(await fJSON('-18446744073709551615 bin')).toEqual([
    '-0b1111111111111111111111111111111111111111111111111111111111111111'
  ]);
  expect(await fJSON('-0.125 hex')).toEqual(['-0x0.2']);
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
  expect(await fValues('5 2 divrem')).toEqual([2, 1]);
});

test('integer number formats', async () => {
  expect(await fValues('5')).toEqual([5]);
  expect(await fValues('+5')).toEqual([5]);
});

test('decimal number formats', async () => {
  expect(await fValues('0.5')).toEqual([0.5]);
  expect(await fValues('.5')).toEqual([0.5]);
  expect(await fValues('+.5e1')).toEqual([5]);
  expect(await fValues('+5e0')).toEqual([5]);
  expect(await fValues('+5e+0')).toEqual([5]);
  expect(await fValues('+5e-0')).toEqual([5]);
  expect(await fValues('+5e-9')).toEqual([5e-9]);
  expect(await fValues('+5e+9')).toEqual([5e9]);
  expect(await fValues('+5e+10')).toEqual([5e10]);
});

test('integer precent formats', async () => {
  expect(await fValues('5%')).toEqual([0.05]);
  expect(await fValues('+5%')).toEqual([0.05]);
  expect(await fValues('-5%')).toEqual([-0.05]);
});

test('hexadecimal integer formats', async () => {
  expect(await fValues('0xDEAD')).toEqual([0xdead]);
  expect(await fValues('-0xBEEF')).toEqual([-0xbeef]);
});

test('hexadecimal float formats', async () => {
  expect(await fValues('0xDEAD.BEEF')).toEqual([0xdeadbeef / 2 ** 16]);
  expect(await fValues('-0xDEAD.BEEF')).toEqual([-0xdeadbeef / 2 ** 16]);
  expect(await fValues('0x1.1p5')).toEqual([34]);
});

test('underscore seperators', async () => {
  expect(await fValues('5_000')).toEqual([5000]);
  expect(await fValues('5_000_000')).toEqual([5000000]);
  expect(await fValues('+5_000e+6')).toEqual([5e9]);
  expect(await fValues('+5_000_000e+3')).toEqual([5e9]);
  expect(await fValues('+5_000.000_000e+1_0')).toEqual([5e13]);
  expect(await fValues('-5_000.000_000e-1_0')).toEqual([-5e-7]);
});

test('underscore seperators hexadecimal integer formats', async () => {
  expect(await fValues('0xDE_AD')).toEqual([0xdead]);
  expect(await fValues('-0xBE_EF')).toEqual([-0xbeef]);
  expect(await fValues('0xDE_AD_BE_EF')).toEqual([0xdeadbeef]);
});

test('should resolve', async () => {
  expect(await fValue('"core" resolve')).toMatch(/^file:.*core$/);
  expect(await fValue('"core.ff" resolve')).toMatch(/^file:.*core.ff$/);
  expect(await fValue('"/home/core.ff" resolve')).toMatch(
    /^file:\/\/\/.*home\/core.ff$/
  );
  expect(await fValue('"file:///home/core.ff" resolve')).toMatch(
    /^file:\/\/\/.*home\/core.ff$/
  );
  expect(await fValue('"http://www.home.com/core.ff" resolve')).toEqual(
    'http://home.com/core.ff'
  );
});

test('keywords are case insenstivive', async () => {
  expect(await fValues('null NULL')).toEqual([null, null]);
  expect(await fValues('nan NAN NaN nAn')).toEqual([NaN, NaN, NaN, NaN]);
  expect(await fString('i I')).toEqual('0+1i,0+1i');
  expect(await fValues('true TRUE tRue')).toEqual([true, true, true]);
  expect(await fValues('false FALSE fAlsE')).toEqual([false, false, false]);
});
