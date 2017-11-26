import test from 'ava';
import { F, fSync, fSyncString, nearly, Complex } from './setup';

const I = new Complex(0, 1).toJSON();
const I2 = new Complex(0, 2).toJSON();
const I5 = new Complex(0, 5).toJSON();
const ONE = new Complex(1, 0).toJSON();

test('should parse i', t => {
  t.deepEqual(fSync('i'), [I]);
});

test('should return imaginary numbers from sqrt', t => {
  t.deepEqual(fSync('-1 sqrt'), [I]);
  t.deepEqual(fSync('-4 sqrt'), [I2]);
  t.deepEqual(fSync('-25 sqrt'), [I5]);
});

test('should return sqrt of imaginary numbers', t => {
  t.deepEqual(fSync('8 i * sqrt'), [new Complex(2, 2).toJSON()]);
  t.deepEqual(fSync('50 i * sqrt'), [new Complex(5, 5).toJSON()]);
});

test('should return sqrt of complex numbers', t => {
  const f = new F().eval('1 i + 4 * sqrt 1 i + sqrt /');
  const cvalue = f.stack[0];
  t.is(Number(cvalue.re), 2);
  t.truthy(nearly(Number(cvalue.im), 0));
});

test('should perform basic arithmetic', t => {
  t.deepEqual(fSync('i 3 * i +'), [new Complex(0, 4).toJSON()]);
  t.deepEqual(fSync('i 3 * 1 +'), [new Complex(1, 3).toJSON()]);
  t.deepEqual(fSync('i 3 * i -'), [new Complex(0, 2).toJSON()]);
  t.deepEqual(fSync('i 3 * 1 -'), [new Complex(-1, 3).toJSON()]);
});

test('should perform basic arithmetic, cont', t => {
  t.deepEqual(fSync('i 3 *'), [new Complex(0, 3).toJSON()], 'should multiply complex');
  t.deepEqual(fSync('i 2 /'), [new Complex(0, 0.5).toJSON()], 'should divide complex');
  t.deepEqual(fSync('i dup *'), [-1], 'should square complex');
});

test('should evaluate Euler\'s Formula', t => {
  t.deepEqual(fSync('i pi * exp 1 + re'), [0]);
  t.truthy(nearly(new F().eval('i pi * exp 1 + im').toArray()[0], [0]));
});

test('should use decimals', t => {
  t.deepEqual(
    fSync('0.1 i * 0.2 i * +'),
    [new Complex(0, 0.3).toJSON()],
    'should use decimals'
  );
});

test('should calculate magnitude/absolute value', t => {
  t.deepEqual(fSync('i 1 + abs'), [Math.sqrt(2)]);
  t.deepEqual(fSync('3 4 i * + abs'), [5]);
  t.deepEqual(fSync('4 3 i * + abs'), [5]);
});

test('should calculate gamma of complex numbers', t => {
  t.deepEqual(fSync('i gamma'), [
    new Complex(-0.15494982830181017, -0.4980156681183567).toJSON()
    //  -0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
    //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
  ]);

  t.deepEqual(fSync('i 1 + gamma'), [
    new Complex(0.498015668118356, -0.1549498283018107).toJSON()
    //  0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
    //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
  ]);
});

test('should compare complex numbers by magnitude', t => {
  t.deepEqual(fSync('2 1000 i * + 20 4 i * + >'), [true]);
  t.deepEqual(fSync('2 10 i * + 20 4 i * + <'), [true]);
  t.deepEqual(fSync('2 10 i * + 20 4 i * + >'), [false]);
});

test('should compare complex numbers with decimals by magnitude', t => {
  t.deepEqual(fSync('3 4 i * + 5 <'), [false]);
  t.deepEqual(fSync('3 4 i * + 5 >'), [false]);
  t.deepEqual(fSync('3 4 i * + 6 <'), [true]);
  t.deepEqual(fSync('3 4 i * + 6 >'), [false]);
});

test('should compare complex numbers with decimals by magnitude, cont', t => {
  t.deepEqual(fSync('3 4 i * + 4 <'), [false]);
  t.deepEqual(fSync('3 4 i * + 4 >'), [true]);
});

test('should format complex output', t => {
  t.deepEqual(fSync('i string'), ['0+1i']);
  t.deepEqual(fSync('1 i + string'), ['1+1i']);
  t.deepEqual(fSync('1 i - string'), ['1-1i']);
});

test('should calculate powers of complex numbers', t => {
  t.deepEqual(fSync('2 i * 0 ^'), [ONE]);
  t.deepEqual(fSync('2 i * 1 ^ im'), [2]);
  t.deepEqual(fSync('2 i * 2 ^ re'), [-4]);
  t.deepEqual(fSync('2 i * 3 ^ im'), [-8]);
  t.deepEqual(fSync('e i * 1 ^ im'), [2.718281828459045]);
});

test('should define complex?', t => {
  t.deepEqual(fSync('2 i * 0 + complex?'), [true]);
  t.deepEqual(fSync('2 1 + complex?'), [false]);
});

test('should test equality', t => {
  t.deepEqual(fSync('1 i * 2 i * ='), [false], 'should test equality');
  t.deepEqual(fSync('2 i * 2 i * ='), [true], 'should test equality');
});

test('should compare', t => {
  t.deepEqual(fSync('1 i * 1 i * cmp'), [0]);
  t.deepEqual(fSync('1 i * 2 i * cmp'), [-1]);
  t.deepEqual(fSync('2 i * 1 i * cmp'), [1]);
});

test('should test inequality', t => {
  t.deepEqual(fSync('1 i * 1 i * <'), [false]);
  t.deepEqual(fSync('1 i * 1 i * >'), [false]);
  t.deepEqual(fSync('1 i * 2 i * <'), [true]);
  t.deepEqual(fSync('1 i * 2 i * >'), [false]);
  t.deepEqual(fSync('2 i * 1 i * <'), [false]);
  t.deepEqual(fSync('2 i * 1 i * >'), [true]);
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
  t.deepEqual(fSyncString('infinity -1 * i * tan'), '0-1i');
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
