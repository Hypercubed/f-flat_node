import test from 'tape';
import {Stack as F} from '../';
import {log} from '../src/logger';

/* var nock = require('nock');
var good = 'hello world. 你好世界。';
var bad = 'good bye cruel world. 再见残酷的世界。';

nock('https://mattandre.ws')
  .get('/succeed.txt')
  .reply(200, good);
nock('https://mattandre.ws')
  .get('/fail.txt')
  .reply(404, bad); */

log.level = process.env.NODE_ENV || 'error';

const tolerance = 0.5 * Math.pow(10, -9);

test.Test.prototype.nearly = function (a, b, msg = 'should be nearly equal') {
  this._assert(Math.abs(+a - +b) < tolerance, {
    message: msg,
    operator: 'nearly equal',
    actual: a,
    expected: b
  });
};

test.Test.prototype.F = function (a, b, msg = 'should evaluate stack') {
  this.deepLooseEqual(F(a).getStack(), b, msg);
};

test('setup', t => {
  t.test('should create a stack object', t => {
    t.notEqual(F().eval, undefined);
    t.end();
  });

  t.test('should create an empty stack', t => {
    var f = F();
    t.equal(f.stack.length, 0);
    t.deepEqual(f.stack, []);
    t.end();
  });

  t.test('should create an non-empty stack', t => {
    var f = F('1 2 3');
    t.equal(f.stack.length, 3);
    t.deepEqual(f.getStack(), [1, 2, 3]);
    t.end();
  });

  t.test('should be chainable', t => {
    var f = F();
    f.eval('1').eval('2 3 10');
    t.equal(f.stack.length, 4);
    t.deepEqual(f.getStack(), [1, 2, 3, 10]);
    t.end();
  });
});

test('numeric', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('1'), [1]);
    t.deepEqual(f.lexer('1 2'), [1, 2]);
    t.end();
  }); */

  t.test('should push numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1').getStack(), [1]);
    t.deepEqual(f.eval('2').getStack(), [1, 2]);
    t.end();
  });

  t.test('should 0x4d2 push numbers', t => {
    var f = F();
    t.deepEqual(f.eval('0x5').getStack(), [5]);
    t.deepEqual(f.eval('0x4d2').getStack(), [5, 1234]);
    t.end();
  });

  t.F('1 2 +', [3], 'should add numbers');

  t.test('should sub numbers', t => {
    t.deepEqual(F('1 2 -').getStack(), [-1]);
    t.end();
  });

  t.test('should multiply numbers', t => {
    t.deepEqual(F('1 2 *').getStack(), [2]);
    t.end();
  });

  t.test('should divide numbers', t => {
    t.deepEqual(F('1 2 /').getStack(), [0.5]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('1 2 =').getStack(), [false]);
    t.deepEqual(F('2 2 =').getStack(), [true]);
    t.end();
  });

  t.test('should test inequality', t => {
    t.deepEqual(F('1 2 <').stack, [true]);
    t.deepEqual(F('1 2 >').stack, [false]);
    t.deepEqual(F('2 1 <').stack, [false]);
    t.deepEqual(F('2 1 >').stack, [true]);
    t.end();
  });

  t.test('should use decimals', t => {
    t.looseEqual(F('0.1 0.2 +').getStack(), [0.3]);
    t.end();
  });
});

