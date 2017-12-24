import test from 'ava';
import { F, fSyncJSON, fSyncString, fSyncValues, nearly, Complex } from './setup';

const C = (x, y) => new Complex(x, y).toJSON(); 

test('should parse i', t => {
  t.deepEqual(fSyncJSON('i'), [C(0,1)]);
});

test('should return imaginary numbers from sqrt', t => {
  t.deepEqual(fSyncJSON('-1 sqrt'), [C(0,1)]);
  t.deepEqual(fSyncJSON('-4 sqrt'), [C(0,2)]);
  t.deepEqual(fSyncJSON('-25 sqrt'), [C(0,5)]);
});

test('should return sqrt of imaginary numbers', t => {
  t.deepEqual(fSyncJSON('8 i * sqrt'), [C(2,2)]);
  t.deepEqual(fSyncJSON('50 i * sqrt'), [C(5, 5)]);
});

test('should return sqrt of complex numbers', t => {
  const f = new F().eval('1 i + 4 * sqrt 1 i + sqrt /');
  const cvalue = f.stack[0];
  t.is(Number(cvalue.re), 2);
  t.truthy(nearly(Number(cvalue.im), 0));
});

test('should perform basic arithmetic', t => {
  t.deepEqual(fSyncJSON('i 3 * i +'), [C(0,4)]);
  t.deepEqual(fSyncJSON('i 3 * 1 +'), [C(1, 3)]);
  t.deepEqual(fSyncJSON('i 3 * i -'), [C(0, 2)]);
  t.deepEqual(fSyncJSON('i 3 * 1 -'), [C(-1, 3)]);
});

test('should perform basic arithmetic, cont', t => {
  t.deepEqual(fSyncJSON('i 3 *'), [C(0, 3)], 'should multiply complex');
  t.deepEqual(fSyncJSON('i 2 /'), [C(0, 0.5)], 'should divide complex');
  t.deepEqual(fSyncValues('i dup *'), [-1], 'should square complex');
});

test('should calculate complex conj', t => {
  t.deepEqual(fSyncJSON('2 3 i * + conj'), [C(2, -3)]);
  t.deepEqual(fSyncJSON('2 -3 i * + conj'), [C(2, 3)]);
});

test('should evaluate Euler\'s Formula', t => {
  t.deepEqual(fSyncValues('i pi * exp 1 + re'), [0]);
  t.truthy(nearly(new F().eval('i pi * exp 1 + im').toArray()[0], [0]));
});

test('should use decimals', t => {
  t.deepEqual(
    fSyncJSON('0.1 i * 0.2 i * +'),
    [C(0, 0.3)],
    'should use decimals'
  );
});

test('should calculate magnitude/absolute value', t => {
  t.deepEqual(fSyncValues('i 1 + abs'), [Math.sqrt(2)]);
  t.deepEqual(fSyncValues('3 4 i * + abs'), [5]);
  t.deepEqual(fSyncValues('4 3 i * + abs'), [5]);
});

test('should calculate gamma of complex numbers', t => {
  t.deepEqual(fSyncJSON('i gamma'), [
    C('-0.15494982830181015806', '-0.49801566811835666783')
  ]);

  t.deepEqual(fSyncJSON('i 1 + gamma'), [
    C('0.49801566811835599107', '-0.15494982830181068729')
  ]);
});

test('should compare complex numbers by magnitude', t => {
  t.deepEqual(fSyncJSON('2 1000 i * + 20 4 i * + >'), [true]);
  t.deepEqual(fSyncJSON('2 10 i * + 20 4 i * + <'), [true]);
  t.deepEqual(fSyncJSON('2 10 i * + 20 4 i * + >'), [false]);
});

test('should compare complex numbers with decimals by magnitude', t => {
  t.deepEqual(fSyncJSON('3 4 i * + 5 <'), [false]);
  t.deepEqual(fSyncJSON('3 4 i * + 5 >'), [false]);
  t.deepEqual(fSyncJSON('3 4 i * + 6 <'), [true]);
  t.deepEqual(fSyncJSON('3 4 i * + 6 >'), [false]);
});

test('should compare complex numbers with decimals by magnitude, cont', t => {
  t.deepEqual(fSyncJSON('3 4 i * + 4 <'), [false]);
  t.deepEqual(fSyncJSON('3 4 i * + 4 >'), [true]);
});

