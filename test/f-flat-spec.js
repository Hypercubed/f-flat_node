import test from 'tape';
import {Stack as F} from '../src/stack';

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

  t.test('should define factorial and gamma', t => {
    t.deepEqual(F('20 !').getStack(), [2432902008176640000], '20 !');

    var r = F('4 gamma').stack[0] - 6;
    t.nearly(r, 0, '4 gamma');

    r = F('1 2 / gamma').stack[0] - Math.sqrt(Math.PI);
    t.nearly(r, 0, '1 2 / gamma');

    r = (F('100 !').stack[0] - 9.33262154e157) / 9.33262154e157;
    t.nearly(r, 0, '100 !');
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
    t.deepEqual(F('10 9 4 3 3 >max').getStack(), [10, 9]);
    t.end();
  });

  t.test('should define min', t => {
    t.deepEqual(F('3 2 min').getStack(), [2]);
    t.deepEqual(F('4 7 min').getStack(), [4]);
    t.deepEqual(F('9 4 3 min').getStack(), [9, 3]);
    t.deepEqual(F('10 9 4 1 3 >min').getStack(), [10, 1]);
    t.end();
  });

  t.test('should test primes', t => {
    t.F('10 integers prime?: map', [[true, true, true, false, true, false, true, false, false, false]]);
    t.F('10 integers [ 2 swap ^ 1 - prime? ] map', [[true, true, true, false, true, false, true, false, false, false]]);

    // t.F('[ 17 18 19 23 ] [ prime? ] map', [[true, false, true, true]]);
    // t.F('[ 17 18 19 23 ] [ 2 swap ^ 1 - prime? ] map', [[true, false, true, false]]);
    t.end();
  });
});

test('complex', t => {
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
});

test('boolean', t => {
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

test('strings', t => {
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
    t.deepEqual(F('"a" 2 *').stack, ['aa']);
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
});

test('lists', t => {
  t.test('should push', t => {
    t.deepEqual(F('( 1 ) ( 2 )').getStack(), [ [1], [2] ]);
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

test('quote', t => {
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

test('stack', t => {
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

test('in', t => {
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

test('objects', t => {
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
});