test('Math', t => {
  t.test('should calculate trig funcs', t => {
    t.deepEqual(F('1 cos 1 sin 1 tan').getStack(), [Math.cos(1), Math.sin(1), Math.tan(1)]);
    t.end();
  });

  t.test('should calculate inv trig funcs', t => {
    t.deepEqual(F('1 acos 1 asin 1 atan').getStack(), [Math.acos(1), Math.asin(1), Math.atan(1)]);
    t.end();
  });

  t.test('should calculate inv trig funcs', t => {
    t.deepEqual(F('1 atan 4 *').getStack(), [Math.PI]);
    t.end();
  });

  t.test('should define constants', t => {
    t.deepEqual(F('e pi').getStack(), [Math.E, Math.PI]);
    t.end();
  });

  t.test('should define logs', t => {
    t.deepEqual(F('1 log 10 log 100 log').getStack(), [0, 1, 2]);

    var r = F('2 ln 10 ln').stack;
    t.nearly(r[0], 0.6931471805599453);
    t.nearly(r[1], 2.3025850929940458834);
    t.end();
  });

  t.test('should define gamma', t => {
    var r = F('4 gamma').stack[0];
    t.nearly(r, 6, '4 gamma');

    r = F('1 2 / gamma').stack[0];
    t.nearly(r, Math.sqrt(Math.PI), '1 2 / gamma');

    r = F('-1 2 / gamma').stack[0];
    t.nearly(r, -2 * Math.sqrt(Math.PI), '-1 2 / gamma');

    r = F('1.5 gamma').stack[0];
    t.nearly(r, 0.886226925452758013649083741670572591398774728061193564106, '1.5 gamma');

    r = F('0.1 gamma').stack[0];
    t.nearly(r, 9.513507698668731836292487177265402192550578626088377343050, '0.1 gamma');

    r = F('-5 2 / gamma').stack[0];
    t.nearly(r, -8 / 15 * Math.sqrt(Math.PI), '-5 2 / gamma');

    r = F('102 gamma').stack[0];
    t.nearly(r, 9.4259477598383563846e+159, '102 gamma');

    t.end();
  });

  /* t.test('should define precise gamma', t => {
    var r = F('4 gamma').stack[0].toString();
    t.equals(r, '6', '4 gamma');

    r = F('102 gamma').stack[0].toString();
    t.equals(r, '9425947759838359420851623124482936749562312794702543768327889353416977599316221476503087861591808346911623490003549599583369706302603264000000000000000000000000.000000000000000000149097034282098123762036652313939703018730093107213584456746876441419287483569634136377833572244406013958372921486273539533554962988', '102 gamma');

    t.end();
  }); */

  t.test('should define factorial', t => {
    t.deepEqual(F('20 !').getStack(), [2432902008176640000], '20 !');

    var r = F('100 !').stack[0];
    t.nearly(r, 9.3326215443944152704e+157, '100 !');
    t.end();
  });

  t.test('should calculate exact powers', t => {
    t.deepEqual(F('2 0 ^').getStack(), [1]);
    t.deepEqual(F('2 1 ^').getStack(), [2]);
    t.deepEqual(F('2 2 ^').getStack(), [4]);
    t.deepEqual(F('2 3 ^').getStack(), [8]);
    t.deepEqual(F('e 1 ^').getStack(), [Math.E]);
    t.end();
  });

  t.test('should do Knuth\'s up-arrow notation', t => {
    t.deepEqual(F('3 2 ^^^').getStack(), [7625597484987]);
    t.end();
  });

  t.test('should define max', t => {
    t.deepEqual(F('3 2 max').getStack(), [3]);
    t.deepEqual(F('4 7 max').getStack(), [7]);
    t.deepEqual(F('9 4 3 max').getStack(), [9, 4]);
    // t.deepEqual(F('10 [ 9 4 3 ] max: rcl ||>').getStack(), [10, 9]);
    t.end();
  });

  t.test('should define min', t => {
    t.deepEqual(F('3 2 min').getStack(), [2]);
    t.deepEqual(F('4 7 min').getStack(), [4]);
    t.deepEqual(F('9 4 3 min').getStack(), [9, 3]);
    t.end();
  });

  t.test('should test primes', t => {
    t.F('10 integers prime?: map',
      [[true, true, true, false, true, false, true, false, false, false]], 'primes');
      // 1     2     3     4      5     6      7     8      9      10

    t.F('10 integers [ 2 swap ^ 1 - prime? ] map',
      [[true, true, true, false, true, false, true, false, false, false]], 'messene primes');
      // 1     2     3     4      5     6      7     8      9      10

    // t.F('[ 17 18 19 23 ] [ prime? ] map', [[true, false, true, true]]);
    // t.F('[ 17 18 19 23 ] [ 2 swap ^ 1 - prime? ] map', [[true, false, true, false]]);
    t.end();
  });
});