test('should format complex output', t => {
  t.deepEqual(fSyncJSON('i string'), ['0+1i']);
  t.deepEqual(fSyncJSON('1 i + string'), ['1+1i']);
  t.deepEqual(fSyncJSON('1 i - string'), ['1-1i']);
});

test('should calculate powers of complex numbers', t => {
  t.deepEqual(fSyncValues('2 i * 0 ^'), [1]);
  t.deepEqual(fSyncValues('2 i * 1 ^ im'), [2]);
  t.deepEqual(fSyncValues('2 i * 2 ^ re'), [-4]);
  t.deepEqual(fSyncValues('2 i * 3 ^ im'), [-8]);
  t.deepEqual(fSyncValues('e i * 1 ^ im'), [2.718281828459045]);
});

test('should define complex?', t => {
  t.deepEqual(fSyncJSON('2 i * 0 + complex?'), [true]);
  t.deepEqual(fSyncJSON('2 1 + complex?'), [false]);
});

test('should test equality', t => {
  t.deepEqual(fSyncJSON('1 i * 2 i * ='), [false], 'should test equality');
  t.deepEqual(fSyncJSON('2 i * 2 i * ='), [true], 'should test equality');
});

test('should compare', t => {
  t.deepEqual(fSyncValues('1 i * 1 i * <=>'), [0]);
  t.deepEqual(fSyncValues('1 i * 2 i * <=>'), [-1]);
  t.deepEqual(fSyncValues('2 i * 1 i * <=>'), [1]);
});

test('should test inequality', t => {
  t.deepEqual(fSyncJSON('1 i * 1 i * <'), [false]);
  t.deepEqual(fSyncJSON('1 i * 1 i * >'), [false]);
  t.deepEqual(fSyncJSON('1 i * 2 i * <'), [true]);
  t.deepEqual(fSyncJSON('1 i * 2 i * >'), [false]);
  t.deepEqual(fSyncJSON('2 i * 1 i * <'), [false]);
  t.deepEqual(fSyncJSON('2 i * 1 i * >'), [true]);
});

test('ln of neg values return complex', t => {
  t.deepEqual(fSyncString('0 ln'), '-Infinity');
  t.deepEqual(fSyncString('-1 ln'), '0+3.1415926535897932385i');
});

test('abs of complex', t => {
  t.deepEqual(fSyncString('i abs'), '1');
  t.deepEqual(fSyncString('i -1 * abs'), '1');
  t.deepEqual(fSyncString('i 10 * abs'), '10');
  t.deepEqual(fSyncString('i -10 * abs'), '10');
});

test('exp of complex', t => {
  t.deepEqual(fSyncString('i exp'), '0.5403023058681397174+0.84147098480789650665i');
  t.deepEqual(fSyncString('i -1 * exp'), '0.5403023058681397174-0.84147098480789650665i');
});

test('ln of complex', t => {
  t.deepEqual(fSyncString('i ln'), '0+1.5707963267948966192i');
  t.deepEqual(fSyncString('i -1 * ln'), '0-1.5707963267948966192i');
});

test('trig of complex', t => {
  t.deepEqual(fSyncString('i sin'), '0+1.1752011936438014569i');
  t.deepEqual(fSyncString('i cos'), '1.5430806348152437785');
  t.deepEqual(fSyncString('i tan'), '0+0.76159415595576488812i');
});

test('inverse trig of complex', t => {
  t.deepEqual(fSyncString('i asin'), '0+0.88137358701954302524i');
  t.deepEqual(fSyncString('i acos'), '1.5707963267948966193-0.8813735870195430253i');
  t.deepEqual(fSyncString('i 2 / atan'), '0+0.5493061443340548457i')
});

test('hyper trig of complex', t => {
  t.deepEqual(fSyncString('i sinh'), '5e-21+0.84147098480789650665i');
  t.deepEqual(fSyncString('i cosh'), '0.5403023058681397174+1e-20i');
  t.deepEqual(fSyncString('i tanh'), '7.7870386232745111526e-21+1.5574077246549022305i');
});

test('inverse hyper trig of complex', t => {
  t.deepEqual(fSyncString('i asinh'), '0+1.5707963267948966192i');
  t.deepEqual(fSyncString('i acosh'), '0.88137358701954302519+1.5707963267948966192i');
  t.deepEqual(fSyncString('i atanh'), '0+0.78539816339744830962i');
});

