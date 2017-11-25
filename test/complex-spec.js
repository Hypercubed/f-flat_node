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

test('trig', t => {
  t.deepEqual(fSyncString('i sin'), '0+1.1752011936438014569i');
  t.deepEqual(fSyncString('i cos'), '1.5430806348152437785');
  t.deepEqual(fSyncString('i tan'), '0+0.76159415595576488814i');
});

test('inverse trig', t => {
  t.deepEqual(fSyncString('i asin'), '0+0.88137358701954302521i');
  t.deepEqual(fSyncString('i acos'), '1.5707963267948966-0.88137358701954302521i');
  t.deepEqual(fSyncString('i 2 / atan'), '0+0.5493061443340548457i')
});

test('hyper trig', t => {
  t.deepEqual(fSyncString('i sinh'), '-5e-21+0.84147098480789650665i');
  t.deepEqual(fSyncString('i cosh'), '0.5403023058681397174-5e-21i');
  t.deepEqual(fSyncString('i tanh'), '8.5637970520368994024e-21+1.5574077246549022305i');
});

test('inverse hyper tridg', t => {
  t.deepEqual(fSyncString('i asinh'), '0+1.5707963267948966192i');
  t.deepEqual(fSyncString('i acosh'), '0.88137358701954302523+1.5707963267948966192i');
  t.deepEqual(fSyncString('i atanh'), '0+0.7853981633974483096i');
});

test('trig out of range', t => {
  t.deepEqual(fSyncString('2 asin'), '1.5707963267948966192-1.3169578969248167086i');
  t.deepEqual(fSyncString('2 acos'), '-1.92e-17+1.3169578969248167086i');
});

test('asin and acos of infinity', t => {
  t.deepEqual(fSyncString('infinity asin'), '0-Infinityi');
  t.deepEqual(fSyncString('infinity -1 * asin'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity acos'), '0+Infinityi');
  t.deepEqual(fSyncString('infinity -1 * acos'), '0-Infinityi');

  // t.deepEqual(fSyncString('infinity i * asin'), '0+Infinityi');
  // t.deepEqual(fSyncString('infinity i * acos'), '0-Infinityi');
});