test('BigComplex', t => {
  t.test('should parse i', t => {
    t.deepEqual(F('i').getStack(), [ { im: 1, re: 0 } ]);
    t.end();
  });

  t.test('should return imaginary numbers from sqrt', t => {
    t.deepEqual(F('-1 sqrt').getStack(), [ { im: 1, re: 0 } ]);
    t.deepEqual(F('-4 sqrt').getStack(), [ { im: 2, re: 0 } ]);
    t.deepEqual(F('-25 sqrt').getStack(), [ { im: 5, re: 0 } ]);
    t.end();
  });

  t.test('should return sqrt of imaginary numbers', t => {
    t.deepEqual(F('8 i * sqrt').getStack(), [ { im: 2, re: 2 } ]);
    t.deepEqual(F('50 i * sqrt').getStack(), [ { im: 5, re: 5 } ]);
    t.end();
  });

  t.test('should return sqrt of complex numbers', t => {
    const f = F('1 i + 4 * sqrt 1 i + sqrt /').getStack();
    t.equal(f[0].re, 2);
    t.nearly(f[0].im, 0);
    t.end();
  });

  t.test('should add complex', t => {
    t.deepEqual(F('i 3 * i +').getStack(), [ { im: 4, re: 0 } ]);
    t.deepEqual(F('i 3 * 1 +').getStack(), [ { im: 3, re: 1 } ]);
    t.end();
  });

  t.test('should subtract complex', t => {
    t.deepEqual(F('i 3 * i -').getStack(), [ { im: 2, re: 0 } ]);
    t.deepEqual(F('i 3 * 1 -').getStack(), [ { im: 3, re: -1 } ]);
    t.end();
  });

  t.test('should multiply complex', t => {
    t.deepEqual(F('i 3 *').getStack(), [ { im: 3, re: 0 } ]);
    t.end();
  });

  t.test('should divide complex', t => {
    t.deepEqual(F('i 2 /').getStack(), [ { im: 0.5, re: 0 } ]);
    t.end();
  });

  t.test('should square complex', t => {
    t.deepEqual(F('i dup *').getStack(), [ -1 ]);
    t.end();
  });

  t.test('should evaluate Euler\'s Formula', t => {
    t.deepEqual(F('i pi * exp 1 + re').getStack(), [ 0 ]);
    t.nearly(F('i pi * exp 1 + im').getStack()[0], 0);
    t.end();
  });

  t.test('should use decimals', t => {
    t.looseEqual(F('0.1 i * 0.2 i * +').getStack(), [{ im: 0.3, re: 0 }]);
    t.end();
  });

  t.test('should calculate magnitude/absolute value', t => {
    t.looseEqual(F('i 1 + abs').getStack(), [ Math.sqrt(2) ]);
    t.looseEqual(F('3 4 i * + abs').getStack(), [ 5 ]);
    t.looseEqual(F('4 3 i * + abs').getStack(), [ 5 ]);
    t.end();
  });

  t.test('should calculate gamma of complex numbers', t => {
    t.looseEqual(F('i gamma').getStack(), [{
      im: -0.4980156681183567,
      //  -0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
      re: -0.15494982830181017
      //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
    }]);

    t.looseEqual(F('i 1 + gamma').getStack(), [{
      re: 0.498015668118356,
      //  0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
      im: -0.1549498283018107
      //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
    }]);

    t.end();
  });

  t.test('should compare complex numbers by magnitude', t => {
    t.looseEqual(F('2 1000 i * + 20 4 i * + >').getStack(), [ true ]);
    t.looseEqual(F('2 10 i * + 20 4 i * + <').getStack(), [ true ]);
    t.looseEqual(F('2 10 i * + 20 4 i * + >').getStack(), [ false ]);
    t.end();
  });

  t.test('should compare complex numbers with decimals by magnitude', t => {
    t.looseEqual(F('3 4 i * + 5 <').getStack(), [ false ]);
    t.looseEqual(F('3 4 i * + 5 >').getStack(), [ false ]);
    t.looseEqual(F('3 4 i * + 6 <').getStack(), [ true ]);
    t.looseEqual(F('3 4 i * + 6 >').getStack(), [ false ]);
    t.looseEqual(F('3 4 i * + 4 <').getStack(), [ false ]);
    t.looseEqual(F('3 4 i * + 4 >').getStack(), [ true ]);
    t.end();
  });

  t.test('should format complex output', t => {
    t.looseEqual(F('i string').getStack(), [ '0+1i' ]);
    t.looseEqual(F('1 i + string').getStack(), [ '1+1i' ]);
    t.looseEqual(F('1 i - string').getStack(), [ '1-1i' ]);
    t.end();
  });

  t.test('should calculate powers of complex numbers', t => {
    t.deepEqual(F('2 i * 0 ^').getStack(), [ { im: 0, re: 1 } ]);
    t.deepEqual(F('2 i * 1 ^').getStack(), [ { im: 2, re: 6.264338327950289e-20 } ]);
    t.deepEqual(F('2 i * 2 ^').getStack(), [ { im: 2.5057353311801156e-19, re: -4 } ]);
    t.deepEqual(F('2 i * 3 ^').getStack(), [ { im: -8, re: -7.517205993540346e-19 } ]);
    t.deepEqual(F('e i * 1 ^').getStack(), [ { im: 2.718281828459045, re: 8.514118522093394e-20 } ]);
    t.end();
  });
});

test('Bboolean', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('true').stack, [true]);
    t.deepEqual(f.lexer('false').stack, [false]);
    t.end();
  }); */

  t.test('should push booleans', t => {
    t.deepEqual(F('true false').stack, [true, false]);
    t.end();
  });

  t.test('should or', t => {
    t.deepEqual(F('true false +').stack, [true]);
    t.deepEqual(F('true true +').stack, [true]);
    t.deepEqual(F('false false +').stack, [false]);
    t.end();
  });

  t.test('should xor', t => {
    t.deepEqual(F('true false -').stack, [true]);
    t.deepEqual(F('true true -').stack, [false]);
    t.deepEqual(F('false false -').stack, [false]);
    t.end();
  });

  t.test('should and', t => {
    t.deepEqual(F('true false /').stack, [true]);
    t.deepEqual(F('true true /').stack, [false]);
    t.deepEqual(F('false false /').stack, [true]);
    t.end();
  });

  t.test('should nand', t => {
    t.deepEqual(F('true false *').stack, [false]);
    t.deepEqual(F('true true *').stack, [true]);
    t.deepEqual(F('false false *').stack, [false]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('true false =').stack, [false]);
    t.deepEqual(F('true true =').stack, [true]);
    t.deepEqual(F('false false =').stack, [true]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('true 0 =').stack, [false]);
    t.deepEqual(F('true 1 =').stack, [true]);
    t.deepEqual(F('false 0 =').stack, [true]);
    t.deepEqual(F('false 1 =').stack, [false]);
    t.end();
  });
});

