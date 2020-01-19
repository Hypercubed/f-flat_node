import test from 'ava';
import { fJSON, fValues, fString, fValue, nearly } from './helpers/setup';

test('should perform basic arithmetic', async t => {
  t.deepEqual(await fValues('1 2 +'), [3], 'should add numbers');
  t.deepEqual(await fValues('1 2 -'), [-1], 'should sub numbers');
  t.deepEqual(await fValues('2 3 *'), [6], 'should multiply numbers');
  t.deepEqual(await fValues('3 2 /'), [1.5], 'should divide numbers');
  t.deepEqual(await fValues('3 2 \\'), [1], 'should fld numbers');
  t.deepEqual(await fValues('3 2 %'), [1], 'should fld numbers');
});

test('should div by zero, returns complex infinity', async t => {
  t.deepEqual((await fValue('1 0 /')).type, 'ComplexInfinity');
  t.deepEqual((await fValue('1 0 \\')).type, 'ComplexInfinity');
});

test('should quickcheck integer arithmetic', async t => {
  t.deepEqual(await fJSON('[rand-integer] [ integer? ] for-all'), [[]]);
  t.deepEqual(await fJSON('[rand-integer] [ [ 1 + ] [ 1 swap + ] bi = ] for-all'), [
    []
  ]);
  t.deepEqual(await fJSON('[rand-integer] [ dup 1 * = ] for-all'), [[]]);
  /* t.deepEqual(await fJSON('[rand-integer] [ dup inv swap -1 ^ = ] for-all'), [
    []
  ]); */
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('1 2 ='), [false], 'should test equality');
  t.deepEqual(await fJSON('2 2 ='), [true], 'should test equality');
});

test('should test equality of -0', async t => {
  t.deepEqual(await fValues('0 0 ='), [true]);
  t.deepEqual(await fValues('0 -0 ='), [true]);
  t.deepEqual(await fValues('-0 -0 ='), [true]);
  t.deepEqual(await fValues('-0 0 ='), [true]);
});

test('should compare', async t => {
  t.deepEqual(await fValues('1 1 <=>'), [0]);
  t.deepEqual(await fValues('1 2 <=>'), [-1]);
  t.deepEqual(await fValues('2 1 <=>'), [1]);
});

test('should <=> with -0', async t => {  // todo: better comparisons with NaN
  t.deepEqual(await fValues('0 0 <=>'), [0]);
  t.deepEqual(await fValues('0 -0 <=>'), [0]);
  t.deepEqual(await fValues('-0 -0 <=>'), [0]);
  t.deepEqual(await fValues('-0 0 <=>'), [0]);
});

/* test('should <=> with nan, null', async t => {  // todo: better comparisons with NaN
  t.deepEqual(await fValues('nan nan <=>'), [0]);
  t.deepEqual(await fString('1 nan <=>'), 'NaN');
  t.deepEqual(await fString('nan 1 <=>'), 'NaN');
  t.deepEqual(await fString('0 nan <=>'), 'NaN');
  t.deepEqual(await fString('nan 1 <=>'), 'NaN');

  t.deepEqual(await fValues('null null <=>'), [0]);
  t.deepEqual(await fValues('1 null <=>'), [1]);
  t.deepEqual(await fValues('null 1 <=>'), [-1]);
  t.deepEqual(await fValues('0 null <=>'), [1]);
  t.deepEqual(await fValues('null 1 <=>'), [-1]);
}); */

test('should compare infinities', async t => {
  t.deepEqual(await fValues('infinity infinity <=>'), [0]);
  t.deepEqual(await fValues('-infinity -infinity <=>'), [0]);
  t.deepEqual(await fValues('infinity -infinity <=>'), [1]);
  t.deepEqual(await fValues('-infinity infinity <=>'), [-1]);
  t.deepEqual(await fValues('infinity 0 <=>'), [1]);
  t.deepEqual(await fValues('-infinity 0 <=>'), [-1]);
  t.deepEqual(await fValues('0 -infinity <=>'), [1]);
  t.deepEqual(await fValues('0 infinity <=>'), [-1]);
});

test('should test inequality', async t => {
  t.deepEqual(await fJSON('1 1 <'), [false]);
  t.deepEqual(await fJSON('1 1 >'), [false]);
  t.deepEqual(await fJSON('1 2 <'), [true]);
  t.deepEqual(await fJSON('1 2 >'), [false]);
  t.deepEqual(await fJSON('2 1 <'), [false]);
  t.deepEqual(await fJSON('2 1 >'), [true]);
});

