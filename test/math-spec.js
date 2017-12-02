import test from 'ava';
import { F, fSyncJSON, fSyncValues, fSyncString, nearly } from './setup';

test('should perform basic arithmetic', t => {
  t.deepEqual(fSyncValues('1 2 +'), [3], 'should add numbers');
  t.deepEqual(fSyncValues('1 2 -'), [-1], 'should sub numbers');
  t.deepEqual(fSyncValues('2 3 *'), [6], 'should multiply numbers');
  t.deepEqual(fSyncValues('1 2 /'), [0.5], 'should divide numbers');
});

test('should div by zero, returns infinity', t => {
  t.deepEqual(new F().eval('1 0 /').stack[0].type, 'ComplexInfinity');
});

test('should quickcheck integer arithmetic', t => {
  t.deepEqual(fSyncJSON('[rand-integer] [ integer? ] for-all'), [[]]);
  t.deepEqual(fSyncJSON('[rand-integer] [ [ 1 + ] [ 1 swap + ] bi = ] for-all'), [
    []
  ]);
  t.deepEqual(fSyncJSON('[rand-integer] [ dup 1 * = ] for-all'), [[]]);
  t.deepEqual(fSyncJSON('[rand-integer] [ dup 1 swap / 1 swap / = ] for-all'), [
    []
  ]);
});

test('should test equality', t => {
  t.deepEqual(fSyncJSON('1 2 ='), [false], 'should test equality');
  t.deepEqual(fSyncJSON('2 2 ='), [true], 'should test equality');
});

test('should comparey', t => {
  t.deepEqual(fSyncValues('1 1 cmp'), [0]);
  t.deepEqual(fSyncValues('1 2 cmp'), [-1]);
  t.deepEqual(fSyncValues('2 1 cmp'), [1]);
});

test('should test inequality', t => {
  t.deepEqual(fSyncJSON('1 1 <'), [false]);
  t.deepEqual(fSyncJSON('1 1 >'), [false]);
  t.deepEqual(fSyncJSON('1 2 <'), [true]);
  t.deepEqual(fSyncJSON('1 2 >'), [false]);
  t.deepEqual(fSyncJSON('2 1 <'), [false]);
  t.deepEqual(fSyncJSON('2 1 >'), [true]);
});

test('precision', t => {
  t.deepEqual(fSyncValues('0.1 0.2 +'), [0.3], 'should use decimals');
  t.deepEqual(fSyncValues('0.07 10 *'), [0.7], 'should use decimals');
});

test('trig', t => {
  t.deepEqual(
    fSyncValues('1 cos 1 sin 1 tan'),
    [Math.cos(1), Math.sin(1), Math.tan(1)],
    'should calculate trig funcs'
  );
  t.deepEqual(
    fSyncValues('1 acos 1 asin 1 atan'),
    [5e-20, Math.asin(1), Math.atan(1)], // todo: fix acos
    'should calculate inv trig funcs'
  );
  t.deepEqual(
    fSyncValues('1 atan 4 *'),
    [Math.PI],
    'should calculate inv trig funcs'
  );
  t.deepEqual(
    fSyncValues('1 1 atan2 4 *'),
    [Math.PI],
    'should calculate inv trig funcs'
  );
});

test('trig 2', t => {
  t.deepEqual(fSyncValues('pi cos'), [-1]);
  t.truthy(nearly(fSyncValues('pi sin')[0], 0));
});

test('constants', t => {
  t.deepEqual(fSyncValues('e pi'), [Math.E, Math.PI], 'should define constants');
});

test('ln', t => {
  t.deepEqual(fSyncValues('1 ln'), [0]);
});

test('should define logs', t => {
  t.deepEqual(fSyncValues('1 log 10 log 100 log'), [0, 1, 2]);

  const r = fSyncValues('2 ln 10 ln');
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
  t.truthy(nearly(r, 9.4259477598383563846e159, '102 gamma'));
});