test('String', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('"test"').stack, ['test']);
    t.deepEqual(f.lexer('"test 1 2 3"').stack, ['test 1 2 3']);
    t.end();
  }); */

  t.test('should push strings', t => {
    var f = F();
    t.deepEqual(f.eval('"a"').stack, ['a']);
    t.deepEqual(f.eval('"b"').stack, ['a', 'b']);
    t.end();
  });

  t.test('should push strings', t => {
    var f = F();
    t.deepEqual(f.eval("'a'").stack, ['a']);
    t.deepEqual(f.eval("'b'").stack, ['a', 'b']);
    t.end();
  });

  t.test('should push strings with spaces', t => {
    t.deepEqual(F('"ab de"').stack, ['ab de']);
    t.end();
  });

  t.test('should push strings with nested quotes', t => {
    t.deepEqual(F('"ab \'de\' fg"').stack, ['ab \'de\' fg']);
    t.deepEqual(F("'ab \"de\" fg'").stack, ['ab \"de\" fg']);
    t.end();
  });

  t.test('should add', t => {
    t.deepEqual(F('"a" "b" +').stack, ['ab']);
    t.end();
  });

  t.test('should multiply', t => {
    t.F('"a" 2 *', ['aa']);
    t.F('"bc" 2 *', ['bcbc']);
    // t.F('2 * "de"', ['dede']);
    t.end();
  });

  t.test('should split', t => {
    t.deepEqual(F('"a-b-c" "-" /').stack, [['a', 'b', 'c']]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('"a" "b" =').stack, [false]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('"a" "a" =').stack, [true]);
    t.end();
  });

  t.test('should test lt', t => {
    t.deepEqual(F('"a" "a" <').stack, [false]);
    t.deepEqual(F('"a" "b" <').stack, [true]);
    t.deepEqual(F('"b" "a" <').stack, [false]);
    t.end();
  });

  t.test('should test gt', t => {
    t.deepEqual(F('"a" "a" >').stack, [false]);
    t.deepEqual(F('"a" "b" >').stack, [false]);
    t.deepEqual(F('"b" "a" >').stack, [true]);
    t.end();
  });

  t.test('should eval strings', t => {
    var f = F();
    t.deepEqual(f.eval('"1 2 +"').stack, ['1 2 +']);
    t.deepEqual(+f.eval('eval').stack[0], 3);
    t.end();
  });

  t.test('should @', t => {
    t.F('"abc" 0 @', ['a']);
    t.F('"abc" 1 @', ['b']);
    t.F('"abc" 2 @', ['c']);
    t.end();
  });

  t.test('should @ from end', t => {
    t.F('"abc" -1 @', ['c']);
    t.F('"abc" -2 @', ['b']);
    t.F('"abc" -3 @', ['a']);
    t.end();
  });

  t.test('should @', t => {
    t.F('"abc" 10 @', ['']);
    t.end();
  });

  t.test('should push empty strings', t => {
    t.F('""', ['']);
    t.end();
  });

  t.test('should process string templates', t => {
    t.F('`-1 sqrt = ${-1 sqrt}`', ['-1 sqrt = 0+1i']);
    t.F('`0.1 0.2 + = ${0.1 0.2 +}`', ['0.1 0.2 + = 0.3']);
    t.end();
  });

  t.test('should suporrt emoji', t => {
    t.F('"Dog!🐶"', ['Dog!🐶']);
    t.end();
  });
});

