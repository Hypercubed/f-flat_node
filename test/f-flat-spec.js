import test from 'ava';
import {
  F,
  fSyncJSON,
  fSyncStack,
  fSyncValues,
  fSyncString,
  Word,
  Sentence,
  Decimal,
  D, V,
  Complex
} from './setup';

const future = { '@@Future': { $undefined: true } };

test('setup', t => {
  t.not(new F().eval, undefined);
  t.not(new F().promise, undefined);
  t.not(new F().depth, undefined);
  t.deepEqual(fSyncJSON(''), [], 'should create an empty stack');
  t.deepEqual(
    fSyncValues('1 2 3'),
    [1, 2, 3],
    'should create an non-empty stack'
  );
});

test('should be chainable', t => {
  const f = new F('1').eval('2 3');
  t.deepEqual(f.toJSON(), [1, 2, 3].map(D));
  f.eval('4 +');
  t.deepEqual(f.toJSON(), [1, 2, 7].map(D));
});

test('should push numeric values', t => {
  t.deepEqual(fSyncValues('1 2 -3 +5'), [1, 2, -3, 5], 'integers');
  t.deepEqual(fSyncValues('1.1 2.2 -3.14, +2.17'), [1.1, 2.2, -3.14, 2.17], 'floats');
  t.deepEqual(
    fSyncValues('1.1e-1 2.2e+2 -3.14e-1'),
    [0.11, 220, -0.314],
    'expoential'
  );
  t.deepEqual(fSyncValues('10_000 1_00'), [10000, 100], 'seperators');
});

test('should push hexidecimal numeric values', t => {
  t.deepEqual(fSyncValues('0x5 0x55 0xff'), [5, 85, 255], 'integers');
  t.deepEqual(
    fSyncValues('0x5.5 0xff.ff'),
    [85 * Math.pow(16, -1), 65535 * Math.pow(16, -2)],
    'floats'
  );
  t.deepEqual(
    fSyncValues('0x1p+1 0xffp-2'),
    [2, 255 * Math.pow(2, -2)],
    'power of 2'
  );
});

test('should push binary numeric values', t => {
  t.deepEqual(fSyncValues('0b1 0b10 0b11'), [1, 2, 3], 'integers');
  t.deepEqual(
    fSyncValues('0b1.1 0b11.11'),
    [3 * Math.pow(2, -1), 15 * Math.pow(2, -2)],
    'floats'
  );
  t.deepEqual(
    fSyncValues('0b1p+1 0b11p-2'),
    [2, 3 * Math.pow(2, -2)],
    'power of 2'
  );
});

test('should drop swap slip', t => {
  t.deepEqual(fSyncValues('1 2 drop 3'), [1, 3], 'should drop');
  t.deepEqual(fSyncValues('1 2 swap 3'), [2, 1, 3], 'should swap');
  t.deepEqual(fSyncValues('[ 1 2 + ] 4 slip'), [3, 4], 'should slip');
});

test('should dup', t => {
  t.deepEqual(fSyncValues('1 2 dup 3'), [1, 2, 2, 3]);
  t.deepEqual(fSyncValues('[ 1 2 + ] dup swap drop eval'), [3]);
});

test('should dup cl1', t => {
  const f = new F().eval('[ 1 2 3 ] dup');
  t.deepEqual(V(f.stack), [[1, 2, 3], [1, 2, 3]]);
  t.is(f.stack[0], f.stack[1]);
});

test('should clr', t => {
  t.deepEqual(fSyncValues('1 2 clr 3'), [3]);
});

test('should stack unstack', t => {
  t.deepEqual(fSyncValues('1 2 3 stack'), [[1, 2, 3]], 'should stack');
  t.deepEqual(fSyncValues('[ 1 2 3 ] <-'), [1, 2, 3], 'should unstack');
});

test('should choose', t => {
  t.deepEqual(fSyncValues('true 3 4 choose'), [3]);
  t.deepEqual(fSyncValues('false 3 4 choose'), [4]);
  t.deepEqual(fSyncValues('5 false [ 2 + ] [ 2 * ] branch'), [10]);
  t.deepEqual(fSyncValues('5 true [ 2 + ] [ 2 * ] branch'), [7]);
});

