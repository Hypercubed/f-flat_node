import test from 'ava';
import {Stack as F} from '../';
import {log} from '../src/logger';

log.level = process.env.NODE_ENV || 'error';

process.chdir('..');

function fSync (a) {
  return new F(a).toArray();
}

test('setup', t => {
  t.not(new F().eval, undefined, 'should create a stack object');
  t.same(fSync(''), [], 'should create an empty stack');
  t.same(fSync('1 2 3'), [1, 2, 3], 'should create an non-empty stack');
});

test('should be chainable', t => {
  const f = new F('1').eval('2 3');
  t.same(f.toArray(), [1, 2, 3]);
  f.eval('4 +');
  t.same(f.toArray(), [1, 2, 7]);
});

test('should push numeric values', t => {
  t.same(fSync('1 2'), [1, 2], 'should push numbers');
  t.same(fSync('0x5 0x4d2'), [5, 1234], 'should 0x4d2 push numbers');
});

test('should drop swap slip', t => {
  t.same(fSync('1 2 drop 3'), [1, 3], 'should drop');
  t.same(fSync('1 2 swap 3'), [2, 1, 3], 'should swap');
  t.same(fSync('[ 1 2 + ] 4 slip'), [3, 4], 'should slip');
});

test('should dup', t => {
  t.same(fSync('1 2 dup 3'), [1, 2, 2, 3]);
  t.same(fSync('[ 1 2 + ] dup swap drop eval'), [3]);
});

test('should dup clone', t => {
  const f = new F('[ 1 2 3 ] dup');
  t.same(f.toArray(), [[1, 2, 3], [1, 2, 3]]);
  t.is(f.stack[0], f.stack[1]);
});

test('should clr', t => {
  t.same(fSync('1 2 clr 3'), [3]);
});

test('should sto, def', t => {
  t.same(fSync('1 2 "x" sto 3 x x'), [1, 3, 2, 2], 'should sto');
  t.same(fSync('[ 2 + ] "x" def 3 x x'), [7], 'should def');
});

test('should stack unstack', t => {
  t.same(fSync('1 2 3 stack'), [[1, 2, 3]], 'should stack');
  t.same(fSync('[ 1 2 3 ] <-'), [1, 2, 3], 'should unstack');
});

test('should choose', t => {
  t.same(fSync('true 3 4 choose'), [3]);
  t.same(fSync('false 3 4 choose'), [4]);
  t.same(fSync('5 false [ 2 + ] [ 2 * ] branch'), [10]);
  t.same(fSync('5 true [ 2 + ] [ 2 * ] branch'), [7]);
});

test('in/fork', t => {
  t.same(fSync('[ 2 1 + ] in'), [[3]], 'should evaluate list');
  t.same(fSync('"before" "a" sto [ a ] in'), [['before']], 'should have access to parent scope');
  t.same(fSync('"outer" "a" sto [ "inner" "a" sto a ] in a'), [['inner'], 'outer'], 'should isolate child scope');
});

test('map', t => {
  t.same(fSync('[ 3 2 1 ] [ 2 * ] map'), [[6, 4, 2]], 'should map quotes over quotes');
  t.same(fSync('[ -3 -2 -1 ] abs: map'), [[3, 2, 1]], 'should map words over quotes');
});

test('should undo on error', t => {
  const f = new F('1 2');
  t.same(f.toArray(), [1, 2]);

  t.throws(() => f.eval('+ whatwhat'));
  t.same(f.toArray(), [1, 2]);
});

test('should undo', t => {
  const f = new F('1');

  f.eval('2');
  t.same(f.toArray(), [1, 2]);

  f.eval('+');
  t.same(f.toArray(), [3]);

  f.eval('undo');
  t.same(f.toArray(), [1, 2]);

  f.eval('undo');
  t.same(f.toArray(), [1]);
});

test('apply', t => {
  t.same(fSync('10 [ 9 4 3 ] max: rcl ||>'), [10, 9]);
  t.same(fSync('10 [ 9 4 3 ] min: rcl ||>'), [10, 3]);
});

/* test('apply', t => {
  t.plan(2);
  t.same(fSync('10 [ 9 4 3 ] \\max rcl ||>', [10, 9]);
  t.same(fSync('10 [ 9 4 3 ] \\min rcl ||>', [10, 3]);
}); */

test('symbols', t => {
  t.same(fSync('#test dup ='), [true]);
  t.same(fSync('#test #test ='), [false]);
});

test('fork', t => {
  t.same(fSync('[1 2 +] fork'), [[3]], 'fork');
});