test('Lists', t => {
  t.test('should push', t => {
    t.deepEqual(F('( 1 ) ( 2 )').getStack(), [ [1], [2] ]);
    t.end();
  });

  t.test('should get length', t => {
    t.F('( 1 2 ) length', [ 2 ]);
    t.end();
  });

  t.test('should handle missing whitespace', t => {
    t.deepEqual(F('(1) (2)').getStack(), [ [1], [2] ]);
    t.end();
  });

  t.test('should eval within list', t => {
    t.deepEqual(F('(1) (2 3 +)').getStack(), [[1], [5]]);
    t.end();
  });

  t.test('should add', t => {
    t.deepEqual(F('(1) (2) +').getStack(), [ [1, 2] ]);
    t.end();
  });

  t.test('should add without mutation', t => {
    t.deepEqual(F('(1 2 3) dup (4 5 6) +').getStack(), [ [1, 2, 3], [1, 2, 3, 4, 5, 6] ]);
    t.end();
  });

  t.test('should multiply', t => {
    t.deepEqual(F('(1) 2 *').getStack(), [[1, 1]]);
    t.deepEqual(F('(1) 3 *').getStack(), [[1, 1, 1]]);
    t.deepEqual(F('(1 2) 2 *').getStack(), [[1, 2, 1, 2]]);
    t.deepEqual(F('(1 2 +) 2 *').getStack(), [[3, 3]]);
    t.deepEqual(F('(1 2 +) 0 *').getStack(), [[]]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('(1 2) (1 2) =').getStack(), [true]);
    t.deepEqual(F('(1) (2) =').getStack(), [false]);
    t.deepEqual(F('(1 2)  (1) =').getStack(), [false]);
    t.deepEqual(F('(1 2) (1 1) =').getStack(), [false]);
    t.end();
  });

  t.test('should eval lists', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 2 )').getStack(), [[ 1, 2 ]]);
    t.deepEqual(f.eval('eval').getStack(), [1, 2]);
    t.end();
  });

  // [ [ 1 2 3 ] [ 4 ] zip [ 1 4 2 4 3 4 ] = ] "List Zip " assert

  t.test('should zip lists', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 2 3 ) ( 4 )').getStack(), [[ 1, 2, 3 ], [4]]);
    t.deepEqual(f.eval('*').getStack(), [[ 1, 4, 2, 4, 3, 4 ]]);
    t.end();
  });

  t.test('should join', t => {
    t.deepEqual(F('( 1 2 3 ) "-" *').getStack(), ['1-2-3']);
    t.end();
  });

  t.test('should <<', t => {
    t.deepEqual(F('( 1 2 3 ) 4 <<').getStack(), [[1, 2, 3, 4]]);
    t.end();
  });

  t.test('should @', t => {
    t.F('( 4 5 6 ) 0 @', [4]);
    t.F('( 4 5 6 ) 1 @', [5]);
    t.F('( 4 5 6 ) 2 @', [6]);
    t.end();
  });

  t.test('should @ from end', t => {
    t.F('( 4 5 6 ) -1 @', [6]);
    t.F('( 4 5 6 ) -2 @', [5]);
    t.F('( 4 5 6 ) -3 @', [4]);
    t.end();
  });

  t.test('should @', t => {
    t.F('( 4 5 6 ) 10 @', [null]);
    t.end();
  });

  t.F('( 1 2 3 ) dup 4 <<', [[1, 2, 3], [1, 2, 3, 4]], 'should <<, immutable');

  t.test('should >>', t => {
    t.deepEqual(F('4 ( 1 2 3 ) >>').getStack(), [[4, 1, 2, 3]]);
    t.end();
  });

  t.F('4 ( 1 2 3 ) tuck >>', [[1, 2, 3], [4, 1, 2, 3]], 'should >>, immutable');

  t.test('should pop, without mutation', t => {
    t.deepEqual(F('( 1 2 3 ) dup pop').getStack(), [[1, 2, 3], [1, 2]]);
    t.end();
  });

  t.test('should shift, without mutation', t => {
    t.deepEqual(F('( 1 2 3 ) dup shift').getStack(), [[1, 2, 3], [2, 3]]);
    t.end();
  });
});

test('Quotes', t => {
  t.test('should push', t => {
    var f = F('[ 1 ] [ 2 ]');
    t.deepEqual(f.getStack(), [ [1], [2] ]);
    t.end();
  });

  t.test('should handle missing whitespace', t => {
    t.deepEqual(F('[1] [2]').getStack(), [ [1], [2] ]);
    t.end();
  });

  t.test('should not eval within quote', t => {
    var f = F('[ 1 ] [ 1 2 + ]');
    t.equal(f.stack.length, 2);
    t.deepEqual(f.getStack()[0], [1]);
    t.equal(f.stack[1].toString(), '1,2,+');
    t.ok(f.stack[1][2] instanceof Object);
    t.end();
  });

  t.test('should add', t => {
    t.deepEqual(F('[1] [2] +').getStack(), [ [1, 2] ]);
    t.end();
  });

  t.test('should multiply', t => {
    t.equal((F('[ 1 2 + ] 2 *').stack[0]).length, 6);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F('[ 1 2 + ] [ 1 2 ] =').stack, [false]);
    t.deepEqual(F('[ 1 2 + ] [ 1 2 + ] =').stack, [true]);
    t.end();
  });

  t.test('should eval quotes', t => {
    var f = F('[1 2 +]');
    t.equal(f.stack.length, 1);
    t.deepEqual(f.stack[0].length, 3);
    t.deepEqual(f.eval('eval').getStack(), [3]);
    t.end();
  });

  t.test('should zip quotes', t => {
    var f = F('[ 1 2 + ] [ 4 ]');
    t.deepEqual(f.stack.length, 2);
    t.deepEqual(f.stack[0].length, 3);
    t.deepEqual(f.stack[1].length, 1);

    f.eval('*');
    t.deepEqual(f.stack.length, 1);
    t.deepEqual(f.stack[0].length, 6);
    t.equal(f.stack[0].toString(), '1,4,2,4,+,4');
    t.end();
  });

  t.test('should join lists', t => {
    var f = F('[ 1 2 + ] ","');
    t.deepEqual(f.stack.length, 2);
    t.deepEqual(f.stack[0].length, 3);
    t.deepEqual(f.stack[1].length, 1);

    f.eval('*');
    t.deepEqual(f.stack.length, 1);
    t.deepEqual(f.stack[0].length, 5);
    t.deepEqual(f.stack[0].toString(), '1,2,+');
    t.end();
  });
});

