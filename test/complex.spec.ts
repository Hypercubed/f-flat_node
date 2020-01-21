import {
  fJSON,
  fString,
  fValues,
  fValue,
  fStack,
  nearly,
  Complex
} from './helpers/setup';
import { Decimal } from '../src/types/decimal';

const C = (
  x: Decimal | string | number | Complex,
  y: Decimal | string | number
) => new Complex(x, y).toJSON();

test('should parse i', async () => {
  expect(await fJSON('i')).toEqual([C(0, 1)]);
});

test('should return imaginary numbers from sqrt', async () => {
  expect(await fJSON('-1 sqrt')).toEqual([C(0, 1)]);
  expect(await fJSON('-4 sqrt')).toEqual([C(0, 2)]);
  expect(await fJSON('-25 sqrt')).toEqual([C(0, 5)]);
});

test('should return sqrt of imaginary numbers', async () => {
  expect(await fJSON('8 i * sqrt')).toEqual([C(2, 2)]);
  expect(await fJSON('50 i * sqrt')).toEqual([C(5, 5)]);
});

test('should return sqrt of complex numbers', async () => {
  const f = await fStack('1 i + 4 * sqrt 1 i + sqrt /');
  const cvalue = f[0] as Complex;
  expect(Number(cvalue.re)).toBe(2);
  expect(nearly(Number(cvalue.im), 0)).toBeTruthy();
});

test('should perform basic arithmetic', async () => {
  expect(await fJSON('i 3 * i +')).toEqual([C(0, 4)]);
  expect(await fJSON('i 3 * 1 +')).toEqual([C(1, 3)]);
  expect(await fJSON('i 3 * i -')).toEqual([C(0, 2)]);
  expect(await fJSON('i 3 * 1 -')).toEqual([C(-1, 3)]);
});

test('should perform basic arithmetic, cont', async () => {
  expect(await fJSON('i 3 *')).toEqual([C(0, 3)]);
  expect(await fJSON('i 2 /')).toEqual([C(0, 0.5)]);
  expect(await fValues('i dup *')).toEqual([-1]);
});

test('should calculate complex conj', async () => {
  expect(await fJSON('2 3 i * + conj')).toEqual([C(2, -3)]);
  expect(await fJSON('2 -3 i * + conj')).toEqual([C(2, 3)]);
});

test(`should evaluate Euler's Formula`, async () => {
  expect(await fValues('i pi * exp 1 + re')).toEqual([0]);
  expect(nearly(await fValue('i pi * exp 1 + im'), 0)).toBeTruthy();
});

test('should use decimals', async () => {
  expect(await fJSON('0.1 i * 0.2 i * +')).toEqual([C(0, 0.3)]);
});

test('should calculate magnitude/absolute value', async () => {
  expect(await fValues('i 1 + abs')).toEqual([Math.sqrt(2)]);
  expect(await fValues('3 4 i * + abs')).toEqual([5]);
  expect(await fValues('4 3 i * + abs')).toEqual([5]);
});

test('should calculate gamma of complex numbers', async () => {
  expect(await fJSON('i gamma')).toEqual([
    C('-0.15494982830181015806', '-0.49801566811835666783')
  ]);

  expect(await fJSON('i 1 + gamma')).toEqual([
    C('0.49801566811835599107', '-0.15494982830181068729')
  ]);
});

test('should compare complex numbers by magnitude', async () => {
  expect(await fJSON('2 1000 i * + 20 4 i * + >')).toEqual([true]);
  expect(await fJSON('2 10 i * + 20 4 i * + <')).toEqual([true]);
  expect(await fJSON('2 10 i * + 20 4 i * + >')).toEqual([false]);
});

test('should compare complex numbers with decimals by magnitude', async () => {
  expect(await fJSON('3 4 i * + 5 <')).toEqual([false]);
  expect(await fJSON('3 4 i * + 5 >')).toEqual([false]);
  expect(await fJSON('3 4 i * + 6 <')).toEqual([true]);
  expect(await fJSON('3 4 i * + 6 >')).toEqual([false]);
});

test('should compare complex numbers with decimals by magnitude, cont', async () => {
  expect(await fJSON('3 4 i * + 4 <')).toEqual([false]);
  expect(await fJSON('3 4 i * + 4 >')).toEqual([true]);
});

test('should format complex output', async () => {
  expect(await fJSON('i string')).toEqual(['0+1i']);
  expect(await fJSON('1 i + string')).toEqual(['1+1i']);
  expect(await fJSON('1 i - string')).toEqual(['1-1i']);
});

