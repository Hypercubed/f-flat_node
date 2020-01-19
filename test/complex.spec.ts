import test from 'ava';
import { fJSON, fString, fValues, fValue, fStack, nearly, Complex } from './helpers/setup';
import { Decimal } from '../src/types/decimal';

const C = (x: Decimal | string | number | Complex, y: Decimal | string | number) => new Complex(x, y).toJSON();

test('should parse i', async t => {
  t.deepEqual(await fJSON('i'), [C(0, 1)]);
});

test('should return imaginary numbers from sqrt', async t => {
  t.deepEqual(await fJSON('-1 sqrt'), [C(0, 1)]);
  t.deepEqual(await fJSON('-4 sqrt'), [C(0, 2)]);
  t.deepEqual(await fJSON('-25 sqrt'), [C(0, 5)]);
});

test('should return sqrt of imaginary numbers', async t => {
  t.deepEqual(await fJSON('8 i * sqrt'), [C(2, 2)]);
  t.deepEqual(await fJSON('50 i * sqrt'), [C(5, 5)]);
});

test('should return sqrt of complex numbers', async t => {
  const f = await fStack('1 i + 4 * sqrt 1 i + sqrt /');
  const cvalue = f[0] as Complex;
  t.is(Number(cvalue.re), 2);
  t.truthy(nearly(Number(cvalue.im), 0));
});

test('should perform basic arithmetic', async t => {
  t.deepEqual(await fJSON('i 3 * i +'), [C(0, 4)]);
  t.deepEqual(await fJSON('i 3 * 1 +'), [C(1, 3)]);
  t.deepEqual(await fJSON('i 3 * i -'), [C(0, 2)]);
  t.deepEqual(await fJSON('i 3 * 1 -'), [C(-1, 3)]);
});

test('should perform basic arithmetic, cont', async t => {
  t.deepEqual(await fJSON('i 3 *'), [C(0, 3)], 'should multiply complex');
  t.deepEqual(await fJSON('i 2 /'), [C(0, 0.5)], 'should divide complex');
  t.deepEqual(await fValues('i dup *'), [-1], 'should square complex');
});

test('should calculate complex conj', async t => {
  t.deepEqual(await fJSON('2 3 i * + conj'), [C(2, -3)]);
  t.deepEqual(await fJSON('2 -3 i * + conj'), [C(2, 3)]);
});

test('should evaluate Euler\'s Formula', async t => {
  t.deepEqual(await fValues('i pi * exp 1 + re'), [0]);
  t.truthy(nearly(await fValue('i pi * exp 1 + im'), 0));
});

test('should use decimals', async t => {
  t.deepEqual(
    await fJSON('0.1 i * 0.2 i * +'),
    [C(0, 0.3)],
    'should use decimals'
  );
});

test('should calculate magnitude/absolute value', async t => {
  t.deepEqual(await fValues('i 1 + abs'), [Math.sqrt(2)]);
  t.deepEqual(await fValues('3 4 i * + abs'), [5]);
  t.deepEqual(await fValues('4 3 i * + abs'), [5]);
});

test('should calculate gamma of complex numbers', async t => {
  t.deepEqual(await fJSON('i gamma'), [
    C('-0.15494982830181015806', '-0.49801566811835666783')
  ]);

  t.deepEqual(await fJSON('i 1 + gamma'), [
    C('0.49801566811835599107', '-0.15494982830181068729')
  ]);
});

test('should compare complex numbers by magnitude', async t => {
  t.deepEqual(await fJSON('2 1000 i * + 20 4 i * + >'), [true]);
  t.deepEqual(await fJSON('2 10 i * + 20 4 i * + <'), [true]);
  t.deepEqual(await fJSON('2 10 i * + 20 4 i * + >'), [false]);
});

test('should compare complex numbers with decimals by magnitude', async t => {
  t.deepEqual(await fJSON('3 4 i * + 5 <'), [false]);
  t.deepEqual(await fJSON('3 4 i * + 5 >'), [false]);
  t.deepEqual(await fJSON('3 4 i * + 6 <'), [true]);
  t.deepEqual(await fJSON('3 4 i * + 6 >'), [false]);
});

test('should compare complex numbers with decimals by magnitude, cont', async t => {
  t.deepEqual(await fJSON('3 4 i * + 4 <'), [false]);
  t.deepEqual(await fJSON('3 4 i * + 4 >'), [true]);
});

test('should format complex output', async t => {
  t.deepEqual(await fJSON('i string'), ['0+1i']);
  t.deepEqual(await fJSON('1 i + string'), ['1+1i']);
  t.deepEqual(await fJSON('1 i - string'), ['1-1i']);
});