test('Stack Operations', t => {
  t.test('should drop', t => {
    t.deepEqual(F('1 2 drop 3').getStack(), [1, 3]);
    t.end();
  });

  t.test('should swap', t => {
    t.deepEqual(F('1 2 swap 3').getStack(), [2, 1, 3]);
    t.end();
  });

  t.test('should dup', t => {
    t.deepEqual(F('1 2 dup 3').getStack(), [1, 2, 2, 3]);
    t.deepEqual(F('[ 1 2 + ] dup swap drop eval').getStack(), [3]);
    t.end();
  });

  t.test('should dup clone', t => {
    var f = F('[ 1 2 3 ] dup');
    t.deepEqual(f.getStack(), [[1, 2, 3], [1, 2, 3]]);
    t.deepEqual(f.stack[0], f.stack[1]);
    // t.notEqual(f.stack[0], f.stack[1]);
    t.end();
  });

  t.test('should clr', t => {
    t.deepEqual(F('1 2 clr 3').getStack(), [3]);
    t.end();
  });

  t.test('should sto', t => {
    t.deepEqual(F('1 2 "x" sto 3 x x').getStack(), [1, 3, 2, 2]);
    t.end();
  });

  t.test('should def', t => {
    t.deepEqual(F('[ 2 + ] "x" def 3 x x').getStack(), [7]);
    t.end();
  });

  t.test('should slip', t => {
    t.deepEqual(F('[ 1 2 + ] 4 slip').getStack(), [3, 4]);
    t.end();
  });

  t.test('should stack', t => {
    t.deepEqual(F('1 2 3 stack').getStack(), [[1, 2, 3]]);
    t.end();
  });

  t.test('should unstack', t => {
    t.deepEqual(F('[ 1 2 3 ] <-').getStack(), [1, 2, 3]);
    t.end();
  });

  t.test('should choose', t => {
    t.deepEqual(F('true 3 4 choose').getStack(), [3]);
    t.deepEqual(F('false 3 4 choose').getStack(), [4]);
    t.deepEqual(F('5 false [ 2 + ] [ 2 * ] branch').getStack(), [10]);
    t.deepEqual(F('5 true [ 2 + ] [ 2 * ] branch').getStack(), [7]);
    t.end();
  });
});

test('in/fork', t => {
  t.test('should evaluate list', t => {
    t.deepEqual(F('[ 2 1 + ] in').getStack(), [ [ 3 ] ]);
    t.end();
  });

  t.test('should have access to parent scope', t => {
    t.deepEqual(F('"before" "a" sto [ a ] in').getStack(), [ [ 'before' ] ]);
    t.end();
  });

  t.test('should isolate child scope', t => {
    t.deepEqual(F('"outer" "a" sto [ "inner" "a" sto a ] in a').getStack(), [ [ 'inner' ], 'outer' ]);
    t.end();
  });
});

test('map', t => {
  t.test('should map quotes over quotes', t => {
    t.deepEqual(F('[ 3 2 1 ] [ 2 * ] map').getStack(), [ [ 6, 4, 2 ] ]);
    t.end();
  });

  t.test('should map words over quotes', t => {
    t.deepEqual(F('[ -3 -2 -1 ] abs: map').getStack(), [ [ 3, 2, 1 ] ]);
    t.end();
  });
});

