import { fJSON, fValues, fString, fValue, nearly } from './helpers/setup';

test('should perform basic arithmetic', async () => {
  expect(await fValues('1 2 +')).toEqual([3]);
  expect(await fValues('1 2 -')).toEqual([-1]);
  expect(await fValues('2 3 *')).toEqual([6]);
  expect(await fValues('3 2 /')).toEqual([1.5]);
  expect(await fValues('3 2 \\')).toEqual([1]);
  expect(await fValues('3 2 %')).toEqual([1]);
});

test('should div by zero, returns complex infinity', async () => {
  expect((await fValue('1 0 /')).type).toEqual('ComplexInfinity');
  expect((await fValue('1 0 \\')).type).toEqual('ComplexInfinity');
});

test('should quickcheck integer arithmetic', async () => {
  expect(await fJSON('[rand-integer] [ integer? ] for-all')).toEqual([[]]);
  expect(
    await fJSON('[rand-integer] [ [ 1 + ] [ 1 swap + ] bi = ] for-all')
  ).toEqual([[]]);
  expect(await fJSON('[rand-integer] [ dup 1 * = ] for-all')).toEqual([[]]);
  /* t.deepEqual(await fJSON('[rand-integer] [ dup inv swap -1 ^ = ] for-all'), [
    []
  ]); */
});

test('should test equality', async () => {
  expect(await fJSON('1 2 =')).toEqual([false]);
  expect(await fJSON('2 2 =')).toEqual([true]);
});

test('should test equality of -0', async () => {
  expect(await fValues('0 0 =')).toEqual([true]);
  expect(await fValues('0 -0 =')).toEqual([true]);
  expect(await fValues('-0 -0 =')).toEqual([true]);
  expect(await fValues('-0 0 =')).toEqual([true]);
});

test('should compare', async () => {
  expect(await fValues('1 1 <=>')).toEqual([0]);
  expect(await fValues('1 2 <=>')).toEqual([-1]);
  expect(await fValues('2 1 <=>')).toEqual([1]);
});