test('should calculate powers of complex numbers', async t => {
  t.deepEqual(await fValues('2 i * 0 ^'), [1]);
  t.deepEqual(await fValues('2 i * 1 ^ im'), [2]);
  t.deepEqual(await fValues('2 i * 2 ^ re'), [-4]);
  t.deepEqual(await fValues('2 i * 3 ^ im'), [-8]);
  t.deepEqual(await fValues('e i * 1 ^ im'), [2.718281828459045]);
});

test('should define complex?', async t => {
  t.deepEqual(await fJSON('2 i * 0 + complex?'), [true]);
  t.deepEqual(await fJSON('2 1 + complex?'), [false]);
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('1 i * 2 i * ='), [false], 'should test equality');
  t.deepEqual(await fJSON('2 i * 2 i * ='), [true], 'should test equality');
});

test('should compare', async t => {
  t.deepEqual(await fValues('1 i * 1 i * <=>'), [0]);
  t.deepEqual(await fValues('1 i * 2 i * <=>'), [-1]);
  t.deepEqual(await fValues('2 i * 1 i * <=>'), [1]);
});

test('should test inequality', async t => {
  t.deepEqual(await fJSON('1 i * 1 i * <'), [false]);
  t.deepEqual(await fJSON('1 i * 1 i * >'), [false]);
  t.deepEqual(await fJSON('1 i * 2 i * <'), [true]);
  t.deepEqual(await fJSON('1 i * 2 i * >'), [false]);
  t.deepEqual(await fJSON('2 i * 1 i * <'), [false]);
  t.deepEqual(await fJSON('2 i * 1 i * >'), [true]);
});

test('ln of neg values return complex', async t => {
  t.deepEqual(await fString('0 ln'), '-Infinity');
  t.deepEqual(await fString('-1 ln'), '0+3.1415926535897932385i');
});

test('abs of complex', async t => {
  t.deepEqual(await fString('i abs'), '1');
  t.deepEqual(await fString('i -1 * abs'), '1');
  t.deepEqual(await fString('i 10 * abs'), '10');
  t.deepEqual(await fString('i -10 * abs'), '10');
});

test('exp of complex', async t => {
  t.deepEqual(await fString('i exp'), '0.5403023058681397174+0.84147098480789650665i');
  t.deepEqual(await fString('i -1 * exp'), '0.5403023058681397174-0.84147098480789650665i');
});

test('ln of complex', async t => {
  t.deepEqual(await fString('i ln'), '0+1.5707963267948966192i');
  t.deepEqual(await fString('i -1 * ln'), '0-1.5707963267948966192i');
});

test('trig of complex', async t => {
  t.deepEqual(await fString('i sin'), '0+1.1752011936438014569i');
  t.deepEqual(await fString('i cos'), '1.5430806348152437785');
  t.deepEqual(await fString('i tan'), '0+0.76159415595576488812i');
});

test('inverse trig of complex', async t => {
  t.deepEqual(await fString('i asin'), '0+0.88137358701954302524i');
  t.deepEqual(await fString('i acos'), '1.5707963267948966193-0.8813735870195430253i');
  t.deepEqual(await fString('i 2 / atan'), '0+0.5493061443340548457i');
});

test('hyper trig of complex', async t => {
  t.deepEqual(await fString('i sinh'), '5e-21+0.84147098480789650665i');
  t.deepEqual(await fString('i cosh'), '0.5403023058681397174+1e-20i');
  t.deepEqual(await fString('i tanh'), '7.7870386232745111526e-21+1.5574077246549022305i');
});

test('inverse hyper trig of complex', async t => {
  t.deepEqual(await fString('i asinh'), '0+1.5707963267948966192i');
  t.deepEqual(await fString('i acosh'), '0.88137358701954302519+1.5707963267948966192i');
  t.deepEqual(await fString('i atanh'), '0+0.78539816339744830962i');
});

test('trig out of range returns complex values', async t => {
  t.deepEqual(await fString('2 asin'), '1.5707963267948966192-1.3169578969248167086i');
  t.deepEqual(await fString('-2 asin'), '-1.5707963267948966192+1.3169578969248167085i');
  t.deepEqual(await fString('2 acos'), '5e-20+1.3169578969248167087i');
  t.deepEqual(await fString('-2 acos'), '3.1415926535897932385-1.3169578969248167085i');
});

test('abs of complex infinities', async t => {
  t.deepEqual(await fString('i infinity * abs'), 'Infinity');
  t.deepEqual(await fString('i -1 * infinity * abs'), 'Infinity');
});

