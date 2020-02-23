import { ƒ, τ, Decimal } from './helpers/setup';

const PI = Decimal.atan(1).mul(4);
const E = Decimal.exp(1);

test('should perform basic arithmetic', async () => {
  expect(await ƒ('1 2 +')).toEqual(`[ 3 ]`);
  expect(await ƒ('1 2 -')).toEqual(`[ -1 ]`);
  expect(await ƒ('2 3 *')).toEqual(`[ 6 ]`);
  expect(await ƒ('3 2 /')).toEqual(`[ 1.5 ]`);
  expect(await ƒ('3 2 \\')).toEqual(`[ 1 ]`);
  expect(await ƒ('3 2 %')).toEqual(`[ 1 ]`);
});

test('should div by zero, returns complex infinity', async () => {
  expect(await ƒ('1 0 /')).toEqual('[ ComplexInfinity ]');
  expect(await ƒ('1 0 \\')).toEqual('[ ComplexInfinity ]');
});

test('should test equality', async () => {
  expect(await ƒ('1 2 =')).toEqual(`[ false ]`);
  expect(await ƒ('2 2 =')).toEqual(`[ true ]`);
});

test('should test equality of -0', async () => {
  expect(await ƒ('0 0 =')).toEqual(`[ true ]`);
  expect(await ƒ('0 -0 =')).toEqual(`[ true ]`);
  expect(await ƒ('-0 -0 =')).toEqual(`[ true ]`);
  expect(await ƒ('-0 0 =')).toEqual(`[ true ]`);
});