test('should define gamma, cont', t => {
  let r = new F().eval('1.5 gamma').stack[0];
  t.truthy(
    nearly(
      r,
      0.886226925452758013649083741670572591398774728061193564106,
      '1.5 gamma'
    )
  );

  r = new F().eval('0.1 gamma').stack[0];
  t.truthy(
    nearly(
      r,
      9.51350769866873183629248717726540219255057862608837734305,
      '0.1 gamma'
    )
  );
});

test('should define factorial', t => {
  t.deepEqual(fSyncValues('20 !'), [2432902008176640000], '20 !');

  const r = fSyncValues('100 !')[0];
  t.truthy(nearly(r, 9.3326215443944152704e157, '100 !'));
});

test('should calculate exact powers', t => {
  t.deepEqual(fSyncValues('2 0 ^'), [1]);
  t.deepEqual(fSyncValues('2 1 ^'), [2]);
  t.deepEqual(fSyncValues('2 2 ^'), [4]);
  t.deepEqual(fSyncValues('2 3 ^'), [8]);
  t.deepEqual(fSyncValues('e 1 ^'), [Math.E]);
});

test('should do Knuth\'s up-arrow notation', t => {
  t.deepEqual(fSyncValues('3 2 ^^^'), [7625597484987]);
});

test('should define max', t => {
  t.deepEqual(fSyncValues('3 2 max'), [3]);
  t.deepEqual(fSyncValues('4 7 max'), [7]);
  t.deepEqual(fSyncValues('9 4 3 max'), [9, 4]);
});

test('should define min', t => {
  t.deepEqual(fSyncValues('3 2 min'), [2]);
  t.deepEqual(fSyncValues('4 7 min'), [4]);
  t.deepEqual(fSyncValues('9 4 3 min'), [9, 3]);
});

test('should test primes', t => {
  t.deepEqual(
    fSyncJSON('10 integers prime?: map'),
    [[false, true, true, false, true, false, true, false, false, false]],
    'primes'
  );
  // 1     2     3     4      5     6      7     8      9      10

  t.deepEqual(
    fSyncJSON('10 integers [ 2 swap ^ 1 - prime? ] map'),
    [[false, true, true, false, true, false, true, false, false, false]],
    'Mersenne primes'
  );
  // 1     2     3     4      5     6      7     8      9      10
});

test('should define number?', t => {
  t.deepEqual(fSyncJSON('3 number?'), [true]);
  t.deepEqual(fSyncJSON('"4" number?'), [false]);
});

test('arg', t => {
  t.deepEqual(fSyncValues('0 arg'), [0]);
  t.deepEqual(fSyncValues('-0 arg'), [0]);
  t.deepEqual(fSyncValues('1 arg'), [0]);
  t.deepEqual(fSyncValues('-1 arg'), [3.141592653589793]);
  t.deepEqual(fSyncValues('10 arg'), [0]);
  t.deepEqual(fSyncValues('-10 arg'), [3.141592653589793]);
});

test('arg of infinities', t => {
  t.deepEqual(fSyncValues('infinity arg'), [0]);
  t.deepEqual(fSyncValues('infinity -1 * arg'), [3.141592653589793]);
});

test('asin', t => {
  t.deepEqual(fSyncValues('0 asin'), [0]);
  t.deepEqual(fSyncValues('1 asin'), [1.5707963267948966]);
  t.deepEqual(fSyncValues('-1 asin'), [-1.5707963267948966]);
  t.deepEqual(fSyncValues('1 2 / asin'), [0.5235987755982989]);
  t.deepEqual(fSyncValues('-1 2 / asin'), [-0.5235987755982989]);
});

test('acos', t => {
  t.deepEqual(fSyncValues('0 acos'), [1.5707963267948966]);
  t.deepEqual(fSyncValues('1 acos'), [5e-20]);
  t.deepEqual(fSyncValues('-1 acos'), [3.141592653589793]);
  t.deepEqual(fSyncValues('1 2 / acos'), [1.0471975511965979]);
  t.deepEqual(fSyncValues('-1 2 / acos'), [2.0943951023931957]);
});