test('Object', t => {
  t.test('should create objects from arrays', t => {
    t.deepEqual(F('[ "first" "Manfred" "last" "von Thun" ] object').getStack(), [ { first: 'Manfred', last: 'von Thun' } ]);
    t.end();
  });

  t.test('should create objects', t => {
    t.deepEqual(F('{ first: "Manfred" last: "von Thun" }').getStack(), [ { first: 'Manfred', last: 'von Thun' } ]);
    t.end();
  });

  t.test('should create nested objects', t => {
    t.deepEqual(F('{ name: { first: "Manfred" last: "von Thun" } }').getStack(), [ { name: { first: 'Manfred', last: 'von Thun' } } ]);
    t.end();
  });

  t.test('commas are optional', t => {
    t.deepEqual(F('{ first: "Manfred", last: "von Thun" }').getStack(), [ { first: 'Manfred', last: 'von Thun' } ]);
    t.end();
  });

  t.test('should evaluate in objects', t => {
    t.deepEqual(F('{ first: "Manfred", last: [ "von" "Thun" ] " " * }').getStack(), [ { first: 'Manfred', last: 'von Thun' } ]);
    t.end();
  });

  t.test('should test is object', t => {
    t.deepEqual(F('{ first: "Manfred" last: "von Thun" } object?').getStack(), [ true ]);
    t.deepEqual(F('[ first: "Manfred" last: "von Thun" ] object?').getStack(), [ false ]);
    t.end();
  });

  t.test('should get keys', t => {
    t.deepEqual(F('{ first: "Manfred" last: "von Thun" } keys').getStack(), [ ['first', 'last'] ]);
    t.end();
  });

  t.test('should get values', t => {
    t.deepEqual(F('{ first: "Manfred" last: "von Thun" } vals').getStack(), [ ['Manfred', 'von Thun'] ]);
    t.end();
  });

  t.test('should get single values usint @', t => {
    t.deepEqual(F('{ first: "Manfred" last: "von Thun" } first: @').getStack(), [ 'Manfred' ]);
    t.deepEqual(F('{ first: "Manfred" last: "von Thun" } last: @').getStack(), [ 'von Thun' ]);
    t.end();
  });

  t.test('should join objects', t => {
    t.F('{ first: "Manfred" } { last: "von Thun" } +', [ { first: 'Manfred', last: 'von Thun' } ]);
    t.F('{ first: "Manfred" } { first: "John" last: "von Thun" } <<', [ { first: 'John', last: 'von Thun' } ]);
    t.F('{ first: "Manfred" } { first: "John" last: "von Thun" } >>', [ { first: 'Manfred', last: 'von Thun' } ]);
    t.end();
  });

  t.test('should join objects without mutations', t => {
    t.F('{ first: "Manfred" } dup { last: "von Thun" } +', [ { first: 'Manfred' }, { first: 'Manfred', last: 'von Thun' } ]);
    t.F('{ first: "Manfred" } dup { last: "von Thun" } >>', [ { first: 'Manfred' }, { first: 'Manfred', last: 'von Thun' } ]);
    t.F('{ first: "Manfred" } dup { last: "von Thun" } <<', [ { first: 'Manfred' }, { first: 'Manfred', last: 'von Thun' } ]);
    t.end();
  });

  t.test('should get keys length', t => {
    t.F('{ first: "Manfred" last: "von Thun" } length', [ 2 ]);
    t.end();
  });
});

test('experimental', t => {
  t.test('apply', t => {
    t.F('10 [ 9 4 3 ] max: rcl ||>', [10, 9]);
    t.F('10 [ 9 4 3 ] min: rcl ||>', [10, 3]);
    t.end();
  });

  t.test('apply', t => {
    t.F('10 [ 9 4 3 ] \\max rcl ||>', [10, 9]);
    t.F('10 [ 9 4 3 ] \\min rcl ||>', [10, 3]);
    t.end();
  });

  t.test('symbols', t => {
    t.F('#test dup =', [true]);
    t.F('#test #test =', [false]);
    t.end();
  });

  t.test('string macro', t => {
    t.F('$hello "hello" =', [true]);
    t.end();
  });

  t.test('set-log-level', t => {
    t.F('get-log-level set-log-level', []);
    t.end();
  });

  t.test('fork', t => {
    t.F('[1 2 +] fork', [[3]]);
    t.end();
  });

  t.test('replace queue', t => {
    t.F('1 2 + [ 4 5 ] -> 6 7', [3, 4, 5]);
    t.end();
  });

  t.test('of', t => {
    t.F('"abc" 123 of', [ '123' ]);
    t.F('123 "456" of', [ 456 ]);
    t.end();
  });

  t.test('empty', t => {
    t.F('"abc" empty', [ '' ]);
    t.F('123 empty', [ 0 ]);
    t.end();
  });

  t.test('nop', t => {
    t.F('"abc" nop', [ 'abc' ]);
    t.F('"abc" id', [ 'abc' ]);
    t.end();
  });

  t.test('depth', t => {
    t.F('"abc" depth', [ 'abc', 1 ]);
    t.F('"abc" 123 depth', [ 'abc', 123, 2 ]);
    t.end();
  });

  t.test('indexof', t => {
    t.F('"abc" "b" indexof', [ 1 ]);
    t.end();
  });

  t.test('identical?', t => {
    t.F('"abc" "abc" identical?', [ true ]);
    t.F('["abc"] ["abc"] identical?', [ false ]);
    t.F('["abc"] dup identical?', [ true ]);
    t.end();
  });

  t.test('swap strings', t => {
    t.F('"abc" "def" swap', [ 'def', 'abc' ]);
    t.end();
  });

  t.test('swap atoms', t => {
    t.F('abc: def: swap', [ { type: '@@Action', value: 'def' }, { type: '@@Action', value: 'abc' } ]);
    t.end();
  });

  t.test('dup atoms', t => {
    t.F('abc: dup', [ { type: '@@Action', value: 'abc' }, { type: '@@Action', value: 'abc' } ]);
    t.end();
  });

  t.test('unstack should not eval', t => {
    t.F('[2 1 +] unstack', [ 2, 1, { type: '@@Action', value: '+' } ]);
    t.end();
  });

  t.test('should slice', t => {
    t.F('["a" "b" "c" "d"] 0 1 slice', [['a']]);
    t.F('["a" "b" "c" "d"] 0 -1 slice', [['a', 'b', 'c']]);
    t.end();
  });

  t.test('should splitat', t => {
    t.F('["a" "b" "c" "d"] 1 splitat', [['a'], ['b', 'c', 'd']]);
    t.F('["a" "b" "c" "d"] -1 splitat', [['a', 'b', 'c'], ['d']]);
    t.end();
  });

  t.test('unstack should not eval', t => {
    t.F('[2 1 +] unstack', [ 2, 1, { type: '@@Action', value: '+' } ]);
    t.end();
  });
});