test('precision', async t => {
  t.deepEqual(await fValues('0.1 0.2 +'), [0.3], 'should use decimals');
  t.deepEqual(await fValues('0.07 10 *'), [0.7], 'should use decimals');
});

test('trig', async t => {
  t.deepEqual(
    await fValues('1 cos 1 sin 1 tan'),
    [Math.cos(1), Math.sin(1), Math.tan(1)],
    'should calculate trig funcs'
  );
  t.deepEqual(
    await fValues('1 acos 1 asin 1 atan'),
    [5e-20, Math.asin(1), Math.atan(1)], // todo: fix acos
    'should calculate inv trig funcs'
  );
  t.deepEqual(
    await fValues('1 atan 4 *'),
    [Math.PI],
    'should calculate inv trig funcs'
  );
  t.deepEqual(
    await fValues('1 1 atan2 4 *'),
    [Math.PI],
    'should calculate inv trig funcs'
  );
});

test('trig 2', async t => {
  t.deepEqual(await fValues('pi cos'), [-1]);
  t.truthy(nearly((await fValues('pi sin'))[0], 0));
});

test('constants', async t => {
  t.deepEqual(await fValues('e pi'), [Math.E, Math.PI], 'should define constants');
});

test('ln', async t => {
  t.deepEqual(await fValues('1 ln'), [0]);

  const r = await fValues('2 ln 10 ln');
  t.truthy(nearly(r[0], 0.6931471805599453));
  t.truthy(nearly(r[1], 2.3025850929940458834));
});

test('should define log', async t => {
  t.deepEqual(await fValues('1 log 10 log 100 log'), [0, 1, 2]);
});

test('should define logn', async t => {
  t.deepEqual(await fValues('1 10 logn 10 10 logn 100 10 logn'), [0, 1, 2]);
});

test('should define gamma', async t => {
  t.truthy(nearly(await fValue('4 gamma'), 6));
  t.truthy(nearly(await fValue('1 2 / gamma'), Math.sqrt(Math.PI)));
  t.truthy(nearly(await fValue('-1 2 / gamma'), -2 * Math.sqrt(Math.PI)));
  t.truthy(nearly(await fValue('-5 2 / gamma'), -8 / 15 * Math.sqrt(Math.PI)));
  t.truthy(nearly(await fValue('102 gamma'), 9.4259477598383563846e159));
});

test('should define gamma, cont', async t => {
  t.truthy(
    nearly(
      await fValue('1.5 gamma'),
      0.886226925452758013649083741670572591398774728061193564106
    )
  );

  t.truthy(
    nearly(
      await fValue('0.1 gamma'),
      9.51350769866873183629248717726540219255057862608837734305
    )
  );
});

test('should define factorial', async t => {
  t.deepEqual(await fValues('20 !'), [2432902008176640000], '20 !');
  t.truthy(nearly(await fValue('100 !'), 9.3326215443944152704e157));
});

test('should calculate exact powers', async t => {
  t.deepEqual(await fValues('2 0 ^'), [1]);
  t.deepEqual(await fValues('2 1 ^'), [2]);
  t.deepEqual(await fValues('2 2 ^'), [4]);
  t.deepEqual(await fValues('2 3 ^'), [8]);
  t.deepEqual(await fValues('e 1 ^'), [Math.E]);
});

test(`should do Knuth's up-arrow notation`, async t => {
  t.deepEqual(await fValues('3 2 ^^^'), [7625597484987]);
});

test('should define max', async t => {
  t.deepEqual(await fValues('3 2 max'), [3]);
  t.deepEqual(await fValues('4 7 max'), [7]);
  t.deepEqual(await fValues('9 4 3 max'), [9, 4]);
});

test('should define min', async t => {
  t.deepEqual(await fValues('3 2 min'), [2]);
  t.deepEqual(await fValues('4 7 min'), [4]);
  t.deepEqual(await fValues('9 4 3 min'), [9, 3]);
});

test('should test primes', async t => {
  t.deepEqual(
    await fJSON('10 integers prime?: map'),
    [[false, true, true, false, true, false, true, false, false, false]],
    'primes'
  );
  // 1     2     3     4      5     6      7     8      9      10

  t.deepEqual(
    await fJSON('10 integers [ 2 swap ^ 1 - prime? ] map'),
    [[false, true, true, false, true, false, true, false, false, false]],
    'Mersenne primes'
  );
  // 1     2     3     4      5     6      7     8      9      10
});