test('inverse trig functions on infinities', async t => {
  t.deepEqual(await fString('infinity asin'), '0-Infinityi');
  t.deepEqual(await fString('infinity -1 * asin'), '0+Infinityi');

  t.deepEqual(await fString('infinity acos'), '0+Infinityi');
  t.deepEqual(await fString('infinity -1 * acos'), '0-Infinityi');

  t.deepEqual(await fString('infinity atan'), '1.5707963267948966192');
  t.deepEqual(await fString('infinity -1 * atan'), '-1.5707963267948966192');
});

test('div and mul complex infinity', async t => {
  t.deepEqual(await fString('infinity i * 1 *'), '0+Infinityi');
  t.deepEqual(await fString('infinity i * 1 /'), '0+Infinityi');
  t.deepEqual(await fString('infinity i * 2 *'), '0+Infinityi');
  t.deepEqual(await fString('infinity i * 2 /'), '0+Infinityi');
});

test('exp of complex infinity', async t => {
  t.deepEqual(await fString('infinity i * exp'), 'NaN');
  t.deepEqual(await fString('infinity i * -1 * exp'), 'NaN');
});

test('arg of complex infinity', async t => {
  t.deepEqual(await fString('infinity i * arg'), '1.5707963267948966192');
  t.deepEqual(await fString('infinity i * -1 * arg'), '-1.5707963267948966192');
});

test('infinity plus complex', async t => {
  t.deepEqual(await fString('infinity i +'), 'Infinity');
  t.deepEqual(await fString('infinity i -'), 'Infinity');
});

test('ln of complex infinity', async t => {
  t.deepEqual(await fString('infinity i * ln'), 'Infinity');
  t.deepEqual(await fString('infinity i * -1 * ln'), 'Infinity');
});

test('trig functions on complex infinities', async t => {
  t.deepEqual(await fString('infinity i * sin'), '0+Infinityi');
  t.deepEqual(await fString('infinity -1 * i * sin'), '0-Infinityi');

  t.deepEqual(await fString('infinity i * cos'), 'Infinity');
  t.deepEqual(await fString('infinity -1 * i * cos'), 'Infinity');

  t.deepEqual(await fString('infinity i * tan'), '0+1i');
  t.deepEqual(await fString('infinity -1 * i * tan'), '-0-1i');
});

test('inverse trig functions on complex infinities', async t => {
  t.deepEqual(await fString('infinity i * asin'), '0+Infinityi');
  t.deepEqual(await fString('infinity i * -1 * asin'), '0-Infinityi');

  t.deepEqual(await fString('infinity i * acos'), '0-Infinityi');
  t.deepEqual(await fString('infinity i * -1 * acos'), '0+Infinityi');

  t.deepEqual(await fString('infinity i * atan'), '1.5707963267948966192');
  t.deepEqual(await fString('infinity i * -1 * atan'), '-1.5707963267948966192');
});

test('hyperbolic inverse trig functions on complex infinities', async t => {
  t.deepEqual(await fString('infinity i * asinh'), 'Infinity');
  t.deepEqual(await fString('infinity i * -1 * asinh'), '-Infinity');

  t.deepEqual(await fString('infinity i * acosh'), 'Infinity');
  t.deepEqual(await fString('infinity i * acosh'), 'Infinity');

  t.deepEqual(await fString('infinity i * atanh'), '0+1.5707963267948966192i');
  t.deepEqual(await fString('infinity i * -1 * atanh'), '0-1.5707963267948966192i');
});

test('should negate', async t => {
  t.deepEqual(await fString('i 3 * ~'), '-0-3i');
  t.deepEqual(await fString('pi i 1 + * ~'), '-3.141592653589793-3.141592653589793i');
});

test('floor division', async t => {
  t.deepEqual(await fString('i 3 * i 2 * \\'), '1');
});

test('complex', async t => {
  t.deepEqual(await fString('5 complex'), '5');
  t.deepEqual(await fString('[5,3] complex'), '5+3i');
  t.deepEqual(await fString('"5+3i" complex'), '5+3i');
  t.deepEqual(await fString('"5" complex'), '5');
  t.deepEqual(await fString('"3i" complex'), '0+3i');
  t.deepEqual(await fString('"0.03+0.86i" complex'), '0.03+0.86i');
  t.deepEqual(await fString('"0.0_3e+100+0.8_6e-100i" complex'), '3e+98+8.6e-101i');
});

test('complex works as a "macro"', async t => {
  t.deepEqual(await fValues('5:complex'), [5]);
  t.deepEqual(await fValues('[ 5:complex ]'), [[ 5 ]]);
  t.deepEqual(await fString('[ [5,3]:complex ]'), '5+3i');
  t.deepEqual(await fValues('[ [5,3]:complex ] ln'), [1]);
});