test('should calculate powers of complex numbers', async () => {
  expect(await fValues('2 i * 0 ^')).toEqual([1]);
  expect(await fValues('2 i * 1 ^ im')).toEqual([2]);
  expect(await fValues('2 i * 2 ^ re')).toEqual([-4]);
  expect(await fValues('2 i * 3 ^ im')).toEqual([-8]);
  expect(await fValues('e i * 1 ^ im')).toEqual([2.718281828459045]);
});

test('should define complex?', async () => {
  expect(await fJSON('2 i * 0 + complex?')).toEqual([true]);
  expect(await fJSON('2 1 + complex?')).toEqual([false]);
});

test('should test equality', async () => {
  expect(await fJSON('1 i * 2 i * =')).toEqual([false]);
  expect(await fJSON('2 i * 2 i * =')).toEqual([true]);
});

test('should compare', async () => {
  expect(await fValues('1 i * 1 i * <=>')).toEqual([0]);
  expect(await fValues('1 i * 2 i * <=>')).toEqual([-1]);
  expect(await fValues('2 i * 1 i * <=>')).toEqual([1]);
});

test('should test inequality', async () => {
  expect(await fJSON('1 i * 1 i * <')).toEqual([false]);
  expect(await fJSON('1 i * 1 i * >')).toEqual([false]);
  expect(await fJSON('1 i * 2 i * <')).toEqual([true]);
  expect(await fJSON('1 i * 2 i * >')).toEqual([false]);
  expect(await fJSON('2 i * 1 i * <')).toEqual([false]);
  expect(await fJSON('2 i * 1 i * >')).toEqual([true]);
});

test('ln of neg values return complex', async () => {
  expect(await fString('0 ln')).toEqual('-Infinity');
  expect(await fString('-1 ln')).toEqual('0+3.1415926535897932385i');
});

test('abs of complex', async () => {
  expect(await fString('i abs')).toEqual('1');
  expect(await fString('i -1 * abs')).toEqual('1');
  expect(await fString('i 10 * abs')).toEqual('10');
  expect(await fString('i -10 * abs')).toEqual('10');
});

test('exp of complex', async () => {
  expect(await fString('i exp')).toEqual(
    '0.5403023058681397174+0.84147098480789650665i'
  );
  expect(await fString('i -1 * exp')).toEqual(
    '0.5403023058681397174-0.84147098480789650665i'
  );
});

test('ln of complex', async () => {
  expect(await fString('i ln')).toEqual('0+1.5707963267948966192i');
  expect(await fString('i -1 * ln')).toEqual('0-1.5707963267948966192i');
});

test('trig of complex', async () => {
  expect(await fString('i sin')).toEqual('0+1.1752011936438014569i');
  expect(await fString('i cos')).toEqual('1.5430806348152437785');
  expect(await fString('i tan')).toEqual('0+0.76159415595576488812i');
});

test('inverse trig of complex', async () => {
  expect(await fString('i asin')).toEqual('0+0.88137358701954302524i');
  expect(await fString('i acos')).toEqual(
    '1.5707963267948966193-0.8813735870195430253i'
  );
  expect(await fString('i 2 / atan')).toEqual('0+0.5493061443340548457i');
});

test('hyper trig of complex', async () => {
  expect(await fString('i sinh')).toEqual('5e-21+0.84147098480789650665i');
  expect(await fString('i cosh')).toEqual('0.5403023058681397174+1e-20i');
  expect(await fString('i tanh')).toEqual(
    '7.7870386232745111526e-21+1.5574077246549022305i'
  );
});

test('inverse hyper trig of complex', async () => {
  expect(await fString('i asinh')).toEqual('0+1.5707963267948966192i');
  expect(await fString('i acosh')).toEqual(
    '0.88137358701954302519+1.5707963267948966192i'
  );
  expect(await fString('i atanh')).toEqual('0+0.78539816339744830962i');
});

test('trig out of range returns complex values', async () => {
  expect(await fString('2 asin')).toEqual(
    '1.5707963267948966192-1.3169578969248167086i'
  );
  expect(await fString('-2 asin')).toEqual(
    '-1.5707963267948966192+1.3169578969248167085i'
  );
  expect(await fString('2 acos')).toEqual('5e-20+1.3169578969248167087i');
  expect(await fString('-2 acos')).toEqual(
    '3.1415926535897932385-1.3169578969248167085i'
  );
});

test('abs of complex infinities', async () => {
  expect(await fString('i infinity * abs')).toEqual('Infinity');
  expect(await fString('i -1 * infinity * abs')).toEqual('Infinity');
});

