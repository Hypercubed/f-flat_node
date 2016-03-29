import test from 'ava';
import {F, fSync, nearly} from './setup';

test('should parse i', t => {
  t.same(fSync('i'), [{im: 1, re: 0}]);
});

test('should return imaginary numbers from sqrt', t => {
  t.same(fSync('-1 sqrt'), [{im: 1, re: 0}]);
  t.same(fSync('-4 sqrt'), [{im: 2, re: 0}]);
  t.same(fSync('-25 sqrt'), [{im: 5, re: 0}]);
});

test('should return sqrt of imaginary numbers', t => {
  t.same(fSync('8 i * sqrt'), [{im: 2, re: 2}]);
  t.same(fSync('50 i * sqrt'), [{im: 5, re: 5}]);
});

test('should return sqrt of complex numbers', t => {
  const f = new F().eval('1 i + 4 * sqrt 1 i + sqrt /').toArray();
  t.is(f[0].re, 2);
  t.ok(nearly(f[0].im, 0));
});

test('should perform basic arithmetic', t => {
  t.same(fSync('i 3 * i +'), [{im: 4, re: 0}]);
  t.same(fSync('i 3 * 1 +'), [{im: 3, re: 1}]);
  t.same(fSync('i 3 * i -'), [{im: 2, re: 0}]);
  t.same(fSync('i 3 * 1 -'), [{im: 3, re: -1}]);
});

test('should perform basic arithmetic, cont', t => {
  t.same(fSync('i 3 *'), [{im: 3, re: 0}], 'should multiply complex');
  t.same(fSync('i 2 /'), [{im: 0.5, re: 0}], 'should divide complex');
  t.same(fSync('i dup *'), [-1], 'should square complex');
});

test('should evaluate Euler\'s Formula', t => {
  t.same(fSync('i pi * exp 1 + re'), [0]);
  t.ok(nearly(new F().eval('i pi * exp 1 + im').toArray()[0], [0]));
});

test('should use decimals', t => {
  t.same(fSync('0.1 i * 0.2 i * +'), [{im: 0.3, re: 0}], 'should use decimals');
});

test('should calculate magnitude/absolute value', t => {
  t.same(fSync('i 1 + abs'), [Math.sqrt(2)]);
  t.same(fSync('3 4 i * + abs'), [5]);
  t.same(fSync('4 3 i * + abs'), [5]);
});

test('should calculate gamma of complex numbers', t => {
  t.same(fSync('i gamma'), [{
    im: -0.4980156681183567,
    //  -0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
    re: -0.15494982830181017
    //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
  }]);

  t.same(fSync('i 1 + gamma'), [{
    re: 0.498015668118356,
    //  0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
    im: -0.1549498283018107
    //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
  }]);
});

test('should compare complex numbers by magnitude', t => {
  t.same(fSync('2 1000 i * + 20 4 i * + >'), [true]);
  t.same(fSync('2 10 i * + 20 4 i * + <'), [true]);
  t.same(fSync('2 10 i * + 20 4 i * + >'), [false]);
});

test('should compare complex numbers with decimals by magnitude', t => {
  t.same(fSync('3 4 i * + 5 <'), [false]);
  t.same(fSync('3 4 i * + 5 >'), [false]);
  t.same(fSync('3 4 i * + 6 <'), [true]);
  t.same(fSync('3 4 i * + 6 >'), [false]);
});

test('should compare complex numbers with decimals by magnitude, cont', t => {
  t.same(fSync('3 4 i * + 4 <'), [false]);
  t.same(fSync('3 4 i * + 4 >'), [true]);
});

test('should format complex output', t => {
  t.same(fSync('i string'), ['0+1i']);
  t.same(fSync('1 i + string'), ['1+1i']);
  t.same(fSync('1 i - string'), ['1-1i']);
});

test('should calculate powers of complex numbers', t => {
  t.same(fSync('2 i * 0 ^'), [{im: 0, re: 1}]);
  t.same(fSync('2 i * 1 ^ im'), [2]);
  t.same(fSync('2 i * 2 ^ re'), [-4]);
  t.same(fSync('2 i * 3 ^ im'), [-8]);
  t.same(fSync('e i * 1 ^ im'), [2.718281828459045]);
});

test('should define complex?', t => {
  t.same(fSync('2 i * 0 + complex?'), [true]);
  t.same(fSync('2 1 + complex?'), [false]);
});

test('should test equality', t => {
  t.same(fSync('1 i * 2 i * ='), [false], 'should test equality');
  t.same(fSync('2 i * 2 i * ='), [true], 'should test equality');
});

test('should comparey', t => {
  t.same(fSync('1 i * 1 i * cmp'), [0]);
  t.same(fSync('1 i * 2 i * cmp'), [-1]);
  t.same(fSync('2 i * 1 i * cmp'), [1]);
});

test('should test inequality', t => {
  t.same(fSync('1 i * 1 i * <'), [false]);
  t.same(fSync('1 i * 1 i * >'), [false]);
  t.same(fSync('1 i * 2 i * <'), [true]);
  t.same(fSync('1 i * 2 i * >'), [false]);
  t.same(fSync('2 i * 1 i * <'), [false]);
  t.same(fSync('2 i * 1 i * >'), [true]);
});