test('others', t => {
  t.same(fSync('get-log-level set-log-level'), [], 'set-log-level');
  t.same(fSync('1 2 + [ 4 5 ] -> 6 7'), [3, 4, 5], 'replace queue');
});

test('of', t => {
  t.same(fSync('"abc" 123 of'), ['123']);
  t.same(fSync('123 "456" of'), [456]);
});

test('empty', t => {
  t.same(fSync('"abc" empty'), ['']);
  t.same(fSync('123 empty'), [0]);
});

test('nop', t => {
  t.same(fSync('"abc" nop'), ['abc']);
  t.same(fSync('"abc" id'), ['abc']);
});

test('depth', t => {
  t.same(fSync('"abc" depth'), ['abc', 1]);
  t.same(fSync('"abc" 123 depth'), ['abc', 123, 2]);
});

test('identical?', t => {
  t.same(fSync('"abc" "abc" identical?'), [true]);
  t.same(fSync('["abc"] ["abc"] identical?'), [false]);
  t.same(fSync('["abc"] dup identical?'), [true]);
});

test('others2', t => {
  t.same(fSync('"abc" "b" indexof'), [1], 'indexof');
  t.same(fSync('"abc" "def" swap'), ['def', 'abc'], 'swap strings');
  t.same(fSync('abc: def: swap'), [{type: '@@Action', value: 'def'}, {type: '@@Action', value: 'abc'}], 'swap atoms');
  t.same(fSync('abc: dup'), [{type: '@@Action', value: 'abc'}, {type: '@@Action', value: 'abc'}], 'dup atoms');
  t.same(fSync('[2 1 +] unstack'), [2, 1, {type: '@@Action', value: '+'}], 'unstack should not eval');
});

test('should slice', t => {
  t.same(fSync('["a" "b" "c" "d"] 0 1 slice'), [['a']]);
  t.same(fSync('["a" "b" "c" "d"] 0 -1 slice'), [['a', 'b', 'c']]);
});

test('should split at', t => {
  t.same(fSync('["a" "b" "c" "d"] 1 splitat'), [['a'], ['b', 'c', 'd']]);
  t.same(fSync('["a" "b" "c" "d"] -1 splitat'), [['a', 'b', 'c'], ['d']]);
});

test('filter and reduce', t => {
  t.same(fSync('10 integers [ even? ] filter'), [[2, 4, 6, 8, 10]], 'filter');
  t.same(fSync('10 integers 0 [ + ] reduce'), [55], 'reduce');
  t.same(fSync('10 integers 1 [ * ] reduce'), [3628800], 'reduce');
  t.same(fSync('10 integers [ + ] reduce*'), [55], 'reduce');
  t.same(fSync('10 integers [ * ] reduce*'), [3628800], 'reduce');
});

test('zip, zipwith and dot', t => {
  t.same(fSync('[ 1 2 3 ] [ 4 5 6 ] zip'), [[1, 4, 2, 5, 3, 6]], 'zip');
  t.same(fSync('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in'), [[5, 7, 9]], 'zipwith');
  t.same(fSync('[ 1 2 3 ] [ 4 5 6 ] dot'), [32], 'dot');
  t.same(fSync('[ 1 2 3 4 ] [ 4 5 6 ] dot'), [32], 'dot');
});

test('operations with null', t => {
  t.same(fSync('null 5 +'), [5], 'add');
  t.same(fSync('5 null +'), [5], 'add');
  t.same(fSync('null 5 -'), [-5], 'sub');
  t.same(fSync('5 null -'), [5], 'sub');
});

test('operations with null, cont', t => {
  t.same(fSync('null 5 *'), [0], 'mul');
  t.same(fSync('5 null *'), [0], 'mul');
  t.same(fSync('null 5 /'), [0], 'div');
  t.same(fSync('5 null /'), [null], 'div');  // should be infinity, bad JSON conversion
});

test('operations with null, cont2', t => {
  t.same(fSync('null 5 <<'), [0], '<<');
  t.same(fSync('5 null <<'), [5], '<<');
  t.same(fSync('null 5 >>'), [0], '>>');
  t.same(fSync('5 null >>'), [5], '>>');
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

test('can spawn a future in sync', t => {
  t.same(fSync('[ 1 2 + 100 sleep ] spawn 3 4 +'), [{type: '@@Future'}, 7]);
});

function delay (ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

test('should spawn, returning a future', async t => {
  const f = new F();
  f.eval('[ 100 sleep 10 ! ] spawn 4 5 +');
  t.same(f.toArray(), [{type: '@@Future'}, 9]);

  await delay(2000);

  t.same(f.toArray(), [{type: '@@Future', value: [3628800]}, 9]);
  t.same(f.eval('slip').toArray(), [3628800, 9]);
});