test('inverse trig functions on infinities', async () => {
  expect(await fString('infinity asin')).toEqual('0-Infinityi');
  expect(await fString('infinity -1 * asin')).toEqual('0+Infinityi');

  expect(await fString('infinity acos')).toEqual('0+Infinityi');
  expect(await fString('infinity -1 * acos')).toEqual('0-Infinityi');

  expect(await fString('infinity atan')).toEqual('1.5707963267948966192');
  expect(await fString('infinity -1 * atan')).toEqual('-1.5707963267948966192');
});

test('div and mul complex infinity', async () => {
  expect(await fString('infinity i * 1 *')).toEqual('0+Infinityi');
  expect(await fString('infinity i * 1 /')).toEqual('0+Infinityi');
  expect(await fString('infinity i * 2 *')).toEqual('0+Infinityi');
  expect(await fString('infinity i * 2 /')).toEqual('0+Infinityi');
});

test('exp of complex infinity', async () => {
  expect(await fString('infinity i * exp')).toEqual('NaN');
  expect(await fString('infinity i * -1 * exp')).toEqual('NaN');
});

test('arg of complex infinity', async () => {
  expect(await fString('infinity i * arg')).toEqual('1.5707963267948966192');
  expect(await fString('infinity i * -1 * arg')).toEqual(
    '-1.5707963267948966192'
  );
});

test('infinity plus complex', async () => {
  expect(await fString('infinity i +')).toEqual('Infinity');
  expect(await fString('infinity i -')).toEqual('Infinity');
});

test('ln of complex infinity', async () => {
  expect(await fString('infinity i * ln')).toEqual('Infinity');
  expect(await fString('infinity i * -1 * ln')).toEqual('Infinity');
});

test('trig functions on complex infinities', async () => {
  expect(await fString('infinity i * sin')).toEqual('0+Infinityi');
  expect(await fString('infinity -1 * i * sin')).toEqual('0-Infinityi');

  expect(await fString('infinity i * cos')).toEqual('Infinity');
  expect(await fString('infinity -1 * i * cos')).toEqual('Infinity');

  expect(await fString('infinity i * tan')).toEqual('0+1i');
  expect(await fString('infinity -1 * i * tan')).toEqual('-0-1i');
});

test('inverse trig functions on complex infinities', async () => {
  expect(await fString('infinity i * asin')).toEqual('0+Infinityi');
  expect(await fString('infinity i * -1 * asin')).toEqual('0-Infinityi');

  expect(await fString('infinity i * acos')).toEqual('0-Infinityi');
  expect(await fString('infinity i * -1 * acos')).toEqual('0+Infinityi');

  expect(await fString('infinity i * atan')).toEqual('1.5707963267948966192');
  expect(await fString('infinity i * -1 * atan')).toEqual(
    '-1.5707963267948966192'
  );
});

test('hyperbolic inverse trig functions on complex infinities', async () => {
  expect(await fString('infinity i * asinh')).toEqual('Infinity');
  expect(await fString('infinity i * -1 * asinh')).toEqual('-Infinity');

  expect(await fString('infinity i * acosh')).toEqual('Infinity');
  expect(await fString('infinity i * acosh')).toEqual('Infinity');

  expect(await fString('infinity i * atanh')).toEqual(
    '0+1.5707963267948966192i'
  );
  expect(await fString('infinity i * -1 * atanh')).toEqual(
    '0-1.5707963267948966192i'
  );
});

test('should negate', async () => {
  expect(await fString('i 3 * ~')).toEqual('-0-3i');
  expect(await fString('pi i 1 + * ~')).toEqual(
    '-3.141592653589793-3.141592653589793i'
  );
});

test('floor division', async () => {
  expect(await fString('i 3 * i 2 * \\')).toEqual('1');
});

test('complex', async () => {
  expect(await fString('5 complex')).toEqual('5');
  expect(await fString('[5,3] complex')).toEqual('5+3i');
  expect(await fString('"5+3i" complex')).toEqual('5+3i');
  expect(await fString('"5" complex')).toEqual('5');
  expect(await fString('"3i" complex')).toEqual('0+3i');
  expect(await fString('"0.03+0.86i" complex')).toEqual('0.03+0.86i');
  expect(await fString('"0.0_3e+100+0.8_6e-100i" complex')).toEqual(
    '3e+98+8.6e-101i'
  );
});

test('complex works as a "macro"', async () => {
  expect(await fValues('5:complex')).toEqual([5]);
  expect(await fValues('[ 5:complex ]')).toEqual([[5]]);
  expect(await fString('[ [5,3]:complex ]')).toEqual('5+3i');
  expect(await fValues('[ [5,3]:complex ] ln')).toEqual([1]);
});