test('should define number?', async t => {
  t.deepEqual(await fJSON('3 number?'), [true]);
  t.deepEqual(await fJSON('"4" number?'), [false]);
});

test('arg', async t => {
  t.deepEqual(await fValues('0 arg'), [0]);
  t.deepEqual(await fValues('-0 arg'), [0]);
  t.deepEqual(await fValues('1 arg'), [0]);
  t.deepEqual(await fValues('-1 arg'), [3.141592653589793]);
  t.deepEqual(await fValues('10 arg'), [0]);
  t.deepEqual(await fValues('-10 arg'), [3.141592653589793]);
});

test('arg of infinities', async t => {
  t.deepEqual(await fValues('infinity arg'), [0]);
  t.deepEqual(await fValues('infinity -1 * arg'), [3.141592653589793]);
});

test('asin', async t => {
  t.deepEqual(await fValues('0 asin'), [0]);
  t.deepEqual(await fValues('1 asin'), [1.5707963267948966]);
  t.deepEqual(await fValues('-1 asin'), [-1.5707963267948966]);
  t.deepEqual(await fValues('1 2 / asin'), [0.5235987755982989]);
  t.deepEqual(await fValues('-1 2 / asin'), [-0.5235987755982989]);
});

test('acos', async t => {
  t.deepEqual(await fValues('0 acos'), [1.5707963267948966]);
  t.deepEqual(await fValues('1 acos'), [5e-20]);
  t.deepEqual(await fValues('-1 acos'), [3.141592653589793]);
  t.deepEqual(await fValues('1 2 / acos'), [1.0471975511965979]);
  t.deepEqual(await fValues('-1 2 / acos'), [2.0943951023931957]);
});

test('atan', async t => {
  t.deepEqual(await fValues('0 atan'), [0]);
  t.deepEqual(await fValues('1 atan'), [0.7853981633974483]);
  t.deepEqual(await fValues('-1 atan'), [-0.7853981633974483]);
  t.deepEqual(await fValues('1 2 / atan'), [0.4636476090008061]);
  t.deepEqual(await fValues('-1 2 / atan'), [-0.4636476090008061]);
  t.deepEqual(await fValues('2 atan'), [1.107148717794090503017065460178537040070047645]);
  t.deepEqual(await fValues('-2 atan'), [-1.107148717794090503017065460178537040070047645]);
});

test('asinh', async t => {
  t.deepEqual(await fValues('0 asinh'), [0]);
  t.deepEqual(await fValues('1 asinh'), [0.88137358701954302523]);
  t.deepEqual(await fValues('-1 asinh'), [-0.88137358701954302524]);
  t.deepEqual(await fValues('pi asinh'), [1.8622957433108482199]);
  t.deepEqual(await fValues('pi -1 * asinh'), [-1.8622957433108482199]);
  t.deepEqual(await fValues('1 2 / asinh'), [0.48121182505960344749]);
  t.deepEqual(await fValues('-1 2 / asinh'), [-0.48121182505960344751]);
});

test('sum of infinities', async t => {
  t.deepEqual(await fString('infinity dup +'), 'Infinity');
  t.deepEqual(await fString('infinity dup -1 * +'), 'NaN');
});

test('subtraction of infinities', async t => {
  t.deepEqual(await fString('infinity dup -'), 'NaN');
  t.deepEqual(await fString('infinity dup -1 * -'), 'Infinity');
});

test('asinh of infinities', async t => {
  t.deepEqual(await fString('infinity asinh'), 'Infinity');
  t.deepEqual(await fString('infinity -1 * asinh'), '-Infinity');
});

test('acosh', async t => {
  t.deepEqual(await fString('0 acosh'), '0+1.5707963267948966192i');
  t.deepEqual(await fString('1 acosh'), '0');
  t.deepEqual(await fString('-1 acosh'), '0+3.1415926535897932385i');
  t.deepEqual(await fString('pi acosh'), '1.811526272460853107');
  t.deepEqual(await fString('pi -1 * acosh'), '1.811526272460853107+3.1415926535897932385i');
  t.deepEqual(await fString('1 2 / acosh'), '-2e-20+1.0471975511965977462i');
  t.deepEqual(await fString('-1 2 / acosh'), '-2e-20+2.0943951023931954923i');
});