test('should <=> with -0', async () => {
  // todo: better comparisons with NaN
  expect(await fValues('0 0 <=>')).toEqual([0]);
  expect(await fValues('0 -0 <=>')).toEqual([0]);
  expect(await fValues('-0 -0 <=>')).toEqual([0]);
  expect(await fValues('-0 0 <=>')).toEqual([0]);
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

test('should compare infinities', async () => {
  expect(await fValues('infinity infinity <=>')).toEqual([0]);
  expect(await fValues('-infinity -infinity <=>')).toEqual([0]);
  expect(await fValues('infinity -infinity <=>')).toEqual([1]);
  expect(await fValues('-infinity infinity <=>')).toEqual([-1]);
  expect(await fValues('infinity 0 <=>')).toEqual([1]);
  expect(await fValues('-infinity 0 <=>')).toEqual([-1]);
  expect(await fValues('0 -infinity <=>')).toEqual([1]);
  expect(await fValues('0 infinity <=>')).toEqual([-1]);
});

test('should test inequality', async () => {
  expect(await fJSON('1 1 <')).toEqual([false]);
  expect(await fJSON('1 1 >')).toEqual([false]);
  expect(await fJSON('1 2 <')).toEqual([true]);
  expect(await fJSON('1 2 >')).toEqual([false]);
  expect(await fJSON('2 1 <')).toEqual([false]);
  expect(await fJSON('2 1 >')).toEqual([true]);
});

test('precision', async () => {
  expect(await fValues('0.1 0.2 +')).toEqual([0.3]);
  expect(await fValues('0.07 10 *')).toEqual([0.7]);
});

test('trig', async () => {
  expect(await fValues('1 cos 1 sin 1 tan')).toEqual([
    Math.cos(1),
    Math.sin(1),
    Math.tan(1)
  ]);
  expect(await fValues('1 acos 1 asin 1 atan')).toEqual(
    // todo: fix acos
    [5e-20, Math.asin(1), Math.atan(1)]
  );
  expect(await fValues('1 atan 4 *')).toEqual([Math.PI]);
  expect(await fValues('1 1 atan2 4 *')).toEqual([Math.PI]);
});

test('trig 2', async () => {
  expect(await fValues('pi cos')).toEqual([-1]);
  expect(nearly((await fValues('pi sin'))[0], 0)).toBeTruthy();
});

test('constants', async () => {
  expect(await fValues('e pi')).toEqual([Math.E, Math.PI]);
});

test('ln', async () => {
  expect(await fValues('1 ln')).toEqual([0]);

  const r = await fValues('2 ln 10 ln');
  expect(nearly(r[0], 0.6931471805599453)).toBeTruthy();
  expect(nearly(r[1], 2.3025850929940458834)).toBeTruthy();
});

test('should define log', async () => {
  expect(await fValues('1 log 10 log 100 log')).toEqual([0, 1, 2]);
});

test('should define logn', async () => {
  expect(await fValues('1 10 logn 10 10 logn 100 10 logn')).toEqual([0, 1, 2]);
});

test('should define gamma', async () => {
  expect(nearly(await fValue('4 gamma'), 6)).toBeTruthy();
  expect(nearly(await fValue('1 2 / gamma'), Math.sqrt(Math.PI))).toBeTruthy();
  expect(
    nearly(await fValue('-1 2 / gamma'), -2 * Math.sqrt(Math.PI))
  ).toBeTruthy();
  expect(
    nearly(await fValue('-5 2 / gamma'), (-8 / 15) * Math.sqrt(Math.PI))
  ).toBeTruthy();
  expect(
    nearly(await fValue('102 gamma'), 9.4259477598383563846e159)
  ).toBeTruthy();
});

test('should define gamma, cont', async () => {
  expect(
    nearly(
      await fValue('1.5 gamma'),
      0.886226925452758013649083741670572591398774728061193564106
    )
  ).toBeTruthy();

  expect(
    nearly(
      await fValue('0.1 gamma'),
      9.51350769866873183629248717726540219255057862608837734305
    )
  ).toBeTruthy();
});

test('should define factorial', async () => {
  expect(await fValues('20 !')).toEqual([2432902008176640000]);
  expect(nearly(await fValue('100 !'), 9.3326215443944152704e157)).toBeTruthy();
});

test('should calculate exact powers', async () => {
  expect(await fValues('2 0 ^')).toEqual([1]);
  expect(await fValues('2 1 ^')).toEqual([2]);
  expect(await fValues('2 2 ^')).toEqual([4]);
  expect(await fValues('2 3 ^')).toEqual([8]);
  expect(await fValues('e 1 ^')).toEqual([Math.E]);
});

test(`should do Knuth's up-arrow notation`, async () => {
  expect(await fValues('3 2 ^^^')).toEqual([7625597484987]);
});

test('should define max', async () => {
  expect(await fValues('3 2 max')).toEqual([3]);
  expect(await fValues('4 7 max')).toEqual([7]);
  expect(await fValues('9 4 3 max')).toEqual([9, 4]);
});

test('should define min', async () => {
  expect(await fValues('3 2 min')).toEqual([2]);
  expect(await fValues('4 7 min')).toEqual([4]);
  expect(await fValues('9 4 3 min')).toEqual([9, 3]);
});

test('should test primes', async () => {
  expect(await fJSON('10 integers prime?: map')).toEqual([
    [false, true, true, false, true, false, true, false, false, false]
  ]);
  // 1     2     3     4      5     6      7     8      9      10

  expect(await fJSON('10 integers [ 2 swap ^ 1 - prime? ] map')).toEqual([
    [false, true, true, false, true, false, true, false, false, false]
  ]);
  // 1     2     3     4      5     6      7     8      9      10
});

test('should define number?', async () => {
  expect(await fJSON('3 number?')).toEqual([true]);
  expect(await fJSON('"4" number?')).toEqual([false]);
});

test('arg', async () => {
  expect(await fValues('0 arg')).toEqual([0]);
  expect(await fValues('-0 arg')).toEqual([0]);
  expect(await fValues('1 arg')).toEqual([0]);
  expect(await fValues('-1 arg')).toEqual([3.141592653589793]);
  expect(await fValues('10 arg')).toEqual([0]);
  expect(await fValues('-10 arg')).toEqual([3.141592653589793]);
});

test('arg of infinities', async () => {
  expect(await fValues('infinity arg')).toEqual([0]);
  expect(await fValues('infinity -1 * arg')).toEqual([3.141592653589793]);
});

test('asin', async () => {
  expect(await fValues('0 asin')).toEqual([0]);
  expect(await fValues('1 asin')).toEqual([1.5707963267948966]);
  expect(await fValues('-1 asin')).toEqual([-1.5707963267948966]);
  expect(await fValues('1 2 / asin')).toEqual([0.5235987755982989]);
  expect(await fValues('-1 2 / asin')).toEqual([-0.5235987755982989]);
});

test('acos', async () => {
  expect(await fValues('0 acos')).toEqual([1.5707963267948966]);
  expect(await fValues('1 acos')).toEqual([5e-20]);
  expect(await fValues('-1 acos')).toEqual([3.141592653589793]);
  expect(await fValues('1 2 / acos')).toEqual([1.0471975511965979]);
  expect(await fValues('-1 2 / acos')).toEqual([2.0943951023931957]);
});

test('atan', async () => {
  expect(await fValues('0 atan')).toEqual([0]);
  expect(await fValues('1 atan')).toEqual([0.7853981633974483]);
  expect(await fValues('-1 atan')).toEqual([-0.7853981633974483]);
  expect(await fValues('1 2 / atan')).toEqual([0.4636476090008061]);
  expect(await fValues('-1 2 / atan')).toEqual([-0.4636476090008061]);
  expect(await fValues('2 atan')).toEqual([
    1.107148717794090503017065460178537040070047645
  ]);
  expect(await fValues('-2 atan')).toEqual([
    -1.107148717794090503017065460178537040070047645
  ]);
});

test('asinh', async () => {
  expect(await fValues('0 asinh')).toEqual([0]);
  expect(await fValues('1 asinh')).toEqual([0.88137358701954302523]);
  expect(await fValues('-1 asinh')).toEqual([-0.88137358701954302524]);
  expect(await fValues('pi asinh')).toEqual([1.8622957433108482199]);
  expect(await fValues('pi -1 * asinh')).toEqual([-1.8622957433108482199]);
  expect(await fValues('1 2 / asinh')).toEqual([0.48121182505960344749]);
  expect(await fValues('-1 2 / asinh')).toEqual([-0.48121182505960344751]);
});

test('sum of infinities', async () => {
  expect(await fString('infinity dup +')).toEqual('Infinity');
  expect(await fString('infinity dup -1 * +')).toEqual('NaN');
});

test('subtraction of infinities', async () => {
  expect(await fString('infinity dup -')).toEqual('NaN');
  expect(await fString('infinity dup -1 * -')).toEqual('Infinity');
});

test('asinh of infinities', async () => {
  expect(await fString('infinity asinh')).toEqual('Infinity');
  expect(await fString('infinity -1 * asinh')).toEqual('-Infinity');
});

test('acosh', async () => {
  expect(await fString('0 acosh')).toEqual('0+1.5707963267948966192i');
  expect(await fString('1 acosh')).toEqual('0');
  expect(await fString('-1 acosh')).toEqual('0+3.1415926535897932385i');
  expect(await fString('pi acosh')).toEqual('1.811526272460853107');
  expect(await fString('pi -1 * acosh')).toEqual(
    '1.811526272460853107+3.1415926535897932385i'
  );
  expect(await fString('1 2 / acosh')).toEqual('-2e-20+1.0471975511965977462i');
  expect(await fString('-1 2 / acosh')).toEqual(
    '-2e-20+2.0943951023931954923i'
  );
});

test('acosh of infinities', async () => {
  expect(await fString('infinity acosh')).toEqual('Infinity');
  expect(await fString('infinity -1 * acosh')).toEqual('Infinity');
});

test('atanh', async () => {
  expect(await fString('0 atanh')).toEqual('0');
  expect(await fString('1 atanh')).toEqual('Infinity');
  expect(await fString('-1 atanh')).toEqual('-Infinity');
  expect(await fString('pi atanh')).toEqual(
    '0.3297653149566991076-1.5707963267948966193i'
  );
  expect(await fString('pi -1 * atanh')).toEqual(
    '-0.3297653149566991076+1.5707963267948966193i'
  );
  expect(await fString('1 2 / atanh')).toEqual('0.5493061443340548457');
  expect(await fString('-1 2 / atanh')).toEqual('-0.5493061443340548457');
});

test('atanh of infinities', async () => {
  expect(await fString('infinity atanh')).toEqual('0-1.5707963267948966192i');
  expect(await fString('infinity -1 * atanh')).toEqual(
    '0+1.5707963267948966192i'
  );
});

test.skip('numerical derivative', async () => {
  expect(nearly(await fValue('[ exp ] 1 1e-9 nd'), Math.E /* Math.E */)).toBe(
    true
  );
  expect(
    nearly(
      await fValue('[ sin ] 1 1e-6 nd'),
      0.54030188513256 /* Math.cos(1) */
    )
  ).toBe(true);
  expect(
    nearly(
      await fValue('[ sin 2 ^ ] 1 1e-6 nd'),
      0.90929701067825 /* Math.sin(2) */
    )
  ).toBe(true);
  expect(nearly(await fValue('ln 1 1e-19 nd'), 1)).toBe(true);
  expect(await fString('[ inv ] 0 1e-6 nd')).toBe('-Infinity');
});

test('should support neg 0', async () => {
  expect(await fValues('-0')).toEqual([-0]);
  expect(await fValues('0 -1 *')).toEqual([-0]);
});

test('should negate', async () => {
  expect(await fString('1 ~')).toBe('-1');
  expect(await fString('pi ~')).toBe('-3.1415926535897932385');
  expect(await fString('infinity ~')).toBe('-Infinity');
  expect(await fString('-infinity ~')).toBe('Infinity');
  expect(await fValues('0 ~')).toEqual([-0]); // fix this
  expect(await fValues('-0 ~')).toEqual([0]); // fix this
});

test('should << (left shift)', async () => {
  expect(await fValues('0b0001 1 <<')).toEqual([0b0010]);
  expect(await fValues('0b0001 16 <<')).toEqual([65536]);
  expect(await fValues('0b0001 32 <<')).toEqual([4294967296]);
});

test('should >> (right shift)', async () => {
  expect(await fValues('0b0100 1 >>')).toEqual([0b0010]);
  expect(await fValues('0b0010 1 >>')).toEqual([0b0001]);
  expect(await fValues('0b1000 3 >>')).toEqual([0b0001]);
});

test('bitwise ops', async () => {
  expect(await fValues('0b0001 0b0001 &')).toEqual([0b0001]);
  expect(await fValues('0b0001 0b0001 |')).toEqual([0b0001]);
  expect(await fValues('0b0001 0b0001 $')).toEqual([0b0000]);
  expect(await fValues('0b0001 bitnot')).toEqual([-2]);

  expect(await fValues('0b0001 0b0010 &')).toEqual([0b0000]);
  expect(await fValues('0b0001 0b0010 |')).toEqual([0b0011]);
  expect(await fValues('0b0001 0b0010 $')).toEqual([0b0011]);
  expect(await fValues('0b0010 bitnot')).toEqual([-3]);
});

test('number works as a "macro"', async () => {
  expect(await fValues('"5":number')).toEqual([5]);
  expect(await fValues('[ "5":number ]')).toEqual([[5]]);
});

test('get digits from a decimal', async () => {
  // 3.1415926535897932385
  expect(await fValues('pi 2 @')).toEqual([4]);
  expect(await fValues('pi -2 @')).toEqual([8]);
  expect(await fValues('pi 20 @')).toEqual([null]);

  expect(await fValues('42 0 @')).toEqual([4]);
  expect(await fValues('42 1 @')).toEqual([2]);
  expect(await fValues('42 -1 @')).toEqual([2]);
  expect(await fValues('42 -2 @')).toEqual([4]);
  expect(await fValues('42 3 @')).toEqual([null]);
});