test('in/fork', t => {
  t.deepEqual(fSyncValues('[ 2 1 + ] in'), [[3]], 'should evaluate list');
  t.deepEqual(
    fSyncJSON('"before" "a" sto [ a ] in'),
    [['before']],
    'fork should have access to parent scope'
  );
  t.deepEqual(
    fSyncJSON('"outer" "a" sto [ "inner" "a" sto a ] fork a'),
    [['inner'], 'outer'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    fSyncJSON('"outer" "a" sto [ "inner" "b" sto a ] in b'),
    [['outer'], 'inner'],
    'in does not isolate child scope'
  );
});

test('clr in in and fork', t => {
  // t.deepEqual(fSyncJSON('1 2 [ 2 1 clr 3 ] in'), [[3]], 'should evaluate list');
  t.deepEqual(
    fSyncValues('1 2 [ 2 1 clr 3 ] fork'),
    [1, 2, [3]],
    'should evaluate list'
  );
});

test('map', t => {
  t.deepEqual(
    fSyncValues('[ 3 2 1 ] [ 2 * ] map'),
    [[6, 4, 2]],
    'should map quotes over quotes'
  );
  t.deepEqual(
    fSyncValues('[ -3 -2 -1 ] abs: map'),
    [[3, 2, 1]],
    'should map words over quotes'
  );
});

test('should undo on error', t => {
  const f = new F('1 2').eval();
  t.deepEqual(V(f), [1, 2]);

  t.throws(() => f.eval('+ whatwhat'));
  t.deepEqual(V(f), [1, 2]);
});

test('should undo', t => {
  const f = new F('1').eval();

  f.eval('2');
  t.deepEqual(V(f), [1, 2]);

  f.eval('+');
  t.deepEqual(V(f), [3]);

  f.eval('undo');
  t.deepEqual(V(f), [1, 2]);

  f.eval('undo');
  t.deepEqual(V(f), [1]);
});

/* test('apply', t => {
  t.deepEqual(fSyncValues('10 [ 9 4 ] max: rcl ||>'), [10, 9]);
  t.deepEqual(fSyncValues('10 [ 9 4 ] min: rcl ||>'), [10, 3]);
}); */

/* test('apply', t => {
  t.plan(2);
  t.deepEqual(fSyncJSON('10 [ 9 4 3 ] \\max rcl ||>', [10, 9]);
  t.deepEqual(fSyncJSON('10 [ 9 4 3 ] \\min rcl ||>', [10, 3]);
}); */

test('symbols', t => {
  t.deepEqual(fSyncJSON('#test dup ='), [true]);
  t.deepEqual(fSyncJSON('#test #test ='), [false]);
});

test('fork', t => {
  t.deepEqual(fSyncValues('[1 2 +] fork'), [[3]], 'fork');
});

test('others', t => {
  t.deepEqual(fSyncJSON('get-log-level set-log-level'), [], 'set-log-level');
  t.deepEqual(
    fSyncValues('1 2 + [ 4 5 ] -> 6 7'),
    [3, 4, 5],
    'replace queue'
  );
});

test('of', t => {
  t.deepEqual(fSyncJSON('"abc" 123 of'), ['123']);
  t.deepEqual(fSyncValues('123 "456" of'), [456]);
});

test('empty', t => {
  t.deepEqual(fSyncJSON('"abc" empty'), ['']);
  t.deepEqual(fSyncValues('123 empty'), [0]);
});

test('nop', t => {
  t.deepEqual(fSyncJSON('"abc" nop'), ['abc']);
  // t.deepEqual(fSyncJSON('"abc" id'), ['abc']);
});

test('depth', t => {
  t.deepEqual(fSyncJSON('"abc" depth'), ['abc', 1]); // todo: should return a decimal
  t.deepEqual(fSyncValues('"abc" 123 depth'), ['abc', 123, 2]);
});

test('is?', t => {
  t.deepEqual(fSyncJSON('"abc" "abc" is?'), [true]);
  t.deepEqual(fSyncJSON('["abc"] ["abc"] is?'), [false]);
  t.deepEqual(fSyncJSON('["abc"] dup is?'), [true]);
});

test('others2', t => {
  const def = new Word('def').toJSON();
  const abc = new Word('abc').toJSON();
  const plus = new Word('+').toJSON();

  t.deepEqual(fSyncJSON('"abc" "b" indexof'), [1], 'indexof');
  t.deepEqual(fSyncJSON('"abc" "def" swap'), ['def', 'abc'], 'swap strings');
  t.deepEqual(fSyncJSON('abc: def: swap'), [def, abc], 'swap atoms');
  t.deepEqual(fSyncJSON('abc: dup'), [abc, abc], 'dup atoms');
  t.deepEqual(
    fSyncJSON('[2 1 +] unstack'),
    [D(2), D(1), plus],
    'unstack should not eval'
  );
});

test('should slice', t => {
  t.deepEqual(fSyncJSON('["a" "b" "c" "d"] 0 1 slice'), [['a']]);
  t.deepEqual(fSyncJSON('["a" "b" "c" "d"] 0 -1 slice'), [['a', 'b', 'c']]);
});

test('should split at', t => {
  t.deepEqual(fSyncJSON('["a" "b" "c" "d"] 1 splitat'), [
    ['a'],
    ['b', 'c', 'd']
  ]);
  t.deepEqual(fSyncJSON('["a" "b" "c" "d"] -1 splitat'), [
    ['a', 'b', 'c'],
    ['d']
  ]);
});

test('filter and reduce', t => {
  t.deepEqual(
    fSyncValues('10 integers [ even? ] filter'),
    [[2, 4, 6, 8, 10]],
    'filter'
  );
  t.deepEqual(fSyncValues('10 integers 0 [ + ] reduce'), [55], 'reduce');
  t.deepEqual(fSyncValues('10 integers 1 [ * ] reduce'), [3628800], 'reduce');
  t.deepEqual(fSyncValues('10 integers [ + ] reduce*'), [55], 'reduce');
  t.deepEqual(fSyncValues('10 integers [ * ] reduce*'), [3628800], 'reduce');
});

test('zip, zipwith and dot', t => {
  t.deepEqual(
    fSyncValues('[ 1 2 3 ] [ 4 5 6 ] zip'),
    [[1, 4, 2, 5, 3, 6]],
    'zip'
  );
  t.deepEqual(
    fSyncValues('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in'),
    [[5, 7, 9]],
    'zipwith'
  );
  t.deepEqual(fSyncValues('[ 1 2 3 ] [ 4 5 6 ] dot'), [32], 'dot');
  t.deepEqual(fSyncValues('[ 1 2 3 4 ] [ 4 5 6 ] dot'), [32], 'dot');
});

/* test('operations with null', t => {
  t.deepEqual(fSyncJSON('null 5 +'), [5], 'add');
  t.deepEqual(fSyncJSON('5 null +'), [5], 'add');
  t.deepEqual(fSyncJSON('null 5 -'), [-5], 'sub');
  t.deepEqual(fSyncJSON('5 null -'), [5], 'sub');
});

test('operations with null, cont', t => {
  t.deepEqual(fSyncJSON('null 5 *'), [0]);
  t.deepEqual(fSyncJSON('5 null *'), [0]);
  t.deepEqual(fSyncJSON('null 5 /'), [0]);
  t.deepEqual(fSyncJSON('5 null /'), [null]); // should be infinity, bad JSON conversion
});

test('operations with null, cont2', t => {
  t.deepEqual(fSyncJSON('null 5 <<'), [0]);
  t.deepEqual(fSyncJSON('5 null <<'), [5]);
  t.deepEqual(fSyncJSON('null 5 >>'), [0]);
  t.deepEqual(fSyncJSON('5 null >>'), [5]);
  t.deepEqual(fSyncJSON('null in'), [[null]]);
}); */

test('errors on unknown command, sync', t => {
  t.throws(() => {
    new F().eval('abc');
  });
});

test('errors on unknown command in child', t => {
  t.throws(() => {
    new F().eval('[ abc ] in');
  });
});

test('errors on async command in eval', t => {
  t.throws(() => {
    new F().eval('[ 1 2 + ] await');
  });
});

test('errors on async child in eval', t => {
  t.throws(() => {
    new F().eval('[ 100 sleep ] in');
  });
});

test('can spawn a future in sync', t => {
  t.deepEqual(fSyncJSON('[ 1 2 + 100 sleep ] spawn 3 4 +'), [
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
  const f = new F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  t.deepEqual(f.toJSON(), [future, new Decimal(9).toJSON()]);

  // await delay(2000);

  // t.deepEqual(f.toJSON(), [{type: '@@Future', value: [3628800]}, 9]);
  // t.deepEqual(f.eval('await slip').toJSON(), [3628800, 9]);
});

test('pick', t => {
  t.deepEqual(fSyncValues('{a: 1} a: @'), [1]);
  t.deepEqual(fSyncValues('{a: 2} "a" @'), [2]);
  t.deepEqual(fSyncValues('{a: 3} b: @'), [null]);
  t.deepEqual(fSyncValues('{a: {b: 5}} "a.b" @'), [5]);
  t.deepEqual(fSyncValues('{a: {b: 5}} a.b: @'), [5]);
  t.deepEqual(fSyncValues('{a: 7} "A" lcase @'), [7]);
  t.deepEqual(fSyncValues('{a: 11} b: @ 13 orelse'), [13]);
  t.deepEqual(
    fSyncValues('[ a: @ ] : pickfunc: sto { a: 17 } pickfunc'),
    [17]
  );
});

test('pick into object', t => {
  t.deepEqual(fSyncJSON('{ a: { a: 1 } a: @ }'), [{ a: D(1) }]);
  t.deepEqual(fSyncJSON('{ a: 2 } q< { a: q> over @ }'), [{ a: D(2) }]);
  t.deepEqual(fSyncJSON('{ a: 3 } q< { b: q> a: @ }'), [{ b: D(3) }]);
  // t.deepEqual(fSyncJSON('{ a: 23 } { a: } @'), [{a: 23}]);
});

test('pick into object with default', t => {
  t.deepEqual(fSyncJSON('{ a: { a: 1 } b: @ 2 orelse }'), [{ a: D(2) }]);
  t.deepEqual(fSyncJSON('{ a: 3 } q< { b: q> over @ 5 orelse }'), [
    { b: D(5) }
  ]);
  t.snapshot(fSyncStack('{ a: 7 } q< { c: q> b: @ 11 orelse }')); // [{ c: 11 }]
});

test('pick into array', t => {
  t.deepEqual(fSyncValues('( { a: 1 } a: @ )'), [[1]]);
});

test('pick from array', t => {
  t.deepEqual(fSyncValues('[1 2] 0 @'), [1]);
  t.deepEqual(fSyncValues('[3 5] 1 @'), [5]);
  t.deepEqual(fSyncValues('([7 11] 0 @)'), [[7]]);
});

test('actions', t => {
  const ev = new Word('eval').toJSON();
  const sl = new Word('slip').toJSON();
  const actionEval = new Sentence(D([1, 2, ev])).toJSON();
  const actionSlip = new Sentence(D([1, 2, sl])).toJSON();

  t.deepEqual(fSyncJSON('eval:'), [ev]);
  t.deepEqual(fSyncJSON('eval: :'), [ev]);
  t.deepEqual(fSyncJSON('[ eval ] :'), [ev]); // todo: This is open the array
  t.deepEqual(fSyncJSON('[ 1 2 eval ] :'), [actionEval]);
  t.deepEqual(fSyncJSON('slip:'), [sl]);
  t.deepEqual(fSyncJSON('slip: :'), [sl]);
  t.deepEqual(fSyncJSON('[ slip ] :'), [sl]);
  t.deepEqual(fSyncJSON('[ 1 2 slip ] :'), [actionSlip]);
});

test('=', t => {
  t.deepEqual(fSyncJSON('1 1 ='), [true]);
  t.deepEqual(fSyncJSON('1 i * 1 i * ='), [true]);
  t.deepEqual(fSyncJSON('null null ='), [true]);
  t.deepEqual(fSyncJSON('nan nan ='), [true]); // todo: This is open the array
  t.deepEqual(fSyncJSON('{} {} ='), [true]);
  t.deepEqual(fSyncJSON('{ x: 1 } { x: 1 } ='), [true]);
  t.deepEqual(fSyncJSON('"1/1/1990" date "1/1/1990" date ='), [true]);
});

test('!=', t => {
  t.deepEqual(fSyncJSON('1 2 ='), [false]);
  t.deepEqual(fSyncJSON('1 i * 2 i * ='), [false]);
  t.deepEqual(fSyncJSON('null 2 ='), [false]);
  t.deepEqual(fSyncJSON('nan 2 ='), [false]);
  t.deepEqual(fSyncJSON('{ x: 1 } { x: 2 } ='), [false]);
  t.deepEqual(fSyncJSON('"1/1/1990" date "1/2/1990" date ='), [false]);
});

// immutable tests

test('immutable array actions', t => {
  t.deepEqual(fSyncValues('[ 1 ] dup 2 <<'), [[1], [1, 2]]);
  t.deepEqual(fSyncValues('[ 1 ] dup 2 swap >>'), [[1], [2, 1]]);
  t.deepEqual(fSyncValues('[ 1 ] dup [ 2 ] +'), [[1], [1, 2]]);
});

test('immutable object actions', t => {
  const first = 'Manfred';
  const last = 'Von Thun';
  t.deepEqual(fSyncJSON('{ first: "Manfred" } dup { last: "Von Thun" } +'), [
    { first },
    { first, last }
  ]);
  t.deepEqual(fSyncJSON('{ first: "Manfred" } dup { last: "Von Thun" } <<'), [
    { first },
    { first, last }
  ]);
  t.deepEqual(fSyncJSON('{ first: "Manfred" } dup { last: "Von Thun" } >>'), [
    { first },
    { first, last }
  ]);
});

test('immutable sto', t => {
  const first = 'Manfred';
  const last = 'Von Thun';
  t.deepEqual(
    fSyncJSON(`
    { } name: sto
    name
    name { first: "Manfred" } <<
    name { last: "Von Thun" } <<
    name
  `),
    [{}, { first }, { last }, {}]
  );
});

test('atoms are not executed by stack actions', t => {
  const a = {'@@Action': 'a'};
  const b = {'@@Action': 'b'};
  t.deepEqual(fSyncJSON('a: dup'), [a, a]);
  t.deepEqual(fSyncJSON('true a: b: choose'), [a]);
  t.deepEqual(fSyncJSON('false a: b: choose'), [b]);
  t.deepEqual(fSyncJSON('a: b: q< drop q>'), [b]);
  t.deepEqual(fSyncJSON('[a: b:] 1 @'), [{'@@Action': b}]); // fix this
  t.deepEqual(fSyncJSON('[a: b:] unstack'), [{'@@Action': a}, {'@@Action': b}]); // fix this
});

test('can perform actions from module', t => {
  t.deepEqual(fSyncValues('5 core.pred'), [5, 4]);
  t.deepEqual(fSyncValues('12 math.!'), [479001600]);
});

test('macros', t => {
  t.deepEqual(fSyncValues('pred:(5).'), [5, 4]);
  t.deepEqual(fSyncValues('!:(12).'), [479001600]);
  t.deepEqual(fSyncValues('+:(5,4).'), [9]);
  t.deepEqual(fSyncValues('+:(pred:(5).).'), [9]);
  t.deepEqual(fSyncValues('+:(*:(5,6)., *:(5,2).).'), [40]);
  t.deepEqual(fSyncValues('logn:(1000, 10).'), [3]);
  t.deepEqual(fSyncValues('!:(2 6 *).'), [479001600]);
  t.deepEqual(fSyncValues('regexp:"/a./".'), [/a./]);
  t.deepEqual(fSyncValues('[i *](10).'), [new Complex(0, 10)]);
});

test('length', t => {
  t.deepEqual(fSyncJSON('null ln'), [0]);
});

test('base, pos integers', t => {
  t.deepEqual(fSyncJSON('3735928559 16 base'), ['0xDEADBEEF']);
  t.deepEqual(fSyncJSON('3735928559 2 base'), ['0b11011110101011011011111011101111']);

  t.deepEqual(fSyncJSON('18446744073709551615 16 base'), ['0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(fSyncJSON('18446744073709551615 10 base'), ['18446744073709551615']);
  t.deepEqual(fSyncJSON('18446744073709551615 8 base'), ['0o1777777777777777777777']);
  t.deepEqual(fSyncJSON('18446744073709551615 4 base'), ['33333333333333333333333333333333']);
  t.deepEqual(fSyncJSON('18446744073709551615 2 base'), ['0b1111111111111111111111111111111111111111111111111111111111111111']);
});

test('base, neg integers', t => {
  t.deepEqual(fSyncJSON('-3735928559 16 base'), ['-0xDEADBEEF']);
  t.deepEqual(fSyncJSON('-18446744073709551615 16 base'), ['-0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(fSyncJSON('-18446744073709551615 10 base'), ['-18446744073709551615']);
  t.deepEqual(fSyncJSON('-18446744073709551615 8 base'), ['-0o1777777777777777777777']);
  t.deepEqual(fSyncJSON('-18446744073709551615 2 base'), ['-0b1111111111111111111111111111111111111111111111111111111111111111']);
});

test('base, pos floats', t => {
  t.deepEqual(fSyncJSON('0.125 16 base'), ['0x0.2']);
  t.deepEqual(fSyncJSON('0.125 10 base'), ['0.125']);
  t.deepEqual(fSyncJSON('0.125 8 base'), ['0o0.1']);
  // t.deepEqual(fSyncJSON('0.125 4 base'), ['0.02']);
  t.deepEqual(fSyncJSON('0.125 2 base'), ['0b0.001']);

  // t.deepEqual(fSyncJSON('123456789.87654321 2 base'), ['0b111010110111100110100010101.1110000001100101001000101100010001111011']);
});

test('base, neg floats', t => {
  t.deepEqual(fSyncJSON('-0.125 16 base'), ['-0x0.2']);
  t.deepEqual(fSyncJSON('-0.125 10 base'), ['-0.125']);
  t.deepEqual(fSyncJSON('-0.125 8 base'), ['-0o0.1']);
  t.deepEqual(fSyncJSON('-0.125 2 base'), ['-0b0.001']);
});

test('base with inf and nan', t => {
  t.deepEqual(fSyncJSON('nan 16 base'), ['NaN']);
  t.deepEqual(fSyncJSON('Infinity 16 base'), ['Infinity']);
  t.deepEqual(fSyncJSON('-Infinity 16 base'), ['-Infinity']);
});

test('hex, bin', t => {
  t.deepEqual(fSyncJSON('18446744073709551615 hex'), ['0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(fSyncJSON('18446744073709551615 bin'), ['0b1111111111111111111111111111111111111111111111111111111111111111']);
  t.deepEqual(fSyncJSON('18446744073709551615 oct'), ['0o1777777777777777777777']);

  t.deepEqual(fSyncJSON('0.125 hex'), ['0x0.2']);

  t.deepEqual(fSyncJSON('-18446744073709551615 hex'), ['-0xFFFFFFFFFFFFFFFF']);
  t.deepEqual(fSyncJSON('-18446744073709551615 bin'), ['-0b1111111111111111111111111111111111111111111111111111111111111111']);
  t.deepEqual(fSyncJSON('-0.125 hex'), ['-0x0.2']);
});

/* test('should <=> with nan, null', t => {  // todo: better comparisons with NaN
  t.deepEqual(fSyncValues('nan nan <=>'), [0]);
  t.deepEqual(fSyncValues('null null <=>'), [0]);

  t.deepEqual(fSyncValues('null nan <=>'), [NaN]);
  t.deepEqual(fSyncValues('nan null <=>'), [NaN]);

  t.deepEqual(fSyncValues('null -Infinity <=>'), [-1]);
  t.deepEqual(fSyncValues('-Infinity null <=>'), [1]);
}); */

test('should div rem', t => {  // todo: better comparisons with NaN
  t.deepEqual(fSyncValues('5 2 divrem'), [2, 1]);
});
