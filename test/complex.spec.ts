import {
  ƒ,
  τ,
  Complex
} from './helpers/setup';
import { Decimal } from '../src/types/decimal';

const C = (
  x: Decimal | string | number | Complex,
  y: Decimal | string | number
) => new Complex(x, y).toJSON();

test('should parse i', async () => {
  expect(await ƒ('i')).toBe(`[ 0+1i ]`);
});

test('should return imaginary numbers from sqrt', async () => {
  expect(await ƒ('-1 sqrt')).toBe(`[ 0+1i ]`);
  expect(await ƒ('-4 sqrt')).toBe(`[ 0+2i ]`);
  expect(await ƒ('-25 sqrt')).toBe(`[ 0+5i ]`);
});

test('should return sqrt of imaginary numbers', async () => {
  expect(await ƒ('8 i * sqrt')).toBe(`[ 2+2i ]`);
  expect(await ƒ('50 i * sqrt')).toBe(`[ 5+5i ]`);
});

test('should return sqrt of complex numbers', async () => {
  expect(await ƒ('1 i + 4 * sqrt 1 i + sqrt /')).toBe(`[ 1.9999999999999999999 ]`); // 2
});

test('should perform basic arithmetic', async () => {
  expect(await ƒ('i 3 * i +')).toBe(`[ 0+4i ]`);
  expect(await ƒ('i 3 * 1 +')).toBe(`[ 1+3i ]`);
  expect(await ƒ('i 3 * i -')).toBe(`[ 0+2i ]`);
  expect(await ƒ('i 3 * 1 -')).toBe(`[ -1+3i ]`);
});

test('should perform basic arithmetic, cont', async () => {
  expect(await ƒ('i 3 *')).toBe(`[ 0+3i ]`);
  expect(await ƒ('i 2 /')).toBe(`[ 0+0.5i ]`);
  expect(await ƒ('i dup *')).toBe(`[ -1 ]`);
});

test('should calculate complex conj', async () => {
  expect(await ƒ('2 3 i * + conj')).toBe(`[ 2-3i ]`);
  expect(await ƒ('2 -3 i * + conj')).toBe(`[ 2+3i ]`);
});

test(`should evaluate Euler's Formula`, async () => {
  expect(await ƒ('i pi * exp 1 + re')).toBe(`[ 0 ]`);
  expect(await ƒ('i pi * exp 1 + im')).toBe(`[ -3.7356616720497115803e-20 ]`); // 0
});

test('should use decimals', async () => {
  expect(await ƒ('0.1 i * 0.2 i * +')).toBe(`[ 0+0.3i ]`);
});

test('should calculate magnitude/absolute value', async () => {
  expect(await ƒ('3 4 i * + abs')).toBe(`[ 5 ]`);
  expect(await ƒ('4 3 i * + abs')).toBe(`[ 5 ]`);
});

test('should calculate gamma of complex numbers', async () => {
  expect(await ƒ('i gamma')).toBe(τ([new Complex('-0.15494982830181015806', '-0.49801566811835666783')]));
  expect(await ƒ('i 1 + gamma')).toBe(τ([new Complex('0.49801566811835599107', '-0.15494982830181068729')]));
});

test('should compare complex numbers by magnitude', async () => {
  expect(await ƒ('2 1000 i * + 20 4 i * + >')).toBe(`[ true ]`);
  expect(await ƒ('2 10 i * + 20 4 i * + <')).toBe(`[ true ]`);
  expect(await ƒ('2 10 i * + 20 4 i * + >')).toBe(`[ false ]`);
});

test('should compare complex numbers with decimals by magnitude', async () => {
  expect(await ƒ('3 4 i * + 5 <')).toBe(`[ false ]`);
  expect(await ƒ('3 4 i * + 5 >')).toBe(`[ false ]`);
  expect(await ƒ('3 4 i * + 6 <')).toBe(`[ true ]`);
  expect(await ƒ('3 4 i * + 6 >')).toBe(`[ false ]`);
});

test('should compare complex numbers with decimals by magnitude, cont', async () => {
  expect(await ƒ('3 4 i * + 4 <')).toBe(`[ false ]`);
  expect(await ƒ('3 4 i * + 4 >')).toBe(`[ true ]`);
});

test('should format complex output', async () => {
  expect(await ƒ('i string')).toBe(`[ '0+1i' ]`);
  expect(await ƒ('1 i + string')).toBe(`[ '1+1i' ]`);
  expect(await ƒ('1 i - string')).toBe(`[ '1-1i' ]`);
});

test('should calculate powers of complex numbers', async () => {
  expect(await ƒ('2 i * 0 ^')).toBe(`[ 1 ]`);
  expect(await ƒ('2 i * 1 ^ im')).toBe(`[ 2 ]`);
  expect(await ƒ('2 i * 2 ^ re')).toBe(`[ -3.9999999999999999999 ]`); // [ -4 ]
  expect(await ƒ('2 i * 3 ^ im')).toMatch(/\[ -8\..* \]/);  // [ -8 ]
  expect(await ƒ('e i * 1 ^ im')).toBe(`[ 2.7182818284590452354 ]`);
});