test('atan', t => {
  t.deepEqual(fSyncValues('0 atan'), [0]);
  t.deepEqual(fSyncValues('1 atan'), [0.7853981633974483]);
  t.deepEqual(fSyncValues('-1 atan'), [-0.7853981633974483]);
  t.deepEqual(fSyncValues('1 2 / atan'), [0.4636476090008061]);
  t.deepEqual(fSyncValues('-1 2 / atan'), [-0.4636476090008061]);
  t.deepEqual(fSyncValues('2 atan'), [1.107148717794090503017065460178537040070047645]);
  t.deepEqual(fSyncValues('-2 atan'), [-1.107148717794090503017065460178537040070047645]);
});

test('asinh', t => {
  t.deepEqual(fSyncValues('0 asinh'), [0]);
  t.deepEqual(fSyncValues('1 asinh'), [0.88137358701954302523]);
  t.deepEqual(fSyncValues('-1 asinh'), [-0.88137358701954302524]);
  t.deepEqual(fSyncValues('pi asinh'), [1.8622957433108482199]);
  t.deepEqual(fSyncValues('pi -1 * asinh'), [-1.8622957433108482199]);
  t.deepEqual(fSyncValues('1 2 / asinh'), [0.48121182505960344749]);
  t.deepEqual(fSyncValues('-1 2 / asinh'), [-0.48121182505960344751]);
});

test('sum of infinities', t => {
  t.deepEqual(fSyncString('infinity dup +'), 'Infinity');
  t.deepEqual(fSyncString('infinity dup -1 * +'), 'NaN');
});

test('subtraction of infinities', t => {
  t.deepEqual(fSyncString('infinity dup -'), 'NaN');
  t.deepEqual(fSyncString('infinity dup -1 * -'), 'Infinity');
});

test('asinh of infinities', t => {
  t.deepEqual(fSyncString('infinity asinh'), 'Infinity');
  t.deepEqual(fSyncString('infinity -1 * asinh'), '-Infinity');
});

test('acosh', t => {
  t.deepEqual(fSyncString('0 acosh'), '0+1.5707963267948966192i');
  t.deepEqual(fSyncString('1 acosh'), '0');
  t.deepEqual(fSyncString('-1 acosh'), '0+3.1415926535897932385i');
  t.deepEqual(fSyncString('pi acosh'), '1.811526272460853107');
  t.deepEqual(fSyncString('pi -1 * acosh'), '1.811526272460853107+3.1415926535897932385i');
  t.deepEqual(fSyncString('1 2 / acosh'), '-2e-20+1.0471975511965977462i');
  t.deepEqual(fSyncString('-1 2 / acosh'), '-2e-20+2.0943951023931954923i');
});

test('acosh of infinities', t => {
  t.deepEqual(fSyncString('infinity acosh'), 'Infinity');
  t.deepEqual(fSyncString('infinity -1 * acosh'), 'Infinity');
});

test('atanh', t => {
  t.deepEqual(fSyncString('0 atanh'), '0');
  t.deepEqual(fSyncString('1 atanh'), 'Infinity');
  t.deepEqual(fSyncString('-1 atanh'), '-Infinity');
  t.deepEqual(fSyncString('pi atanh'), '0.3297653149566991076-1.5707963267948966193i');
  t.deepEqual(fSyncString('pi -1 * atanh'), '-0.3297653149566991076+1.5707963267948966193i');
  t.deepEqual(fSyncString('1 2 / atanh'), '0.5493061443340548457');
  t.deepEqual(fSyncString('-1 2 / atanh'), '-0.5493061443340548457');
});

test('atanh of infinities', t => {
  t.deepEqual(fSyncString('infinity atanh'), '0-1.5707963267948966192i');
  t.deepEqual(fSyncString('infinity -1 * atanh'), '0+1.5707963267948966192i');
});