test('yield', t => {
  t.test('yield and fork', t => {
    t.F('[1 2 yield 4 5 yield 6 7] fork', [1, 2, [4, 5, { type: '@@Action', value: 'yield' }, 6, 7]]);
    t.end();
  });

  t.test('yield and fork', t => {
    t.F('[1 2 yield 4 5 yield 6 7] fork fork', [1, 2, 4, 5, [6, 7]]);
    t.end();
  });

  t.test('yield and fork', t => {
    t.F('[1 2 + yield 4 5 + ] fork', [3, [4, 5, { type: '@@Action', value: '+' }]]);
    t.end();
  });

  t.test('yield and next', t => {
    t.F('[1 2 + yield 4 5 + ] fork drop', [3]);
    t.end();
  });

  t.test('multiple yields', t => {
    t.F('[1 2 + yield 4 5 + yield ] fork fork drop', [3, 9]);
    t.end();
  });

  t.test('multiple yields', t => {
    t.F('count* [ fork ] 10 times drop', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    t.end();
  });
});

test('async', t => {
  t.test('should yield on async', t => {
    t.plan(2);
    var f = F().eval('10 ! 100 sleep 4 5 + +', done);
    t.deepLooseEqual(f.getStack(), [3628800]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [3628809]);
    }
  });

  t.test('should delay', t => {
    t.plan(2);

    var f = F().eval('[ 10 ! ] 100 delay 4 5 + +', done);
    t.deepLooseEqual(f.getStack(), [3628800]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [3628809]);
    }
  });

  t.test('should fork', t => {
    t.plan(3);

    var f = F().eval('[ 100 sleep 10 ! ] fork 4 5 +', done);
    t.deepLooseEqual(f.getStack(), [[], 9]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [[], 9]);

      setTimeout(function () {
        t.deepLooseEqual(f.getStack(), [[ 3628800 ], 9]);
      }, 200);
    }
  });

  t.test('shouldn\'t call callback twice', t => {
    t.plan(4);

    const f = F();
    f.eval('[ 100 sleep 10 ! ] fork 4 5 +', done);
    t.deepLooseEqual(f.getStack(), [[], 9, 1, 2]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [[], 9]);
      t.deepLooseEqual(f.eval('1 2').getStack(), [[], 9, 1, 2]);

      setTimeout(function () {
        t.deepLooseEqual(f.getStack(), [[ 3628800 ], 9, 1, 2]);
      }, 200);
    }
  });

  t.test('should await', t => {
    t.plan(2);

    var f = F().eval('1 [ 100 sleep 10 ! ] await 4 5 +', done);
    t.deepLooseEqual(f.getStack(), [1]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [1, [3628800], 9]);
    }
  });

  t.test('shouldn\'t call callback twice', t => {
    t.plan(3);

    const f = F();
    f.eval('1 [ 100 sleep 10 ! ] await 4 5 +', done);
    t.deepLooseEqual(f.getStack(), [1]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [1, [3628800], 9]);
      t.deepLooseEqual(f.eval('1 2').getStack(), [1, [3628800], 9, 1, 2]);
    }
  });

  t.test('all', t => {
    t.plan(2);

    const f = F();
    f.eval('[ 100 sleep 10 ! ] dup pair all', done);
    t.deepLooseEqual(f.getStack(), []);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [ [ [ 3628800 ], [ 3628800 ] ] ]);
    }
  });

  t.test('should spawn', t => {
    t.plan(4);

    var f = F().eval('[ 100 sleep 10 ! ] spawn 4 5 +', done);
    t.deepLooseEqual(f.getStack(), [{ type: '@@Future' }, 9]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [{ type: '@@Future' }, 9]);

      setTimeout(function () {
        t.deepLooseEqual(f.getStack(), [{ type: '@@Future', value: [ 3628800 ] }, 9]);
        t.deepLooseEqual(f.eval('drop eval').getStack(), [3628800]);
      }, 200);
    }
  });

  t.test('should generate promise', t => {
    t.plan(1);

    const f = F();

    f.promise('100 sleep 10 !').then(() => {
      t.deepLooseEqual(f.getStack(), [3628800]);
    });
  });
});