test('trig out of range returns complex values', t => {
  t.deepEqual(fSyncString('2 asin'), '1.5707963267948966192-1.3169578969248167086i');
  t.deepEqual(fSyncString('-2 asin'), '-1.5707963267948966192+1.3169578969248167085i');
  t.deepEqual(fSyncString('2 acos'), '5e-20+1.3169578969248167087i');
  t.deepEqual(fSyncString('-2 acos'), '3.1415926535897932385-1.3169578969248167085i');
});

test('abs of complex infinities', t => {
  t.deepEqual(fSyncString('i infinity * abs'), 'Infinity');
  t.deepEqual(fSyncString('i -1 * infinity * abs'), 'Infinity');
});

test('inverse trig functions on infinities', t => {
  t.deepEqual(fSyncString('infinity asin'), '0-Infinityi');
  t.deepEqual(fSyncString('infinity -1 * asin'), '0+Infinityi');

  t.deepEqual(fSyncString('infinity acos'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity -1 * acos'), '0-Infinityi');

  t.deepEqual(fSyncString('infinity atan'), '1.5707963267948966192');
  t.deepEqual(fSyncString('infinity -1 * atan'), '-1.5707963267948966192');
});

test('div and mul complex infinity', t => {
  t.deepEqual(fSyncString('infinity i * 1 *'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity i * 1 /'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity i * 2 *'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity i * 2 /'), '0+Infinityi');
});

test('exp of complex infinity', t => {
  t.deepEqual(fSyncString('infinity i * exp'), 'NaN');
  t.deepEqual(fSyncString('infinity i * -1 * exp'), 'NaN');
});

test('arg of complex infinity', t => {
  t.deepEqual(fSyncString('infinity i * arg'), '1.5707963267948966192');
  t.deepEqual(fSyncString('infinity i * -1 * arg'), '-1.5707963267948966192');
});

test('infinity plus complex', t => {
  t.deepEqual(fSyncString('infinity i +'), 'Infinity');
  t.deepEqual(fSyncString('infinity i -'), 'Infinity');
});

test('ln of complex infinity', t => {
  t.deepEqual(fSyncString('infinity i * ln'), 'Infinity');
  t.deepEqual(fSyncString('infinity i * -1 * ln'), 'Infinity');
});

test('trig functions on complex infinities', t => {
  t.deepEqual(fSyncString('infinity i * sin'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity -1 * i * sin'), '0-Infinityi');

  t.deepEqual(fSyncString('infinity i * cos'), 'Infinity');
  t.deepEqual(fSyncString('infinity -1 * i * cos'), 'Infinity');

  t.deepEqual(fSyncString('infinity i * tan'), '0+1i');
  t.deepEqual(fSyncString('infinity -1 * i * tan'), '-0-1i');
});

test('inverse trig functions on complex infinities', t => {
  t.deepEqual(fSyncString('infinity i * asin'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity i * -1 * asin'), '0-Infinityi');

  t.deepEqual(fSyncString('infinity i * acos'), '0-Infinityi');
  t.deepEqual(fSyncString('infinity i * -1 * acos'), '0+Infinityi');

  t.deepEqual(fSyncString('infinity i * atan'), '1.5707963267948966192');
  t.deepEqual(fSyncString('infinity i * -1 * atan'), '-1.5707963267948966192');
});

test('hyperbolic inverse trig functions on complex infinities', t => {
  t.deepEqual(fSyncString('infinity i * asinh'), 'Infinity');
  t.deepEqual(fSyncString('infinity i * -1 * asinh'), '-Infinity');

  t.deepEqual(fSyncString('infinity i * acosh'), 'Infinity');
  t.deepEqual(fSyncString('infinity i * acosh'), 'Infinity');

  t.deepEqual(fSyncString('infinity i * atanh'), '0+1.5707963267948966192i');
  t.deepEqual(fSyncString('infinity i * -1 * atanh'), '0-1.5707963267948966192i');
});

test('should negate', t => {
  t.deepEqual(fSyncString('i 3 * ~'), '-0-3i');
  t.deepEqual(fSyncString('pi i 1 + * ~'), '-3.141592653589793-3.141592653589793i');
});

test('floor division', t => {
  t.deepEqual(fSyncString('i 3 * i 2 * \\'), '1');
});

