import test from 'ava';
import {
  F,
  fJSON,
  fValues,
  fValue,
  fString,
  Word,
  Sentence,
  Decimal,
  D, V,
  Complex
} from './setup';

const future = { '@@Future': { $undefined: true } };

test('setup', async t => {
  t.not(F().eval, undefined);
  t.not(F().promise, undefined);
  t.not(F().depth, undefined);
  t.deepEqual(await fJSON(''), [], 'should create an empty stack');
  t.deepEqual(
    await fValues('1 2 3'),
    [1, 2, 3],
    'should create an non-empty stack'
  );
});

test('should be chainable', async t => {
  const f = F('1').eval('2 3');
  t.deepEqual(f.toJSON(), [1, 2, 3].map(D));
  f.eval('4 +');
  t.deepEqual(f.toJSON(), [1, 2, 7].map(D));
});

test('should push numeric values', async t => {
  t.deepEqual(await fValues('1 2 -3 +5'), [1, 2, -3, 5], 'integers');
  t.deepEqual(await fValues('1.1 2.2 -3.14, +2.17'), [1.1, 2.2, -3.14, 2.17], 'floats');
  t.deepEqual(
    await fValues('1.1e-1 2.2e+2 -3.14e-1'),
    [0.11, 220, -0.314],
    'expoential'
  );
  t.deepEqual(await fValues('10_000 1_00'), [10000, 100], 'seperators');
});

test('should push hexidecimal numeric values', async t => {
  t.deepEqual(await fValues('0x5 0x55 0xff'), [5, 85, 255], 'integers');
  t.deepEqual(
    await fValues('0x5.5 0xff.ff'),
    [85 * Math.pow(16, -1), 65535 * Math.pow(16, -2)],
    'floats'
  );
  t.deepEqual(
    await fValues('0x1p+1 0xffp-2'),
    [2, 255 * Math.pow(2, -2)],
    'power of 2'
  );
});

test('should push binary numeric values', async t => {
  t.deepEqual(await fValues('0b1 0b10 0b11'), [1, 2, 3], 'integers');
  t.deepEqual(
    await fValues('0b1.1 0b11.11'),
    [3 * Math.pow(2, -1), 15 * Math.pow(2, -2)],
    'floats'
  );
  t.deepEqual(
    await fValues('0b1p+1 0b11p-2'),
    [2, 3 * Math.pow(2, -2)],
    'power of 2'
  );
});

test('should drop swap slip', async t => {
  t.deepEqual(await fValues('1 2 drop 3'), [1, 3], 'should drop');
  t.deepEqual(await fValues('1 2 swap 3'), [2, 1, 3], 'should swap');
  t.deepEqual(await fValues('[ 1 2 + ] 4 slip'), [3, 4], 'should slip');
});

test('should dup', async t => {
  t.deepEqual(await fValues('1 2 dup 3'), [1, 2, 2, 3]);
  t.deepEqual(await fValue('[ 1 2 + ] dup swap drop eval'), 3);
});

test('should dup cl1', async t => {
  const f = F().eval('[ 1 2 3 ] dup');
  t.deepEqual(V(f.stack), [[1, 2, 3], [1, 2, 3]]);
  t.is(f.stack[0], f.stack[1]);
});

test('should clr', async t => {
  t.deepEqual(await fValues('1 2 clr 3'), [3]);
});

test('should stack unstack', async t => {
  t.deepEqual(await fValues('1 2 3 stack'), [[1, 2, 3]], 'should stack');
  t.deepEqual(await fValues('[ 1 2 3 ] <-'), [1, 2, 3], 'should unstack');
});

test('should choose on true and false', async t => {
  t.deepEqual(await fValues('true 3 4 choose'), [3]);
  t.deepEqual(await fValues('false 3 4 choose'), [4]);
});

test('should branch on truthy and falsy', async t => {
  t.deepEqual(await fValues('5 false [ 2 + ] [ 2 * ] branch'), [10]);
  t.deepEqual(await fValues('5 true [ 2 + ] [ 2 * ] branch'), [7]);
  t.deepEqual(await fValues('5 null [ 2 + ] [ 2 * ] branch'), [10]);
  t.deepEqual(await fValues('5 "this is truthy" [ 2 + ] [ 2 * ] branch'), [7]);
});