test('should define complex?', async () => {
  expect(await ƒ('2 i * 0 + complex?')).toBe(`[ true ]`);
  expect(await ƒ('2 1 + complex?')).toBe(`[ false ]`);
});

test('should test equality', async () => {
  expect(await ƒ('1 i * 2 i * =')).toBe(`[ false ]`);
  expect(await ƒ('2 i * 2 i * =')).toBe(`[ true ]`);
});

test('should compare', async () => {
  expect(await ƒ('1 i * 1 i * <=>')).toBe(`[ 0 ]`);
  expect(await ƒ('1 i * 2 i * <=>')).toBe(`[ -1 ]`);
  expect(await ƒ('2 i * 1 i * <=>')).toBe(`[ 1 ]`);
});

test('should test inequality', async () => {
  expect(await ƒ('1 i * 1 i * <')).toBe(`[ false ]`);
  expect(await ƒ('1 i * 1 i * >')).toBe(`[ false ]`);
  expect(await ƒ('1 i * 2 i * <')).toBe(`[ true ]`);
  expect(await ƒ('1 i * 2 i * >')).toBe(`[ false ]`);
  expect(await ƒ('2 i * 1 i * <')).toBe(`[ false ]`);
  expect(await ƒ('2 i * 1 i * >')).toBe(`[ true ]`);
});

test('ln of neg values return complex', async () => {
  expect(await ƒ('0 ln')).toBe('[ -Infinity ]');
  expect(await ƒ('-1 ln')).toBe('[ 0+3.1415926535897932385i ]');
});

test('abs of complex', async () => {
  expect(await ƒ('i abs')).toBe('[ 1 ]');
  expect(await ƒ('i -1 * abs')).toBe('[ 1 ]');
  expect(await ƒ('i 10 * abs')).toBe('[ 10 ]');
  expect(await ƒ('i -10 * abs')).toBe('[ 10 ]');
});

test('exp of complex', async () => {
  expect(await ƒ('i exp')).toBe('[ 0.5403023058681397174+0.84147098480789650665i ]');
  expect(await ƒ('i -1 * exp')).toBe('[ 0.5403023058681397174-0.84147098480789650665i ]');
});

test('ln of complex', async () => {
  expect(await ƒ('i ln')).toBe('[ 0+1.5707963267948966192i ]');
  expect(await ƒ('i -1 * ln')).toBe('[ 0-1.5707963267948966192i ]');
});

test('trig of complex', async () => {
  expect(await ƒ('i sin')).toBe('[ 0+1.1752011936438014569i ]');
  expect(await ƒ('i cos')).toBe('[ 1.5430806348152437785 ]');
  expect(await ƒ('i tan')).toBe('[ 0+0.76159415595576488812i ]');
});

test('inverse trig of complex', async () => {
  expect(await ƒ('i asin')).toBe('[ 0+0.88137358701954302524i ]');
  expect(await ƒ('i acos')).toBe('[ 1.5707963267948966193-0.8813735870195430253i ]');
  expect(await ƒ('i 2 / atan')).toBe('[ 0+0.5493061443340548457i ]');
});

test('hyper trig of complex', async () => {
  expect(await ƒ('i sinh')).toBe('[ 5e-21+0.84147098480789650665i ]');
  expect(await ƒ('i cosh')).toBe('[ 0.5403023058681397174+1e-20i ]');
  expect(await ƒ('i tanh')).toBe('[ 7.7870386232745111526e-21+1.5574077246549022305i ]');
});

test('inverse hyper trig of complex', async () => {
  expect(await ƒ('i asinh')).toBe('[ 0+1.5707963267948966192i ]');
  expect(await ƒ('i acosh')).toBe('[ 0.88137358701954302519+1.5707963267948966192i ]');
  expect(await ƒ('i atanh')).toBe('[ 0+0.78539816339744830962i ]');
});

test('trig out of range returns complex values', async () => {
  expect(await ƒ('2 asin')).toBe('[ 1.5707963267948966192-1.3169578969248167086i ]');
  expect(await ƒ('-2 asin')).toBe('[ -1.5707963267948966192+1.3169578969248167085i ]');
  expect(await ƒ('2 acos')).toBe('[ 5e-20+1.3169578969248167087i ]');
  expect(await ƒ('-2 acos')).toBe('[ 3.1415926535897932385-1.3169578969248167085i ]');
});

test('abs of complex infinities', async () => {
  expect(await ƒ('i infinity * abs')).toBe('[ Infinity ]');
  expect(await ƒ('i -1 * infinity * abs')).toBe('[ Infinity ]');
});

test('inverse trig functions on infinities', async () => {
  expect(await ƒ('infinity asin')).toBe('[ 0-Infinityi ]');
  expect(await ƒ('infinity -1 * asin')).toBe('[ 0+Infinityi ]');

  expect(await ƒ('infinity acos')).toBe('[ 0+Infinityi ]');
  expect(await ƒ('infinity -1 * acos')).toBe('[ 0-Infinityi ]');

  expect(await ƒ('infinity atan')).toBe('[ 1.5707963267948966192 ]');
  expect(await ƒ('infinity -1 * atan')).toBe('[ -1.5707963267948966192 ]');
});

