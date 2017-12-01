import test from 'ava';
import { F, fSync, Action } from './setup';

const future = { '@@Future': { '$undefined':true } };

test('setup', t => {
  t.not(new F().eval, undefined);
  t.not(new F().promise, undefined);
  t.not(new F().depth, undefined);
  t.deepEqual(fSync(''), [], 'should create an empty stack');
  t.deepEqual(fSync('1 2 3'), [1, 2, 3], 'should create an non-empty stack');
});

test('should be chainable', t => {
  const f = new F('1').eval('2 3');
  t.deepEqual(f.toJSON(), [1, 2, 3]);
  f.eval('4 +');
  t.deepEqual(f.toJSON(), [1, 2, 7]);
});

test('should push numeric values', t => {
  t.deepEqual(fSync('1 2 -3'), [1, 2, -3], 'integers');
  t.deepEqual(fSync('1.1 2.2 -3.14'), [1.1, 2.2, -3.14], 'floats');
  t.deepEqual(
    fSync('1.1e-1 2.2e+2 -3.14e-1'),
    [0.11, 220, -0.314],
    'expoential'
  );
});

test('should push hexidecimal numeric values', t => {
  t.deepEqual(fSync('0x5 0x55 0xff'), [5, 85, 255], 'integers');
  t.deepEqual(
    fSync('0x5.5 0xff.ff'),
    [85 * Math.pow(16, -1), 65535 * Math.pow(16, -2)],
    'floats'
  );
  t.deepEqual(
    fSync('0x1p+1 0xffp-2'),
    [2, 255 * Math.pow(2, -2)],
    'power of two'
  );
});

test('should push binary numeric values', t => {
  t.deepEqual(fSync('0b1 0b10 0b11'), [1, 2, 3], 'integers');
  t.deepEqual(
    fSync('0b1.1 0b11.11'),
    [3 * Math.pow(2, -1), 15 * Math.pow(2, -2)],
    'floats'
  );
  t.deepEqual(
    fSync('0b1p+1 0b11p-2'),
    [2, 3 * Math.pow(2, -2)],
    'power of two'
  );
});

test('should drop swap slip', t => {
  t.deepEqual(fSync('1 2 drop 3'), [1, 3], 'should drop');
  t.deepEqual(fSync('1 2 swap 3'), [2, 1, 3], 'should swap');
  t.deepEqual(fSync('[ 1 2 + ] 4 slip'), [3, 4], 'should slip');
});

test('should dup', t => {
  t.deepEqual(fSync('1 2 dup 3'), [1, 2, 2, 3]);
  t.deepEqual(fSync('[ 1 2 + ] dup swap drop eval'), [3]);
});

test('should dup clone', t => {
  const f = new F().eval('[ 1 2 3 ] dup');
  t.deepEqual(f.toJSON(), [[1, 2, 3], [1, 2, 3]]);
  t.is(f.stack[0], f.stack[1]);
});

test('should clr', t => {
  t.deepEqual(fSync('1 2 clr 3'), [3]);
});

test('should stack unstack', t => {
  t.deepEqual(fSync('1 2 3 stack'), [[1, 2, 3]], 'should stack');
  t.deepEqual(fSync('[ 1 2 3 ] <-'), [1, 2, 3], 'should unstack');
});

test('should choose', t => {
  t.deepEqual(fSync('true 3 4 choose'), [3]);
  t.deepEqual(fSync('false 3 4 choose'), [4]);
  t.deepEqual(fSync('5 false [ 2 + ] [ 2 * ] branch'), [10]);
  t.deepEqual(fSync('5 true [ 2 + ] [ 2 * ] branch'), [7]);
});