test('in/fork', async t => {
  t.deepEqual(await fValues('[ 2 1 + ] in'), [[3]], 'should evaluate list');
  t.deepEqual(
    await fJSON('"before" "a" sto [ a ] in'),
    [['before']],
    'fork should have access to parent scope'
  );
  t.deepEqual(
    await fJSON('"outer" "a" sto [ "inner" "a" sto a ] fork a'),
    [['inner'], 'outer'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    await fJSON('"outer" "a" sto [ "inner" "b" sto a ] in b'),
    [['outer'], 'inner'],
    'in does not isolate child scope'
  );
});

test('clr in in and fork', async t => {
  // t.deepEqual(await fJSON('1 2 [ 2 1 clr 3 ] in'), [[3]], 'should evaluate list');
  t.deepEqual(
    await fValues('1 2 [ 2 1 clr 3 ] fork'),
    [1, 2, [3]],
    'should evaluate list'
  );
});

test('map', async t => {
  t.deepEqual(
    await fValues('[ 3 2 1 ] [ 2 * ] map'),
    [[6, 4, 2]],
    'should map quotes over quotes'
  );
  t.deepEqual(
    await fValues('[ -3 -2 -1 ] abs: map'),
    [[3, 2, 1]],
    'should map words over quotes'
  );
});

test('should undo on error', async t => {
  const f = F('1 2').eval();
  t.deepEqual(V(f), [1, 2]);

  t.throws(() => f.eval('+ whatwhat'));
  t.deepEqual(V(f), [1, 2]);
});

test('should undo', async t => {
  const f = F('1').eval();

  f.eval('2');
  t.deepEqual(V(f), [1, 2]);

  f.eval('+');
  t.deepEqual(V(f), [3]);

  f.eval('undo');
  t.deepEqual(V(f), [1, 2]);

  f.eval('undo');
  t.deepEqual(V(f), [1]);
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

test('fork', async t => {
  t.deepEqual(await fValues('[1 2 +] fork'), [[3]], 'fork');
});

test('others', async t => {
  t.deepEqual(await fJSON('get-log-level set-log-level'), [], 'set-log-level');
  t.deepEqual(
    await fValues('1 2 + [ 4 5 ] -> 6 7'),
    [3, 4, 5],
    'replace queue'
  );
});

test('of', async t => {
  t.deepEqual(await fJSON('"abc" 123 of'), ['123']);
  t.deepEqual(await fValues('123 "456" of'), [456]);
});

test('empty', async t => {
  t.deepEqual(await fJSON('"abc" empty'), ['']);
  t.deepEqual(await fValues('123 empty'), [0]);
});

test('nop', async t => {
  t.deepEqual(await fJSON('"abc" nop'), ['abc']);
  // t.deepEqual(await fJSON('"abc" id'), ['abc']);
});

test('depth', async t => {
  t.deepEqual(await fJSON('"abc" depth'), ['abc', 1]); // todo: should return a decimal
  t.deepEqual(await fValues('"abc" 123 depth'), ['abc', 123, 2]);
});

test('is?', async t => {
  t.deepEqual(await fJSON('"abc" "abc" is?'), [true]);
  t.deepEqual(await fJSON('["abc"] ["abc"] is?'), [false]);
  t.deepEqual(await fJSON('["abc"] dup is?'), [true]);
});

test('others2', async t => {
  const def = new Word('def').toJSON();
  const abc = new Word('abc').toJSON();
  const plus = new Word('+').toJSON();

  t.deepEqual(await fJSON('"abc" "b" indexof'), [1], 'indexof');
  t.deepEqual(await fJSON('"abc" "def" swap'), ['def', 'abc'], 'swap strings');
  t.deepEqual(await fJSON('abc: def: swap'), [def, abc], 'swap atoms');
  t.deepEqual(await fJSON('abc: dup'), [abc, abc], 'dup atoms');
  t.deepEqual(
    await fJSON('[2 1 +] unstack'),
    [D(2), D(1), plus],
    'unstack should not eval'
  );
});

test('should slice', async t => {
  t.deepEqual(await fJSON('["a" "b" "c" "d"] 0 1 slice'), [['a']]);
  t.deepEqual(await fJSON('["a" "b" "c" "d"] 0 -1 slice'), [['a', 'b', 'c']]);
  t.deepEqual(await fJSON('["a" "b" "c" "d"] 1 -1 slice'), [['b', 'c']]);
});

test('should split at', async t => {
  t.deepEqual(await fJSON('["a" "b" "c" "d"] 1 /'), [
    ['a'],
    ['b', 'c', 'd']
  ]);
  t.deepEqual(await fJSON('["a" "b" "c" "d"] -1 /'), [
    ['a', 'b', 'c'],
    ['d']
  ]);
});

test('filter and reduce', async t => {
  t.deepEqual(
    await fValues('10 integers [ even? ] filter'),
    [[2, 4, 6, 8, 10]],
    'filter'
  );
  t.deepEqual(await fValues('10 integers 0 [ + ] reduce'), [55], 'reduce');
  t.deepEqual(await fValues('10 integers 1 [ * ] reduce'), [3628800], 'reduce');
  t.deepEqual(await fValues('10 integers [ + ] fold'), [55], 'fold');
  t.deepEqual(await fValues('10 integers [ * ] fold'), [3628800], 'fold');
});

test('zip, zipwith and dot', async t => {
  t.deepEqual(
    await fValues('[ 1 2 3 ] [ 4 5 6 ] zip'),
    [[1, 4, 2, 5, 3, 6]],
    'zip'
  );
  t.deepEqual(
    await fValues('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in'),
    [[5, 7, 9]],
    'zipwith'
  );
  t.deepEqual(await fValues('[ 1 2 3 ] [ 4 5 6 ] dot'), [32], 'dot');
  t.deepEqual(await fValues('[ 1 2 3 4 ] [ 4 5 6 ] dot'), [32], 'dot');
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

test('errors on unknown command, sync', async t => {
  t.throws(() => {
    F().eval('abc');
  });
});

test('errors on unknown command in child', async t => {
  t.throws(() => {
    F().eval('[ abc ] in');
  });
});

test('errors on async command in eval', async t => {
  t.throws(() => {
    F().eval('[ 1 2 + ] await');
  });
});

test('errors on async child in eval', async t => {
  t.throws(() => {
    F().eval('[ 100 sleep ] in');
  });
});

test('can spawn a future in sync', async t => {
  t.deepEqual(await fJSON('[ 1 2 + 100 sleep ] spawn 3 4 +'), [
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

test('should spawn, returning a future', async t => {
  const f = F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  t.deepEqual(f.toJSON(), [future, new Decimal(9).toJSON()]);

  // await delay(2000);

  // t.deepEqual(f.toJSON(), [{type: '@@Future', value: [3628800]}, 9]);
  // t.deepEqual(f.eval('await slip').toJSON(), [3628800, 9]);
});

test('pick', async t => {
  t.deepEqual(await fValues('{a: 1} a: @'), [1]);
  t.deepEqual(await fValues('{a: 2} "a" @'), [2]);
  t.deepEqual(await fValues('{a: 3} b: @'), [null]);
  t.deepEqual(await fValues('{a: {b: 5}} "a.b" @'), [5]);
  t.deepEqual(await fValues('{a: {b: 5}} a.b: @'), [5]);
  t.deepEqual(await fValues('{a: 7} "A" lcase @'), [7]);
  t.deepEqual(await fValues('{a: 11} b: @ 13 orelse'), [13]);
  t.deepEqual(
    await fValues('[ a: @ ] : pickfunc: sto { a: 17 } pickfunc'),
    [17]
  );
});

test('pick into object', async t => {
  t.deepEqual(await fJSON('{ a: { a: 1 } a: @ }'), [{ a: D(1) }]);
  t.deepEqual(await fJSON('{ a: 2 } q< { a: q> over @ }'), [{ a: D(2) }]);
  t.deepEqual(await fJSON('{ a: 3 } q< { b: q> a: @ }'), [{ b: D(3) }]);
  // t.deepEqual(await fJSON('{ a: 23 } { a: } @'), [{a: 23}]);
});

test('pick into object with default', async t => {
  t.deepEqual(await fJSON('{ a: { a: 1 } b: @ 2 orelse }'), [{ a: D(2) }]);
  t.deepEqual(await fJSON('{ a: 3 } q< { b: q> over @ 5 orelse }'), [
    { b: D(5) }
  ]);
  t.deepEqual(await fJSON('{ a: 7 } q< { c: q> b: @ 11 orelse }'), [{ c: D(11) }]); // [{ c: 11 }]
});

test('pick into array', async t => {
  t.deepEqual(await fValues('( { a: 1 } a: @ )'), [[1]]);
});

test('pick from array', async t => {
  t.deepEqual(await fValues('[1 2] 0 @'), [1]);
  t.deepEqual(await fValues('[3 5] 1 @'), [5]);
  t.deepEqual(await fValues('([7 11] 0 @)'), [[7]]);
});

test('actions', async t => {
  const ev = new Word('eval').toJSON();
  const sl = new Word('slip').toJSON();
  const actionEval = new Sentence(D([1, 2, ev])).toJSON();
  const actionSlip = new Sentence(D([1, 2, sl])).toJSON();

  t.deepEqual(await fJSON('eval:'), [ev]);
  t.deepEqual(await fJSON('eval: :'), [ev]);
  t.deepEqual(await fJSON('[ eval ] :'), [ev]); // todo: This is open the array
  t.deepEqual(await fJSON('[ 1 2 eval ] :'), [actionEval]);
  t.deepEqual(await fJSON('slip:'), [sl]);
  t.deepEqual(await fJSON('slip: :'), [sl]);
  t.deepEqual(await fJSON('[ slip ] :'), [sl]);
  t.deepEqual(await fJSON('[ 1 2 slip ] :'), [actionSlip]);
});

test('=', async t => {
  t.deepEqual(await fJSON('1 1 ='), [true]);
  t.deepEqual(await fJSON('1 i * 1 i * ='), [true]);
  t.deepEqual(await fJSON('null null ='), [true]);
  t.deepEqual(await fJSON('nan nan ='), [true]); // todo: This is open the array
  t.deepEqual(await fJSON('{} {} ='), [true]);
  t.deepEqual(await fJSON('{ x: 1 } { x: 1 } ='), [true]);
  t.deepEqual(await fJSON('"1/1/1990" date "1/1/1990" date ='), [true]);
});

test('!=', async t => {
  t.deepEqual(await fJSON('1 2 ='), [false]);
  t.deepEqual(await fJSON('1 i * 2 i * ='), [false]);
  t.deepEqual(await fJSON('null 2 ='), [false]);
  t.deepEqual(await fJSON('nan 2 ='), [false]);
  t.deepEqual(await fJSON('{ x: 1 } { x: 2 } ='), [false]);
  t.deepEqual(await fJSON('"1/1/1990" date "1/2/1990" date ='), [false]);
});

// immutable tests

test('immutable array actions', async t => {
  t.deepEqual(await fValues('[ 1 ] dup 2 <<'), [[1], [1, 2]]);
  t.deepEqual(await fValues('[ 1 ] dup 2 swap >>'), [[1], [2, 1]]);
  t.deepEqual(await fValues('[ 1 ] dup [ 2 ] +'), [[1], [1, 2]]);
});

test('immutable object actions', async t => {
  const first = 'Manfred';
  const last = 'Von Thun';
  t.deepEqual(await fJSON('{ first: "Manfred" } dup { last: "Von Thun" } +'), [
    { first },
    { first, last }
  ]);
  t.deepEqual(await fJSON('{ first: "Manfred" } dup { last: "Von Thun" } <<'), [
    { first },
    { first, last }
  ]);
  t.deepEqual(await fJSON('{ first: "Manfred" } dup { last: "Von Thun" } >>'), [
    { first },
    { first, last }
  ]);
});

test('immutable sto', async t => {
  const first = 'Manfred';
  const last = 'Von Thun';
  t.deepEqual(
    await fJSON(`
    { } name: sto
    name
    name { first: "Manfred" } <<
    name { last: "Von Thun" } <<
    name
  `),
    [{}, { first }, { last }, {}]
  );
});

test('atoms are not executed by stack actions', async t => {
  const a = {'@@Action': 'a'};
  const b = {'@@Action': 'b'};
  t.deepEqual(await fJSON('a: dup'), [a, a]);
  t.deepEqual(await fJSON('true a: b: choose'), [a]);
  t.deepEqual(await fJSON('false a: b: choose'), [b]);
  t.deepEqual(await fJSON('a: b: q< drop q>'), [b]);
  t.deepEqual(await fJSON('[a: b:] 1 @'), [{'@@Action': b}]); // fix this
  t.deepEqual(await fJSON('[a: b:] unstack'), [{'@@Action': a}, {'@@Action': b}]); // fix this
});

test('can perform actions from module', async t => {
  t.deepEqual(await fValues('5 core.pred'), [5, 4]);
  t.deepEqual(await fValues('12 math.!'), [479001600]);
});

test('postfix "macros"', async t => {
  t.deepEqual(await fValues('5:pred'), [5, 4]);
  t.deepEqual(await fValues('12:!'), [479001600]);
  t.deepEqual(await fValues('1000 10:logn'), [3]);
  t.deepEqual(await fValues('"a" 5:dupn'), ['a', 'a', 'a', 'a', 'a', 'a']);
});

test('prefix macros', async t => {
  t.deepEqual(await fValues('pred:(5).'), [5, 4]);
  t.deepEqual(await fValues('!:(12).'), [479001600]);
  t.deepEqual(await fValues('+:(5,4).'), [9]);
  t.deepEqual(await fValues('+:(pred:(5).).'), [9]);
  t.deepEqual(await fValues('+:(*:(5,6)., *:(5,2).).'), [40]);
  t.deepEqual(await fValues('logn:(1000, 10).'), [3]);
  t.deepEqual(await fValues('!:(2 6 *).'), [479001600]);
  t.deepEqual(await fValues('regexp:"/a./".'), [/a./]);
  t.deepEqual(await fValues('[i *](10).'), [new Complex(0, 10)]);
});

test('length', async t => {
  t.deepEqual(await fJSON('null ln'), [0]);
});

test('base, pos integers', async t => {
  t.deepEqual(await fJSON('5 16 base'), ['0x5']);
  t.deepEqual(await fJSON('5 2 base'), ['0b101']);

  t.deepEqual(await fJSON('3735928559 16 base'), ['0xDEADBEEF']);
  t.deepEqual(await fJSON('3735928559 2 base'), ['0b11011110101011011011111011101111']);

  t.deepEqual(await fJSON('18446744073709551615 16 base'), ['0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(await fJSON('18446744073709551615 10 base'), ['18446744073709551615']);
  t.deepEqual(await fJSON('18446744073709551615 8 base'), ['0o1777777777777777777777']);
  t.deepEqual(await fJSON('18446744073709551615 4 base'), ['33333333333333333333333333333333']);
  t.deepEqual(await fJSON('18446744073709551615 2 base'), ['0b1111111111111111111111111111111111111111111111111111111111111111']);
});

test('base, neg integers', async t => {
  t.deepEqual(await fJSON('-3735928559 16 base'), ['-0xDEADBEEF']);
  t.deepEqual(await fJSON('-18446744073709551615 16 base'), ['-0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(await fJSON('-18446744073709551615 10 base'), ['-18446744073709551615']);
  t.deepEqual(await fJSON('-18446744073709551615 8 base'), ['-0o1777777777777777777777']);
  t.deepEqual(await fJSON('-18446744073709551615 2 base'), ['-0b1111111111111111111111111111111111111111111111111111111111111111']);
});

test('base, pos floats', async t => {
  t.deepEqual(await fJSON('0.125 16 base'), ['0x0.2']);
  t.deepEqual(await fJSON('0.125 10 base'), ['0.125']);
  t.deepEqual(await fJSON('0.125 8 base'), ['0o0.1']);
  // t.deepEqual(await fJSON('0.125 4 base'), ['0.02']);
  t.deepEqual(await fJSON('0.125 2 base'), ['0b0.001']);

  // t.deepEqual(await fJSON('123456789.87654321 2 base'), ['0b111010110111100110100010101.1110000001100101001000101100010001111011']);
});

test('base, neg floats', async t => {
  t.deepEqual(await fJSON('-0.125 16 base'), ['-0x0.2']);
  t.deepEqual(await fJSON('-0.125 10 base'), ['-0.125']);
  t.deepEqual(await fJSON('-0.125 8 base'), ['-0o0.1']);
  t.deepEqual(await fJSON('-0.125 2 base'), ['-0b0.001']);
});

test('base with inf and nan', async t => {
  t.deepEqual(await fJSON('nan 16 base'), ['NaN']);
  t.deepEqual(await fJSON('Infinity 16 base'), ['Infinity']);
  t.deepEqual(await fJSON('-Infinity 16 base'), ['-Infinity']);
});

test('hex, bin', async t => {
  t.deepEqual(await fJSON('18446744073709551615 hex'), ['0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(await fJSON('18446744073709551615 bin'), ['0b1111111111111111111111111111111111111111111111111111111111111111']);
  t.deepEqual(await fJSON('18446744073709551615 oct'), ['0o1777777777777777777777']);

  t.deepEqual(await fJSON('0.125 hex'), ['0x0.2']);

  t.deepEqual(await fJSON('-18446744073709551615 hex'), ['-0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(await fJSON('-18446744073709551615 bin'), ['-0b1111111111111111111111111111111111111111111111111111111111111111']);
  t.deepEqual(await fJSON('-0.125 hex'), ['-0x0.2']);
});

/* test('should <=> with nan, null', async t => {  // todo: better comparisons with NaN
  t.deepEqual(await fValues('nan nan <=>'), [0]);
  t.deepEqual(await fValues('null null <=>'), [0]);

  t.deepEqual(await fValues('null nan <=>'), [NaN]);
  t.deepEqual(await fValues('nan null <=>'), [NaN]);

  t.deepEqual(await fValues('null -Infinity <=>'), [-1]);
  t.deepEqual(await fValues('-Infinity null <=>'), [1]);
}); */

test('should div rem', async t => {
  t.deepEqual(await fValues('5 2 divrem'), [2, 1]);
});

test('integer number formats', async t => {
  t.deepEqual(await fValues('5'), [5]);
  t.deepEqual(await fValues('+5'), [5]);
});

test('decimal number formats', async t => {
  t.deepEqual(await fValues('0.5'), [0.5]);
  t.deepEqual(await fValues('.5'), [0.5]);
  t.deepEqual(await fValues('+.5e1'), [5]);
  t.deepEqual(await fValues('+5e0'), [5]);
  t.deepEqual(await fValues('+5e+0'), [5]);
  t.deepEqual(await fValues('+5e-0'), [5]);
  t.deepEqual(await fValues('+5e-9'), [5e-9]);
  t.deepEqual(await fValues('+5e+9'), [5e+9]);
  t.deepEqual(await fValues('+5e+10'), [5e+10]);
});

test('integer precent formats', async t => {
  t.deepEqual(await fValues('5%'), [0.05]);
  t.deepEqual(await fValues('+5%'), [0.05]);
  t.deepEqual(await fValues('-5%'), [-0.05]);
});

test('hexadecimal integer formats', async t => {
  t.deepEqual(await fValues('0xDEAD'), [0xDEAD]);
  t.deepEqual(await fValues('-0xBEEF'), [-0xBEEF]);
});

test('hexadecimal float formats', async t => {
  t.deepEqual(await fValues('0xDEAD.BEEF'), [0xDEADBEEF / 2 ** 16]);
  t.deepEqual(await fValues('-0xDEAD.BEEF'), [-0xDEADBEEF / 2 ** 16]);
  t.deepEqual(await fValues('0x1.1p5'), [34]);
});

test('underscore seperators', async t => {
  t.deepEqual(await fValues('5_000'), [5000]);
  t.deepEqual(await fValues('5_000_000'), [5000000]);
  t.deepEqual(await fValues('+5_000e+6'), [5e+9]);
  t.deepEqual(await fValues('+5_000_000e+3'), [5e+9]);
  t.deepEqual(await fValues('+5_000.000_000e+1_0'), [5e+13]);
  t.deepEqual(await fValues('-5_000.000_000e-1_0'), [-5e-7]);
});

test('underscore seperators hexadecimal integer formats', async t => {
  t.deepEqual(await fValues('0xDE_AD'), [0xDEAD]);
  t.deepEqual(await fValues('-0xBE_EF'), [-0xBEEF]);
  t.deepEqual(await fValues('0xDE_AD_BE_EF'), [0xDEADBEEF]);
});

test('locals don\'t collide with definitions', async t => {
  t.deepEqual(await fValues(`
    x: 128 ;
    y: [ x x + ] ;;
    [
      x: 256 ;
      y
    ] fork
  `), [ [ 256 ] ]);
});

test('should resolve', async t => {
  t.regex(await fValue('"core" resolve'), /^file:.*core$/);
  t.regex(await fValue('"core.ff" resolve'), /^file:.*core.ff$/);
  t.regex(await fValue('"/home/core.ff" resolve'), /^file:\/\/\/.*home\/core.ff$/);
  t.regex(await fValue('"file:///home/core.ff" resolve'), /^file:\/\/\/.*home\/core.ff$/);
  t.deepEqual(await fValue('"http://www.home.com/core.ff" resolve'), 'http://home.com/core.ff');
});

test('keywords are case insenstivive', async t => {
  t.deepEqual(await fValues('null NULL'), [null, null]);
  t.deepEqual(await fValues('nan NAN NaN nAn'), [NaN, NaN, NaN, NaN]);
  t.deepEqual(await fString('i I'), '0+1i,0+1i');
  t.deepEqual(await fValues('true TRUE tRue'), [true, true, true]);
  t.deepEqual(await fValues('false FALSE fAlsE'), [false, false, false]);
});