test('div and mul complex infinity', async () => {
  expect(await ƒ('infinity i * 1 *')).toBe('[ 0+Infinityi ]');
  expect(await ƒ('infinity i * 1 /')).toBe('[ 0+Infinityi ]');
  expect(await ƒ('infinity i * 2 *')).toBe('[ 0+Infinityi ]');
  expect(await ƒ('infinity i * 2 /')).toBe('[ 0+Infinityi ]');
});

test('exp of complex infinity', async () => {
  expect(await ƒ('infinity i * exp')).toBe('[ NaN ]');
  expect(await ƒ('infinity i * -1 * exp')).toBe('[ NaN ]');
});

test('arg of complex infinity', async () => {
  expect(await ƒ('infinity i * arg')).toBe('[ 1.5707963267948966192 ]');
  expect(await ƒ('infinity i * -1 * arg')).toBe('[ -1.5707963267948966192 ]');
});

test('infinity plus complex', async () => {
  expect(await ƒ('infinity i +')).toBe('[ Infinity ]');
  expect(await ƒ('infinity i -')).toBe('[ Infinity ]');
});

test('ln of complex infinity', async () => {
  expect(await ƒ('infinity i * ln')).toBe('[ Infinity ]');
  expect(await ƒ('infinity i * -1 * ln')).toBe('[ Infinity ]');
});

test('trig functions on complex infinities', async () => {
  expect(await ƒ('infinity i * sin')).toBe('[ 0+Infinityi ]');
  expect(await ƒ('infinity -1 * i * sin')).toBe('[ 0-Infinityi ]');

  expect(await ƒ('infinity i * cos')).toBe('[ Infinity ]');
  expect(await ƒ('infinity -1 * i * cos')).toBe('[ Infinity ]');

  expect(await ƒ('infinity i * tan')).toBe('[ 0+1i ]');
  expect(await ƒ('infinity -1 * i * tan')).toBe('[ -0-1i ]');
});

test('inverse trig functions on complex infinities', async () => {
  expect(await ƒ('infinity i * asin')).toBe('[ 0+Infinityi ]');
  expect(await ƒ('infinity i * -1 * asin')).toBe('[ 0-Infinityi ]');

  expect(await ƒ('infinity i * acos')).toBe('[ 0-Infinityi ]');
  expect(await ƒ('infinity i * -1 * acos')).toBe('[ 0+Infinityi ]');

  expect(await ƒ('infinity i * atan')).toBe('[ 1.5707963267948966192 ]');
  expect(await ƒ('infinity i * -1 * atan')).toBe('[ -1.5707963267948966192 ]');
});

test('hyperbolic inverse trig functions on complex infinities', async () => {
  expect(await ƒ('infinity i * asinh')).toBe('[ Infinity ]');
  expect(await ƒ('infinity i * -1 * asinh')).toBe('[ -Infinity ]');

  expect(await ƒ('infinity i * acosh')).toBe('[ Infinity ]');
  expect(await ƒ('infinity i * acosh')).toBe('[ Infinity ]');

  expect(await ƒ('infinity i * atanh')).toBe(
    '[ 0+1.5707963267948966192i ]'
  );
  expect(await ƒ('infinity i * -1 * atanh')).toBe(
    '[ 0-1.5707963267948966192i ]'
  );
});

test('should negate', async () => {
  expect(await ƒ('i 3 * ~')).toBe('[ -0-3i ]');
  expect(await ƒ('pi i 1 + * ~')).toBe(
    '[ -3.141592653589793-3.141592653589793i ]'
  );
});

test('floor division', async () => {
  expect(await ƒ('i 3 * i 2 * \\')).toBe('[ 1 ]');
});

test('complex', async () => {
  expect(await ƒ('5 complex')).toBe('[ 5 ]');
  expect(await ƒ('[5,3] complex')).toBe('[ 5+3i ]');
  expect(await ƒ('"5+3i" complex')).toBe('[ 5+3i ]');
  expect(await ƒ('"5" complex')).toBe('[ 5 ]');
  expect(await ƒ('"3i" complex')).toBe('[ 0+3i ]');
  expect(await ƒ('"0.03+0.86i" complex')).toBe('[ 0.03+0.86i ]');
  expect(await ƒ('"0.0_3e+100+0.8_6e-100i" complex')).toBe(
    '[ 3e+98+8.6e-101i ]'
  );
});

test('complex works as a "macro"', async () => {
  expect(await ƒ('5:complex')).toBe(`[ 5 ]`);
  expect(await ƒ('[ 5:complex ]')).toBe(`[ [ 5 ] ]`);
  expect(await ƒ('[5,3]:complex')).toBe('[ 5+3i ]');
  expect(await ƒ('[ [5,3]:complex ] ln')).toBe(`[ 1 ]`);
});
