import test from 'ava';
import {F, fSync, nearly} from './setup';

test('should perform basic arithmetic', t => {
  t.deepEqual(fSync('1 2 +'), [3], 'should add numbers');
  t.deepEqual(fSync('1 2 -'), [-1], 'should sub numbers');
  t.deepEqual(fSync('2 3 *'), [6], 'should multiply numbers');
  t.deepEqual(fSync('1 2 /'), [0.5], 'should divide numbers');
});

test('should div by zero, returns infinity', t => {
  t.deepEqual(new F().eval('1 0 /').stack[0].valueOf(), Infinity);
});

test('should quickcheck integer arithmetic', t => {
  t.deepEqual(fSync('[rand-integer] [ integer? ] for-all'), [[]]);
  t.deepEqual(fSync('[rand-integer] [ [ 1 + ] [ 1 swap + ] bi = ] for-all'), [[]]);
  t.deepEqual(fSync('[rand-integer] [ dup 1 * = ] for-all'), [[]]);
  t.deepEqual(fSync('[rand-integer] [ dup 1 swap / 1 swap / = ] for-all'), [[]]);
});

test('should test equality', t => {
  t.deepEqual(fSync('1 2 ='), [false], 'should test equality');
  t.deepEqual(fSync('2 2 ='), [true], 'should test equality');
});

test('should comparey', t => {
  t.deepEqual(fSync('1 1 cmp'), [0]);
  t.deepEqual(fSync('1 2 cmp'), [-1]);
  t.deepEqual(fSync('2 1 cmp'), [1]);
});

test('should test inequality', t => {
  t.deepEqual(fSync('1 1 <'), [false]);
  t.deepEqual(fSync('1 1 >'), [false]);
  t.deepEqual(fSync('1 2 <'), [true]);
  t.deepEqual(fSync('1 2 >'), [false]);
  t.deepEqual(fSync('2 1 <'), [false]);
  t.deepEqual(fSync('2 1 >'), [true]);
});

test('precision', t => {
  t.deepEqual(fSync('0.1 0.2 +'), [0.3], 'should use decimals');
  t.deepEqual(fSync('0.07 10 *'), [0.7], 'should use decimals');
});

test('trig', t => {
  t.deepEqual(fSync('1 cos 1 sin 1 tan'), [Math.cos(1), Math.sin(1), Math.tan(1)], 'should calculate trig funcs');
  t.deepEqual(fSync('1 acos 1 asin 1 atan'), [Math.acos(1), Math.asin(1), Math.atan(1)], 'should calculate inv trig funcs');
  t.deepEqual(fSync('1 atan 4 *'), [Math.PI], 'should calculate inv trig funcs');
  t.deepEqual(fSync('1 1 atan2 4 *'), [Math.PI], 'should calculate inv trig funcs');
});

test('trig 2', t => {
  t.deepEqual(fSync('pi cos'), [-1]);
  t.truthy(nearly(fSync('pi sin')[0], 0));
});

test('constants', t => {
  t.deepEqual(fSync('e pi'), [Math.E, Math.PI], 'should define constants');
});

test('should define logs', t => {
  t.deepEqual(fSync('1 log 10 log 100 log'), [0, 1, 2]);

  const r = new F().eval('2 ln 10 ln').toArray();
  t.truthy(nearly(r[0], 0.6931471805599453));
  t.truthy(nearly(r[1], 2.3025850929940458834));
});

test('should define gamma', t => {
  let r = new F().eval('4 gamma').stack[0];
  t.truthy(nearly(r, 6, '4 gamma'));

  r = new F().eval('1 2 / gamma').stack[0];
  t.truthy(nearly(r, Math.sqrt(Math.PI), '1 2 / gamma'));

  r = new F().eval('-1 2 / gamma').stack[0];
  t.truthy(nearly(r, -2 * Math.sqrt(Math.PI), '-1 2 / gamma'));

  r = new F().eval('-5 2 / gamma').stack[0];
  t.truthy(nearly(r, -8 / 15 * Math.sqrt(Math.PI), '-5 2 / gamma'));

  r = new F().eval('102 gamma').stack[0];
  t.truthy(nearly(r, 9.4259477598383563846e+159, '102 gamma'));
});

test('should define gamma, cont', t => {
  let r = new F().eval('1.5 gamma').stack[0];
  t.truthy(nearly(r, 0.886226925452758013649083741670572591398774728061193564106, '1.5 gamma'));

  r = new F().eval('0.1 gamma').stack[0];
  t.truthy(nearly(r, 9.513507698668731836292487177265402192550578626088377343050, '0.1 gamma'));
});

test('should define factorial', t => {
  t.deepEqual(fSync('20 !'), [2432902008176640000], '20 !');

  const r = new F().eval('100 !').toArray()[0];
  t.truthy(nearly(r, 9.3326215443944152704e+157, '100 !'));
});

test('should calculate exact powers', t => {
  t.deepEqual(fSync('2 0 ^'), [1]);
  t.deepEqual(fSync('2 1 ^'), [2]);
  t.deepEqual(fSync('2 2 ^'), [4]);
  t.deepEqual(fSync('2 3 ^'), [8]);
  t.deepEqual(fSync('e 1 ^'), [Math.E]);
});

test('should do Knuth\'s up-arrow notation', t => {
  t.deepEqual(fSync('3 2 ^^^'), [7625597484987]);
});

test('should define max', t => {
  t.deepEqual(fSync('3 2 max'), [3]);
  t.deepEqual(fSync('4 7 max'), [7]);
  t.deepEqual(fSync('9 4 3 max'), [9, 4]);
});

test('should define min', t => {
  t.deepEqual(fSync('3 2 min'), [2]);
  t.deepEqual(fSync('4 7 min'), [4]);
  t.deepEqual(fSync('9 4 3 min'), [9, 3]);
});

test('should test primes', t => {
  t.deepEqual(fSync('10 integers prime?: map'),
    [[false, true, true, false, true, false, true, false, false, false]], 'primes');
    // 1     2     3     4      5     6      7     8      9      10

  t.deepEqual(fSync('10 integers [ 2 swap ^ 1 - prime? ] map'),
    [[false, true, true, false, true, false, true, false, false, false]], 'Mersenne primes');
    // 1     2     3     4      5     6      7     8      9      10
});

test('should define number?', t => {
  t.deepEqual(fSync('3 number?'), [true]);
  t.deepEqual(fSync('"4" number?'), [false]);
});