test('in/fork', t => {
  t.deepEqual(fSync('[ 2 1 + ] in'), [[3]], 'should evaluate list');
  t.deepEqual(
    fSync('"before" "a" sto [ a ] in'),
    [['before']],
    'fork should have access to parent scope'
  );
  t.deepEqual(
    fSync('"outer" "a" sto [ "inner" "a" sto a ] fork a'),
    [['inner'], 'outer'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    fSync('"outer" "a" sto [ "inner" "b" sto a ] in b'),
    [['outer'], 'inner'],
    'in does not isolate child scope'
  );
});

test('clr in in and fork', t => {
  // t.deepEqual(fSync('1 2 [ 2 1 clr 3 ] in'), [[3]], 'should evaluate list');
  t.deepEqual(
    fSync('1 2 [ 2 1 clr 3 ] fork'),
    [1, 2, [3]],
    'should evaluate list'
  );
});

test('map', t => {
  t.deepEqual(
    fSync('[ 3 2 1 ] [ 2 * ] map'),
    [[6, 4, 2]],
    'should map quotes over quotes'
  );
  t.deepEqual(
    fSync('[ -3 -2 -1 ] abs: map'),
    [[3, 2, 1]],
    'should map words over quotes'
  );
});

test('should undo on error', t => {
  const f = new F('1 2').eval();
  t.deepEqual(f.toJSON(), [1, 2]);

  t.throws(() => f.eval('+ whatwhat'));
  t.deepEqual(f.toJSON(), [1, 2]);
});

test('should undo', t => {
  const f = new F('1').eval();

  f.eval('2');
  t.deepEqual(f.toJSON(), [1, 2]);

  f.eval('+');
  t.deepEqual(f.toJSON(), [3]);

  f.eval('undo');
  t.deepEqual(f.toJSON(), [1, 2]);

  f.eval('undo');
  t.deepEqual(f.toJSON(), [1]);
});

test('apply', t => {
  t.deepEqual(fSync('10 [ 9 4 3 ] max: rcl ||>'), [10, 9]);
  t.deepEqual(fSync('10 [ 9 4 3 ] min: rcl ||>'), [10, 3]);
});

/* test('apply', t => {
  t.plan(2);
  t.deepEqual(fSync('10 [ 9 4 3 ] \\max rcl ||>', [10, 9]);
  t.deepEqual(fSync('10 [ 9 4 3 ] \\min rcl ||>', [10, 3]);
}); */

test('symbols', t => {
  t.deepEqual(fSync('#test dup ='), [true]);
  t.deepEqual(fSync('#test #test ='), [false]);
});

test('fork', t => {
  t.deepEqual(fSync('[1 2 +] fork'), [[3]], 'fork');
});

test('others', t => {
  t.deepEqual(fSync('get-log-level set-log-level'), [], 'set-log-level');
  t.deepEqual(fSync('1 2 + [ 4 5 ] -> 6 7'), [3, 4, 5], 'replace queue');
});

test('of', t => {
  t.deepEqual(fSync('"abc" 123 of'), ['123']);
  t.deepEqual(fSync('123 "456" of'), [456]);
});

test('empty', t => {
  t.deepEqual(fSync('"abc" empty'), ['']);
  t.deepEqual(fSync('123 empty'), [0]);
});

test('nop', t => {
  t.deepEqual(fSync('"abc" nop'), ['abc']);
  // t.deepEqual(fSync('"abc" id'), ['abc']);
});

test('depth', t => {
  t.deepEqual(fSync('"abc" depth'), ['abc', 1]);
  t.deepEqual(fSync('"abc" 123 depth'), ['abc', 123, 2]);
});

test('is?', t => {
  t.deepEqual(fSync('"abc" "abc" is?'), [true]);
  t.deepEqual(fSync('["abc"] ["abc"] is?'), [false]);
  t.deepEqual(fSync('["abc"] dup is?'), [true]);
});

test('others2', t => {
  const def = new Action('def').toJSON();
  const abc = new Action('abc').toJSON();
  const plus = new Action('+').toJSON();

  t.deepEqual(fSync('"abc" "b" indexof'), [1], 'indexof');
  t.deepEqual(fSync('"abc" "def" swap'), ['def', 'abc'], 'swap strings');
  t.deepEqual(
    fSync('abc: def: swap'),
    [def, abc],
    'swap atoms'
  );
  t.deepEqual(
    fSync('abc: dup'),
    [abc, abc],
    'dup atoms'
  );
  t.deepEqual(
    fSync('[2 1 +] unstack'),
    [2, 1, plus],
    'unstack should not eval'
  );
});

test('should slice', t => {
  t.deepEqual(fSync('["a" "b" "c" "d"] 0 1 slice'), [['a']]);
  t.deepEqual(fSync('["a" "b" "c" "d"] 0 -1 slice'), [['a', 'b', 'c']]);
});

test('should split at', t => {
  t.deepEqual(fSync('["a" "b" "c" "d"] 1 splitat'), [['a'], ['b', 'c', 'd']]);
  t.deepEqual(fSync('["a" "b" "c" "d"] -1 splitat'), [['a', 'b', 'c'], ['d']]);
});

test('filter and reduce', t => {
  t.deepEqual(
    fSync('10 integers [ even? ] filter'),
    [[2, 4, 6, 8, 10]],
    'filter'
  );
  t.deepEqual(fSync('10 integers 0 [ + ] reduce'), [55], 'reduce');
  t.deepEqual(fSync('10 integers 1 [ * ] reduce'), [3628800], 'reduce');
  t.deepEqual(fSync('10 integers [ + ] reduce*'), [55], 'reduce');
  t.deepEqual(fSync('10 integers [ * ] reduce*'), [3628800], 'reduce');
});

test('zip, zipwith and dot', t => {
  t.deepEqual(fSync('[ 1 2 3 ] [ 4 5 6 ] zip'), [[1, 4, 2, 5, 3, 6]], 'zip');
  t.deepEqual(
    fSync('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in'),
    [[5, 7, 9]],
    'zipwith'
  );
  t.deepEqual(fSync('[ 1 2 3 ] [ 4 5 6 ] dot'), [32], 'dot');
  t.deepEqual(fSync('[ 1 2 3 4 ] [ 4 5 6 ] dot'), [32], 'dot');
});

test('operations with null', t => {
  t.deepEqual(fSync('null 5 +'), [5], 'add');
  t.deepEqual(fSync('5 null +'), [5], 'add');
  t.deepEqual(fSync('null 5 -'), [-5], 'sub');
  t.deepEqual(fSync('5 null -'), [5], 'sub');
});

test('operations with null, cont', t => {
  t.deepEqual(fSync('null 5 *'), [0]);
  t.deepEqual(fSync('5 null *'), [0]);
  t.deepEqual(fSync('null 5 /'), [0]);
  t.deepEqual(fSync('5 null /'), [null]); // should be infinity, bad JSON conversion
});

test('operations with null, cont2', t => {
  t.deepEqual(fSync('null 5 <<'), [0]);
  t.deepEqual(fSync('5 null <<'), [5]);
  t.deepEqual(fSync('null 5 >>'), [0]);
  t.deepEqual(fSync('5 null >>'), [5]);
  t.deepEqual(fSync('null in'), [[null]]);
});

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
  t.deepEqual(fSync('[ 1 2 + 100 sleep ] spawn 3 4 +'), [
    future,
    7
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
  t.deepEqual(f.toJSON(), [future, 9]);

  // await delay(2000);

  // t.deepEqual(f.toJSON(), [{type: '@@Future', value: [3628800]}, 9]);
  // t.deepEqual(f.eval('await slip').toJSON(), [3628800, 9]);
});

test('regular expressions, test', t => {
  t.deepEqual(fSync('"abc" "/a./" test?'), [true]);
  t.deepEqual(fSync('"abc" "/a.$/" test?'), [false]);
  t.deepEqual(fSync('"abc" "/a.*$/" test?'), [true]);
  t.deepEqual(fSync('"bcd" "/a./" test?'), [false]);
});

test('regular expressions, replace', t => {
  t.deepEqual(fSync('"abc" "/a./" "X" replace'), ['Xc']);
  t.deepEqual(fSync('"abc" "/a.$/" "X" replace'), ['abc']);
  t.deepEqual(fSync('"abc" "/a.*$/" "X" replace'), ['X']);
  t.deepEqual(fSync('"bcd" "/a./" "X" replace'), ['bcd']);
});

test('pick', t => {
  t.deepEqual(fSync('{a: 1} a: @'), [1]);
  t.deepEqual(fSync('{a: 2} "a" @'), [2]);
  t.deepEqual(fSync('{a: 3} b: @'), [null]);
  t.deepEqual(fSync('{a: {b: 5}} "a.b" @'), [5]);
  t.deepEqual(fSync('{a: {b: 5}} a.b: @'), [5]);
  t.deepEqual(fSync('{a: 7} "A" lcase @'), [7]);
  t.deepEqual(fSync('{a: 11} b: @ 13 orelse'), [13]);
  t.deepEqual(fSync('[ a: @ ] : pickfunc: sto { a: 17 } pickfunc'), [17]);
});

test('pick, short cuts', t => {
  t.deepEqual(fSync('{a: 1} @a'), [1]);
  t.deepEqual(fSync('{a: 2} @a'), [2]);
  t.deepEqual(fSync('{a: 3} @b'), [null]);
  t.deepEqual(fSync('{a: {b: 5}} @a.b'), [5]);
  t.deepEqual(fSync('{a: 11} @b 13 orelse'), [13]);
  t.deepEqual(fSync('[ @a ] : pickfunc: sto { a: 17 } pickfunc'), [17]);
});

test('pick into object', t => {
  t.deepEqual(fSync('{ a: { a: 1 } a: @ }'), [{ a: 1 }]);
  t.deepEqual(fSync('{ a: 2 } q< { a: q> over @ }'), [{ a: 2 }]);
  t.deepEqual(fSync('{ a: 3 } q< { b: q> a: @ }'), [{ b: 3 }]);
  // t.deepEqual(fSync('{ a: 23 } { a: } @'), [{a: 23}]);
});

test('pick into object, shortcuts', t => {
  t.deepEqual(fSync('{ a: { a: 1 } @a }'), [{ a: 1 }]);
  t.deepEqual(fSync('{ a: 3 } q< { b: q> @a }'), [{ b: 3 }]);
  // t.deepEqual(fSync('{ a: 23 } { a: } @'), [{a: 23}]);
});

test('pick into object with default', t => {
  t.deepEqual(fSync('{ a: { a: 1 } b: @ 2 orelse }'), [{ a: 2 }]);
  t.deepEqual(fSync('{ a: 3 } q< { b: q> over @ 5 orelse }'), [{ b: 5 }]);
  t.deepEqual(fSync('{ a: 7 } q< { c: q> b: @ 11 orelse }'), [{ c: 11 }]);
});

test('pick into  shortcuts with default', t => {
  t.deepEqual(fSync('{ a: { a: 1 } @b 2 orelse }'), [{ a: 2 }]);
  t.deepEqual(fSync('{ a: 7 } q< { c: q> @b 11 orelse }'), [{ c: 11 }]);
});

test('pick into array', t => {
  t.deepEqual(fSync('( { a: 1 } a: @ )'), [[1]]);
});

test('pick into array, shortcut', t => {
  t.deepEqual(fSync('( { a: 1 } @a )'), [[1]]);
});

test('pick from array', t => {
  t.deepEqual(fSync('[1 2] 0 @'), [1]);
  t.deepEqual(fSync('[3 5] 1 @'), [5]);
  t.deepEqual(fSync('([7 11] 0 @)'), [[7]]);
});

test('pick from, shortcut', t => {
  t.deepEqual(fSync('[1 2] @0'), [1]);
  t.deepEqual(fSync('[3 5] @1'), [5]);
  t.deepEqual(fSync('([7 11] @0)'), [[7]]);
});

test('actions', t => {
  const ev = new Action('eval').toJSON();
  const sl = new Action('slip').toJSON();
  t.deepEqual(fSync('eval:'), [ev]);
  t.deepEqual(fSync('eval: :'), [ev]);
  t.deepEqual(fSync('[ eval ] :'), [ev]);  // todo: This is open the array
  t.deepEqual(fSync('[ 1 2 eval ] :'), [new Action([1, 2, ev]).toJSON()]);
  t.deepEqual(fSync('slip:'), [sl]);
  t.deepEqual(fSync('slip: :'), [sl]);
  t.deepEqual(fSync('[ slip ] :'), [sl]);
  t.deepEqual(fSync('[ 1 2 slip ] :'), [new Action([1, 2, sl]).toJSON()]);
});

test('=', t => {
  t.deepEqual(fSync('1 1 ='), [true]);
  t.deepEqual(fSync('1 i * 1 i * ='), [true]);
  t.deepEqual(fSync('null null ='), [true]);
  t.deepEqual(fSync('nan nan ='), [true]);  // todo: This is open the array
  t.deepEqual(fSync('{} {} ='), [true]);
  t.deepEqual(fSync('{ x: 1 } { x: 1 } ='), [true]);
  t.deepEqual(fSync('"1/1/1990" date "1/1/1990" date ='), [true]);
});

test('!=', t => {
  t.deepEqual(fSync('1 2 ='), [false]);
  t.deepEqual(fSync('1 i * 2 i * ='), [false]);
  t.deepEqual(fSync('null 2 ='), [false]);
  t.deepEqual(fSync('nan 2 ='), [false]);
  t.deepEqual(fSync('{ x: 1 } { x: 2 } ='), [false]);
  t.deepEqual(fSync('"1/1/1990" date "1/2/1990" date ='), [false]);
});

// immutable tests

test('immutable array actions', t => {
  t.deepEqual(fSync('[ 1 ] dup 2 <<'), [[1], [1, 2]]);
  t.deepEqual(fSync('[ 1 ] dup 2 swap >>'), [[1], [2, 1]]);
  t.deepEqual(fSync('[ 1 ] dup [ 2 ] +'), [[1], [1, 2]]);
});

test('immutable object actions', t => {
  const first = 'Manfred';
  const last = 'Von Thun';
  t.deepEqual(fSync('{ first: "Manfred" } dup { last: "Von Thun" } +'), [{ first }, { first, last }]);
  t.deepEqual(fSync('{ first: "Manfred" } dup { last: "Von Thun" } <<'), [{ first }, { first, last }]);
  t.deepEqual(fSync('{ first: "Manfred" } dup { last: "Von Thun" } >>'), [{ first }, { first, last }]);
});

test('immutable sto', t => {
  const first = 'Manfred';
  const last = 'Von Thun';
  t.deepEqual(fSync(`
    { } name: sto
    name
    name { first: "Manfred" } <<
    name { last: "Von Thun" } <<
    name
  `), [{ }, { first }, { last }, { }]);
});