test('acosh of infinities', async t => {
  t.deepEqual(await fString('infinity acosh'), 'Infinity');
  t.deepEqual(await fString('infinity -1 * acosh'), 'Infinity');
});

test('atanh', async t => {
  t.deepEqual(await fString('0 atanh'), '0');
  t.deepEqual(await fString('1 atanh'), 'Infinity');
  t.deepEqual(await fString('-1 atanh'), '-Infinity');
  t.deepEqual(await fString('pi atanh'), '0.3297653149566991076-1.5707963267948966193i');
  t.deepEqual(await fString('pi -1 * atanh'), '-0.3297653149566991076+1.5707963267948966193i');
  t.deepEqual(await fString('1 2 / atanh'), '0.5493061443340548457');
  t.deepEqual(await fString('-1 2 / atanh'), '-0.5493061443340548457');
});

test('atanh of infinities', async t => {
  t.deepEqual(await fString('infinity atanh'), '0-1.5707963267948966192i');
  t.deepEqual(await fString('infinity -1 * atanh'), '0+1.5707963267948966192i');
});

test.skip('numerical derivative', async t => {
  t.true(nearly(await fValue('[ exp ] 1 1e-9 nd'), Math.E /* Math.E */));
  t.true(nearly(await fValue('[ sin ] 1 1e-6 nd'), 0.54030188513256 /* Math.cos(1) */));
  t.true(nearly(await fValue('[ sin 2 ^ ] 1 1e-6 nd'), 0.90929701067825 /* Math.sin(2) */));
  t.true(nearly(await fValue('ln 1 1e-19 nd'), 1));
  t.is(await fString('[ inv ] 0 1e-6 nd'), '-Infinity');
});

test('should support neg 0', async t => {
  t.deepEqual(await fValues('-0'), [-0]);
  t.deepEqual(await fValues('0 -1 *'), [-0]);
});

test('should negate', async t => {
  t.is(await fString('1 ~'), '-1');
  t.is(await fString('pi ~'), '-3.1415926535897932385');
  t.is(await fString('infinity ~'), '-Infinity');
  t.is(await fString('-infinity ~'), 'Infinity');
  t.deepEqual(await fValues('0 ~'), [-0]); // fix this
  t.deepEqual(await fValues('-0 ~'), [0]); // fix this
});

test('should << (left shift)', async t => {
  t.deepEqual(await fValues('0b0001 1 <<'), [0b0010]);
  t.deepEqual(await fValues('0b0001 16 <<'), [65536]);
  t.deepEqual(await fValues('0b0001 32 <<'), [4294967296]);
});

test('should >> (right shift)', async t => {
  t.deepEqual(await fValues('0b0100 1 >>'), [0b0010]);
  t.deepEqual(await fValues('0b0010 1 >>'), [0b0001]);
  t.deepEqual(await fValues('0b1000 3 >>'), [0b0001]);
});

test('bitwise ops', async t => {
  t.deepEqual(await fValues('0b0001 0b0001 &'), [0b0001]);
  t.deepEqual(await fValues('0b0001 0b0001 |'), [0b0001]);
  t.deepEqual(await fValues('0b0001 0b0001 $'), [0b0000]);
  t.deepEqual(await fValues('0b0001 bitnot'), [-2]);

  t.deepEqual(await fValues('0b0001 0b0010 &'), [0b0000]);
  t.deepEqual(await fValues('0b0001 0b0010 |'), [0b0011]);
  t.deepEqual(await fValues('0b0001 0b0010 $'), [0b0011]);
  t.deepEqual(await fValues('0b0010 bitnot'), [-3]);
});

test('number works as a "macro"', async t => {
  t.deepEqual(await fValues('"5":number'), [5]);
  t.deepEqual(await fValues('[ "5":number ]'), [[ 5 ]]);
});

test('get digits from a decimal', async t => {
  // 3.1415926535897932385
  t.deepEqual(await fValues('pi 2 @'), [4]);
  t.deepEqual(await fValues('pi -2 @'), [8]);
  t.deepEqual(await fValues('pi 20 @'), [null]);

  t.deepEqual(await fValues('42 0 @'), [4]);
  t.deepEqual(await fValues('42 1 @'), [2]);
  t.deepEqual(await fValues('42 -1 @'), [2]);
  t.deepEqual(await fValues('42 -2 @'), [4]);
  t.deepEqual(await fValues('42 3 @'), [null]);
});