test('should compare', async () => {
  expect(await ƒ('1 1 <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('1 2 <=>')).toEqual(`[ -1 ]`);
  expect(await ƒ('2 1 <=>')).toEqual(`[ 1 ]`);
});

test('should <=> with -0', async () => {
  // todo: better comparisons with NaN
  expect(await ƒ('0 0 <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('0 -0 <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('-0 -0 <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('-0 0 <=>')).toEqual(`[ 0 ]`);
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
  expect(await ƒ('infinity infinity <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('-infinity -infinity <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('infinity -infinity <=>')).toEqual(`[ 1 ]`);
  expect(await ƒ('-infinity infinity <=>')).toEqual(`[ -1 ]`);
  expect(await ƒ('infinity 0 <=>')).toEqual(`[ 1 ]`);
  expect(await ƒ('-infinity 0 <=>')).toEqual(`[ -1 ]`);
  expect(await ƒ('0 -infinity <=>')).toEqual(`[ 1 ]`);
  expect(await ƒ('0 infinity <=>')).toEqual(`[ -1 ]`);
});

test('should test inequality', async () => {
  expect(await ƒ('1 1 <')).toEqual(`[ false ]`);
  expect(await ƒ('1 1 >')).toEqual(`[ false ]`);
  expect(await ƒ('1 2 <')).toEqual(`[ true ]`);
  expect(await ƒ('1 2 >')).toEqual(`[ false ]`);
  expect(await ƒ('2 1 <')).toEqual(`[ false ]`);
  expect(await ƒ('2 1 >')).toEqual(`[ true ]`);
});

test('precision', async () => {
  expect(await ƒ('0.1 0.2 +')).toEqual(`[ 0.3 ]`);
  expect(await ƒ('0.07 10 *')).toEqual(`[ 0.7 ]`);
});

test('trig', async () => {
  expect(await ƒ('1 cos 1 sin 1 tan')).toEqual(
    `[ ${Decimal.cos(1)} ${Decimal.sin(1)} ${Decimal.tan(1)} ]`
  );
  expect(await ƒ('1 acos 1 asin 1 atan')).toEqual(
    `[ 5e-20 ${Decimal.asin(1)} ${Decimal.atan(1)} ]`
  ); // fix acos
  expect(await ƒ('1 atan 4 *')).toEqual(`[ ${PI} ]`);
  expect(await ƒ('1 1 atan2 4 *')).toEqual(`[ ${PI} ]`);
});

test('trig 2', async () => {
  expect(await ƒ('pi cos')).toEqual(`[ -1 ]`);
  expect(await ƒ('pi sin')).toEqual(`[ ${Decimal.sin(PI)} ]`);
});

test('constants', async () => {
  expect(await ƒ('e pi')).toEqual(`[ ${E} ${PI} ]`);
});

test('ln', async () => {
  expect(await ƒ('1 ln')).toEqual(`[ 0 ]`);
  expect(await ƒ('2 ln')).toEqual(`[ ${Decimal.ln(2)} ]`);
  expect(await ƒ('10 ln')).toEqual(`[ ${Decimal.ln(10)} ]`);
});

// test('should define log', async () => {
//   expect(await fValues('1 log 10 log 100 log')).toEqual([0, 1, 2]);
// });

// test('should define logn', async () => {
//   expect(await fValues('1 10 logn 10 10 logn 100 10 logn')).toEqual([0, 1, 2]);
// });

test('should define gamma', async () => {
  expect(await ƒ('4 gamma')).toEqual(`[ 5.999999999999999133 ]`);
  // 6
  expect(await ƒ('1 2 / gamma')).toEqual(`[ 1.7724538509055159719 ]`); // ${Decimal.sqrt(PI)}
  // 1.772453850905516027298167483341145182797549456122387128213
  expect(await ƒ('-1 2 / gamma')).toEqual(`[ -3.5449077018110324568 ]`); // ${Decimal.sqrt(PI).mul(-2)}
  // -3.54490770181103205459633496668229036559509891224477425642
  expect(await ƒ('-5 2 / gamma')).toEqual(`[ -0.94530872048294201518 ]`); // ${Decimal.sqrt(PI).mul(-8 / 15)}
  // -0.94530872048294188122568932444861076415869304326527313504
  expect(await ƒ('102 gamma')).toEqual(`[ 9.4259477598383563846e+159 ]`);
  // 9.4259477598383594208516231244829367495623127947025437 × 10^159
  expect(await ƒ('1.5 gamma')).toEqual(`[ 0.88622692545275791311 ]`);
  // 0.8862269254527580136490837416705725913987747280611935
  expect(await ƒ('0.1 gamma')).toEqual(`[ 9.5135076986687327389 ]`);
  // 9.5135076986687318362924871772654021925505786260883773
});

test('should define factorial', async () => {
  expect(await ƒ('20 !')).toEqual(`[ 2432902008176640000 ]`);
  expect(await ƒ('1000 !')).toEqual(`[ 4.0238726007709377384e+2567 ]`);
});

test('should calculate exact powers', async () => {
  expect(await ƒ('2 0 ^')).toEqual(`[ 1 ]`);
  expect(await ƒ('2 1 ^')).toEqual(`[ 2 ]`);
  expect(await ƒ('2 2 ^')).toEqual(`[ 4 ]`);
  expect(await ƒ('2 3 ^')).toEqual(`[ 8 ]`);
  expect(await ƒ('e 1 ^')).toEqual(`[ ${Decimal.exp(1)} ]`);

  expect(await ƒ('0 1 ^')).toEqual(`[ 0 ]`);
  expect(await ƒ('0 10 ^')).toEqual(`[ 0 ]`);

  expect(await ƒ('2 53 ^')).toEqual(`[ 9007199254740992 ]`);
  expect(await ƒ('2 54 ^')).toEqual(`[ 18014398509481984 ]`);

  expect(await ƒ('0 0 ^')).toEqual(`[ ComplexInfinity ]`); // check this (indeterminate?)
});

test('should calculate inexact powers', async () => {
  expect(await ƒ('2 1024 ^')).toEqual(`[ 1.7976931348623159077e+308 ]`);
                                      // 1.7976931348623159077293051907890247336179769789423065 × 10^308
});

test(`should do Knuth's up-arrow notation`, async () => {
  expect(await ƒ('3 2 ^^^')).toEqual(`[ 7625597484987 ]`);
});

test('should define max', async () => {
  expect(await ƒ('3 2 max')).toEqual(`[ 3 ]`);
  expect(await ƒ('4 7 max')).toEqual(`[ 7 ]`);
  expect(await ƒ('9 4 3 max')).toEqual(`[ 9 4 ]`);
});

test('should define min', async () => {
  expect(await ƒ('3 2 min')).toEqual(`[ 2 ]`);
  expect(await ƒ('4 7 min')).toEqual(`[ 4 ]`);
  expect(await ƒ('9 4 3 min')).toEqual(`[ 9 3 ]`);
});

// test('should test primes', async () => {
//   expect(await fJSON('10 integers [ prime? ] map')).toEqual([
//     [false, true, true, false, true, false, true, false, false, false]
//   ]);
//   // 1     2     3     4      5     6      7     8      9      10

//   expect(await fJSON('10 integers [ 2 swap ^ 1 - prime? ] map')).toEqual([
//     [false, true, true, false, true, false, true, false, false, false]
//   ]);
//   // 1     2     3     4      5     6      7     8      9      10
// });

test('should define number?', async () => {
  expect(await ƒ('3 number?')).toEqual(`[ true ]`);
  expect(await ƒ('"4" number?')).toEqual(`[ false ]`);
});

test('arg', async () => {
  expect(await ƒ('0 arg')).toEqual(`[ 0 ]`);
  expect(await ƒ('-0 arg')).toEqual(`[ 0 ]`);
  expect(await ƒ('1 arg')).toEqual(`[ 0 ]`);
  expect(await ƒ('-1 arg')).toEqual(`[ ${PI} ]`);
  expect(await ƒ('10 arg')).toEqual(`[ 0 ]`);
  expect(await ƒ('-10 arg')).toEqual(`[ ${PI} ]`);
});

test('arg of infinities', async () => {
  expect(await ƒ('infinity arg')).toEqual(`[ 0 ]`);
  expect(await ƒ('infinity -1 * arg')).toEqual(`[ ${PI} ]`);
});

test('asin', async () => {
  expect(await ƒ('0 asin')).toEqual(`[ 0 ]`);
  expect(await ƒ('1 asin')).toEqual(`[ ${Decimal.asin(1)} ]`);
  expect(await ƒ('-1 asin')).toEqual(`[ ${Decimal.asin(-1)} ]`);
  expect(await ƒ('1 2 / asin')).toEqual(`[ ${Decimal.asin(1 / 2)} ]`);
  expect(await ƒ('-1 2 / asin')).toEqual(`[ ${Decimal.asin(-1 / 2)} ]`);
});

// test('acos', async () => {
//   expect(await fValues('0 acos')).toEqual([1.5707963267948966]);
//   expect(await fValues('1 acos')).toEqual([5e-20]);
//   expect(await fValues('-1 acos')).toEqual([3.141592653589793]);
//   expect(await fValues('1 2 / acos')).toEqual([1.0471975511965979]);
//   expect(await fValues('-1 2 / acos')).toEqual([2.0943951023931957]);
// });

test('atan', async () => {
  expect(await ƒ('0 atan')).toEqual(`[ 0 ]`);
  expect(await ƒ('1 atan')).toEqual(`[ ${Decimal.atan(1)} ]`);
  expect(await ƒ('-1 atan')).toEqual(`[ ${Decimal.atan(-1)} ]`);
  expect(await ƒ('1 2 / atan')).toEqual(`[ ${Decimal.atan(1 / 2)} ]`);
  expect(await ƒ('-1 2 / atan')).toEqual(`[ ${Decimal.atan(-1 / 2)} ]`);
  expect(await ƒ('2 atan')).toEqual(`[ ${Decimal.atan(2)} ]`);
  expect(await ƒ('-2 atan')).toEqual(`[ ${Decimal.atan(-2)} ]`);
});

test('asinh', async () => {
  expect(await ƒ('0 asinh')).toEqual(`[ 0 ]`);
  expect(await ƒ('1 asinh')).toEqual(`[ ${Decimal.asinh(1)} ]`);
  expect(await ƒ('-1 asinh')).toEqual(`[ -0.88137358701954302524 ]`);
  expect(await ƒ('pi asinh')).toEqual(`[ ${Decimal.asinh(PI)} ]`);
  expect(await ƒ('pi -1 * asinh')).toEqual(`[ -${Decimal.asinh(PI)} ]`);
  expect(await ƒ('1 2 / asinh')).toEqual(`[ 0.48121182505960344749 ]`);
  // 0.481211825059603447497758913424368423135184334385660519661
  expect(await ƒ('-1 2 / asinh')).toEqual(`[ -0.48121182505960344751 ]`);
});

test('sum of infinities', async () => {
  expect(await ƒ('infinity dup +')).toEqual('[ Infinity ]');
  expect(await ƒ('infinity dup -1 * +')).toEqual('[ NaN ]');
});

test('subtraction of infinities', async () => {
  expect(await ƒ('infinity dup -')).toEqual('[ NaN ]');
  expect(await ƒ('infinity dup -1 * -')).toEqual('[ Infinity ]');
});

test('asinh of infinities', async () => {
  expect(await ƒ('infinity asinh')).toEqual('[ Infinity ]');
  expect(await ƒ('infinity -1 * asinh')).toEqual('[ -Infinity ]');
});

test('acosh', async () => {
  expect(await ƒ('0 acosh')).toEqual(`[ 0+1.5707963267948966192i ]`);
  expect(await ƒ('1 acosh')).toEqual('[ 0 ]');
  expect(await ƒ('-1 acosh')).toEqual(`[ 0+${PI}i ]`);
  expect(await ƒ('pi acosh')).toEqual('[ 1.811526272460853107 ]');
  expect(await ƒ('pi -1 * acosh')).toEqual(`[ 1.811526272460853107+${PI}i ]`);
  expect(await ƒ('1 2 / acosh')).toEqual('[ -2e-20+1.0471975511965977462i ]');
  expect(await ƒ('-1 2 / acosh')).toEqual('[ -2e-20+2.0943951023931954923i ]');
});

test('acosh of infinities', async () => {
  expect(await ƒ('infinity acosh')).toEqual('[ Infinity ]');
  expect(await ƒ('infinity -1 * acosh')).toEqual('[ Infinity ]');
});

test('atanh', async () => {
  expect(await ƒ('0 atanh')).toEqual('[ 0 ]');
  expect(await ƒ('1 atanh')).toEqual('[ Infinity ]');
  expect(await ƒ('-1 atanh')).toEqual('[ -Infinity ]');
  expect(await ƒ('pi atanh')).toEqual(
    '[ 0.3297653149566991076-1.5707963267948966193i ]'
  );
  expect(await ƒ('pi -1 * atanh')).toEqual(
    '[ -0.3297653149566991076+1.5707963267948966193i ]'
  );
  expect(await ƒ('1 2 / atanh')).toEqual('[ 0.5493061443340548457 ]');
  expect(await ƒ('-1 2 / atanh')).toEqual('[ -0.5493061443340548457 ]');
});

test('atanh of infinities', async () => {
  expect(await ƒ('infinity atanh')).toEqual('[ 0-1.5707963267948966192i ]');
  expect(await ƒ('infinity -1 * atanh')).toEqual(
    '[ 0+1.5707963267948966192i ]'
  );
});

test('should support neg 0', async () => {
  expect(await ƒ('-0')).toEqual(`[ -0 ]`);
  expect(await ƒ('0 -1 *')).toEqual(`[ -0 ]`);
});

test('should negate', async () => {
  expect(await ƒ('1 ~')).toBe('[ -1 ]');
  expect(await ƒ('pi ~')).toBe('[ -3.1415926535897932385 ]');
  expect(await ƒ('infinity ~')).toBe('[ -Infinity ]');
  expect(await ƒ('-infinity ~')).toBe('[ Infinity ]');
  expect(await ƒ('0 ~')).toEqual(`[ -0 ]`);
  expect(await ƒ('-0 ~')).toEqual(`[ 0 ]`);
});

test('should << (left shift)', async () => {
  expect(await ƒ('0b0001 1 <<')).toEqual(τ([0b0010]));
  expect(await ƒ('0b0001 16 <<')).toEqual(τ([65536]));
  expect(await ƒ('0b0001 32 <<')).toEqual(τ([4294967296]));
});

test('should >> (right shift)', async () => {
  expect(await ƒ('0b0100 1 >>')).toEqual(τ([0b0010]));
  expect(await ƒ('0b0010 1 >>')).toEqual(τ([0b0001]));
  expect(await ƒ('0b1000 3 >>')).toEqual(τ([0b0001]));
});

test('bitwise ops', async () => {
  expect(await ƒ('0b0001 0b0001 bit-and')).toEqual(τ([0b0001]));
  expect(await ƒ('0b0001 0b0001 bit-or')).toEqual(τ([0b0001]));
  expect(await ƒ('0b0001 0b0001 bit-xor')).toEqual(τ([0b0000]));
  expect(await ƒ('0b0001 bit-not')).toEqual(`[ -2 ]`); // 32 bits Bitwise!!

  expect(await ƒ('0b0001 0b0010 bit-and')).toEqual(τ([0b0000]));
  expect(await ƒ('0b0001 0b0010 bit-or')).toEqual(τ([0b0011]));
  expect(await ƒ('0b0001 0b0010 bit-xor')).toEqual(τ([0b0011]));
  expect(await ƒ('0b0010 bit-not')).toEqual(`[ -3 ]`); // 32 bits Bitwise!!
});

test('number works as a "macro"', async () => {
  expect(await ƒ('"5" :number')).toEqual(`[ 5 ]`);
  expect(await ƒ('[ "5" :number ]')).toEqual(`[ [ 5 ] ]`);
});

test('get digits from a decimal', async () => {
  // 3.1415926535897932385
  //    ^               ^
  expect(await ƒ('pi 2 @')).toEqual(`[ 4 ]`);
  expect(await ƒ('pi -2 @')).toEqual(`[ 8 ]`);
  expect(await ƒ('pi 20 @')).toEqual(`[ null ]`);

  expect(await ƒ('42 0 @')).toEqual(`[ 4 ]`);
  expect(await ƒ('42 1 @')).toEqual(`[ 2 ]`);
  expect(await ƒ('42 -1 @')).toEqual(`[ 2 ]`);
  expect(await ƒ('42 -2 @')).toEqual(`[ 4 ]`);
  expect(await ƒ('42 3 @')).toEqual(`[ null ]`);
});
