import test from 'ava';
import { F, fSync, nearly, Complex } from './setup';

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

test('should comparey', t => {
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