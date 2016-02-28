import test from 'tape';
import {Stack as F} from '../';
import {log} from '../src/logger';

import nock from 'nock';

var good = {
  id: 123456,
  name: 'f-flat_node'
};

nock('https://api.github.com/')
  .get('/users/Hypercubed/repos')
  .reply(200, good);

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

test.Test.prototype.F = async function (a, b, msg = '') {
  const f = await F().promise(a);
  this.deepLooseEqual(f.getStack(), b, `${this.name} ${msg}`);
};

test('setup', t => {
  t.test('should create a stack object', async t => {
    t.plan(1);
    t.notEqual((await F()).eval, undefined);
  });

  t.test('should create an empty stack', t => {
    t.plan(1);
    t.F('', []);
  });

  t.test('should create an non-empty stack', t => {
    t.plan(1);
    t.F('1 2 3', [1, 2, 3]);
  });

  t.test('should be chainable', t => {
    t.plan(2);
    var f = F();
    f.eval('1').eval('2 3 10');
    t.equal(f.stack.length, 4);
    t.deepEqual(f.getStack(), [1, 2, 3, 10]);
  });
});

test('numeric', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('1'), [1]);
    t.deepEqual(f.lexer('1 2'), [1, 2]);
    t.end();
  }); */

  t.test('should push numberic values', t => {
    t.plan(6);
    t.F('1 2', [1, 2], 'should push numbers');

    t.F('0x5 0x4d2', [5, 1234], 'should 0x4d2 push numbers');

    t.F('1 2 +', [3], 'should add numbers');

    t.F('1 2 -', [-1], 'should sub numbers');

    t.F('2 3 *', [6], 'should multiply numbers');

    t.F('1 2 /', [0.5], 'should divide numbers');
  });

  t.test('should test equality', t => {
    t.plan(2);
    t.F('1 2 =', [false], 'should test equality');
    t.F('2 2 =', [true], 'should test equality');
  });

  t.test('should test inequality', t => {
    t.plan(4);
    t.F('1 2 <', [true]);
    t.F('1 2 >', [false]);
    t.F('2 1 <', [false]);
    t.F('2 1 >', [true]);
  });

  t.test('precision', t => {
    t.plan(2);
    t.F('0.1 0.2 +', [0.3], 'should use decimals');
    t.F('0.07 10 *', [0.7], 'should use decimals');
  });
});

test('Math', t => {
  t.F('1 cos 1 sin 1 tan', [Math.cos(1), Math.sin(1), Math.tan(1)], 'should calculate trig funcs');

  t.F('1 acos 1 asin 1 atan', [Math.acos(1), Math.asin(1), Math.atan(1)], 'should calculate inv trig funcs');

  t.F('1 atan 4 *', [Math.PI], 'should calculate inv trig funcs');

  t.F('e pi', [Math.E, Math.PI], 'should define constants');

  t.test('should define logs', t => {
    t.F('1 log 10 log 100 log', [0, 1, 2]);

    var r = F('2 ln 10 ln').getStack();
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

  t.test('should define factorial', t => {
    t.F('20 !', [2432902008176640000], '20 !');

    var r = F('100 !').getStack()[0];
    t.nearly(r, 9.3326215443944152704e+157, '100 !');
    t.end();
  });

  t.test('should calculate exact powers', t => {
    t.F('2 0 ^', [1]);
    t.F('2 1 ^', [2]);
    t.F('2 2 ^', [4]);
    t.F('2 3 ^', [8]);
    t.F('e 1 ^', [Math.E]);
    t.end();
  });

  t.F('3 2 ^^^', [7625597484987], 'should do Knuth\'s up-arrow notation');

  t.test('should define max', t => {
    t.F('3 2 max', [3]);
    t.F('4 7 max', [7]);
    t.F('9 4 3 max', [9, 4]);
    t.end();
  });

  t.test('should define min', t => {
    t.F('3 2 min', [2]);
    t.F('4 7 min', [4]);
    t.F('9 4 3 min', [9, 3]);
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
  t.F('i', [ { im: 1, re: 0 } ], 'should parse i');

  t.test('should return imaginary numbers from sqrt', t => {
    t.F('-1 sqrt', [ { im: 1, re: 0 } ]);
    t.F('-4 sqrt', [ { im: 2, re: 0 } ]);
    t.F('-25 sqrt', [ { im: 5, re: 0 } ]);
    t.end();
  });

  t.test('should return sqrt of imaginary numbers', t => {
    t.F('8 i * sqrt', [ { im: 2, re: 2 } ]);
    t.F('50 i * sqrt', [ { im: 5, re: 5 } ]);
    t.end();
  });

  t.test('should return sqrt of complex numbers', t => {
    const f = F('1 i + 4 * sqrt 1 i + sqrt /').getStack();
    t.equal(f[0].re, 2);
    t.nearly(f[0].im, 0);
    t.end();
  });

  t.test('should add complex', t => {
    t.F('i 3 * i +', [ { im: 4, re: 0 } ]);
    t.F('i 3 * 1 +', [ { im: 3, re: 1 } ]);
    t.end();
  });

  t.test('should subtract complex', t => {
    t.F('i 3 * i -', [ { im: 2, re: 0 } ]);
    t.F('i 3 * 1 -', [ { im: 3, re: -1 } ]);
    t.end();
  });

  t.F('i 3 *', [ { im: 3, re: 0 } ], 'should multiply complex');

  t.F('i 2 /', [ { im: 0.5, re: 0 } ], 'should divide complex');

  t.F('i dup *', [ -1 ], 'should square complex');

  t.test('should evaluate Euler\'s Formula', t => {
    t.F('i pi * exp 1 + re', [ 0 ]);
    t.nearly(F('i pi * exp 1 + im').getStack()[0], [ 0 ]);
    t.end();
  });

  t.F('0.1 i * 0.2 i * +', [{ im: 0.3, re: 0 }], 'should use decimals');

  t.test('should calculate magnitude/absolute value', t => {
    t.F('i 1 + abs', [ Math.sqrt(2) ]);
    t.F('3 4 i * + abs', [ 5 ]);
    t.F('4 3 i * + abs', [ 5 ]);
    t.end();
  });

  t.test('should calculate gamma of complex numbers', t => {
    t.F('i gamma', [{
      im: -0.4980156681183567,
      //  -0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
      re: -0.15494982830181017
      //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
    }]);

    t.F('i 1 + gamma', [{
      re: 0.498015668118356,
      //  0.4980156681183560427136911174621980919529629675876500928926429549984583004359819345078945042826705814056067643438428
      im: -0.1549498283018107
      //  -0.1549498283018106851249551304838866051958796520793249302658802767988608014911385390129513664794630707495928275143898...
    }]);

    t.end();
  });

  t.test('should compare complex numbers by magnitude', t => {
    t.F('2 1000 i * + 20 4 i * + >', [ true ]);
    t.F('2 10 i * + 20 4 i * + <', [ true ]);
    t.F('2 10 i * + 20 4 i * + >', [ false ]);
    t.end();
  });

  t.test('should compare complex numbers with decimals by magnitude', t => {
    t.F('3 4 i * + 5 <', [ false ]);
    t.F('3 4 i * + 5 >', [ false ]);
    t.F('3 4 i * + 6 <', [ true ]);
    t.F('3 4 i * + 6 >', [ false ]);
    t.F('3 4 i * + 4 <', [ false ]);
    t.F('3 4 i * + 4 >', [ true ]);
    t.end();
  });

  t.test('should format complex output', t => {
    t.F('i string', [ '0+1i' ]);
    t.F('1 i + string', [ '1+1i' ]);
    t.F('1 i - string', [ '1-1i' ]);
    t.end();
  });

  t.test('should calculate powers of complex numbers', t => {
    t.F('2 i * 0 ^', [ { im: 0, re: 1 } ]);
    t.F('2 i * 1 ^', [ { im: 2, re: 6.264338327950289e-20 } ]);
    t.F('2 i * 2 ^', [ { im: 2.5057353311801156e-19, re: -4 } ]);
    t.F('2 i * 3 ^', [ { im: -8, re: -7.517205993540346e-19 } ]);
    t.F('e i * 1 ^', [ { im: 2.718281828459045, re: 8.514118522093394e-20 } ]);
    t.end();
  });
});

test('Boolean', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('true', [true]);
    t.deepEqual(f.lexer('false', [false]);
    t.end();
  }); */

  t.F('true false', [true, false], 'should push booleans');

  t.test('should or', t => {
    t.F('true false +', [true]);
    t.F('true true +', [true]);
    t.F('false false +', [false]);
    t.end();
  });

  t.test('should xor', t => {
    t.F('true false -', [true]);
    t.F('true true -', [false]);
    t.F('false false -', [false]);
    t.end();
  });

  t.test('should and', t => {
    t.F('true false /', [true]);
    t.F('true true /', [false]);
    t.F('false false /', [true]);
    t.end();
  });

  t.test('should nand', t => {
    t.F('true false *', [false]);
    t.F('true true *', [true]);
    t.F('false false *', [false]);
    t.end();
  });

  t.test('should test equality', t => {
    t.F('true false =', [false]);
    t.F('true true =', [true]);
    t.F('false false =', [true]);
    t.end();
  });

  t.test('should test equality', t => {
    t.F('true 0 =', [false]);
    t.F('true 1 =', [true]);
    t.F('false 0 =', [true]);
    t.F('false 1 =', [false]);
    t.end();
  });
});

test('String', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('"test"', ['test']);
    t.deepEqual(f.lexer('"test 1 2 3"', ['test 1 2 3']);
    t.end();
  }); */

  t.test('should push strings', t => {
    t.F('"a" "b"', ['a', 'b']);
    t.F("'a' 'b'", ['a', 'b']);
    t.end();
  });

  t.F('"ab de"', ['ab de'], 'should push strings with spaces');

  t.test('should push strings with nested quotes', t => {
    t.F('"ab \'de\' fg"', ['ab \'de\' fg']);
    t.F("'ab \"de\" fg'", ['ab \"de\" fg']);
    t.end();
  });

  t.F('"a" "b" +', ['ab'], 'should add');

  t.test('should multiply', t => {
    t.F('"a" 2 *', ['aa']);
    t.F('"bc" 2 *', ['bcbc']);
    // t.F('2 * "de"', ['dede']);
    t.end();
  });

  t.F('"a-b-c" "-" /', [['a', 'b', 'c']], 'should split');

  t.F('"a" "b" =', [false], 'should test equality');

  t.F('"a" "a" =', [true], 'should test equality');

  t.test('should test lt', t => {
    t.F('"a" "a" <', [false]);
    t.F('"a" "b" <', [true]);
    t.F('"b" "a" <', [false]);
    t.end();
  });

  t.test('should test gt', t => {
    t.F('"a" "a" >', [false]);
    t.F('"a" "b" >', [false]);
    t.F('"b" "a" >', [true]);
    t.end();
  });

  t.test('should eval strings', t => {
    var f = F();
    t.F(f.eval('"1 2 +"'), ['1 2 +']);
    t.F(f.eval('eval'), [3]);
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

  t.F('"abc" 10 @', [''], 'should @');

  t.F('""', [''], 'should push empty strings');

  t.test('should process string templates', t => {
    t.plan(5);
    t.F('`-1 sqrt = $( -1 sqrt )`', ['-1 sqrt = 0+1i']);
    t.F('`0.1 0.2 + = $( 0.1 0.2 + )`', ['0.1 0.2 + = 0.3']);
    t.F('0.1 0.2 => => `0.1 0.2 + = $( <= <= + )`', ['0.1 0.2 + = 0.3']);
    t.F('0.1 0.2 => => `(0.1 0.2) = $( <= <= )`', ['(0.1 0.2) = 0.1,0.2']);
    t.F('`$0.1 (0.2) + = $( 0.1 0.2 + )`', ['$0.1 (0.2) + = 0.3']);
  });

  t.F('"Dog!🐶"', ['Dog!🐶'], 'should support emoji');
});

test('Lists', t => {
  t.F('( 1 ) ( 2 )', [ [1], [2] ], 'should push');

  t.F('( 1 2 ) length', [ 2 ], 'should get length');

  t.F('(1) (2)', [ [1], [2] ], 'should handle missing whitespace');

  t.F('(1) (2 3 +)', [[1], [5]], 'should eval within list');

  t.F('(1) (2) +', [ [1, 2] ], 'should add');

  t.F('(1 2 3) dup (4 5 6) +', [ [1, 2, 3], [1, 2, 3, 4, 5, 6] ], 'should add without mutation');

  t.test('should multiply', t => {
    t.F('(1) 2 *', [[1, 1]]);
    t.F('(1) 3 *', [[1, 1, 1]]);
    t.F('(1 2) 2 *', [[1, 2, 1, 2]]);
    t.F('(1 2 +) 2 *', [[3, 3]]);
    t.F('(1 2 +) 0 *', [[]]);
    t.end();
  });

  t.test('mul/div identities', t => {
    t.F('(1) 3 * sum', [3]);
    t.F('(2) 3 * sum', [6]);
    t.F('(1) 3 * 3 / sum', [1]);
    t.F('(2) 3 * 3 / sum', [2]);
    t.F('(1) 1 /', [[1]]);
    t.F('(1 1) 2 /', [[1]]);
    t.F('(1 1 1 1) 2 /', [[1, 1]]);
    t.end();
  });

  t.test('add/sub identities', t => {
    t.F('(1) 2 + sum', [3]);
    // t.F('(1) 2 + 2 - sum', [1]); // ???
    t.end();
  });

  t.test('pow identities', t => {  // right associative
    t.F('(1) 2 pow', [[1, 1]]);
    t.F('(2) 3 pow', [[2, 2, 2]]);
    t.F('(1 1) 3 pow', [ [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] ]);
    t.F('(1 2) 3 pow', [ [ 1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2 ] ]);
    // t.F('(1) 2 + 2 - sum', [1]); // ???
    t.end();
  });

  t.test('should test equality', t => {
    t.F('(1 2) (1 2) =', [true]);
    t.F('(1) (2) =', [false]);
    t.F('(1 2)  (1) =', [false]);
    t.F('(1 2) (1 1) =', [false]);
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

  t.F('( 1 2 3 ) "-" *', ['1-2-3'], 'should join');

  t.F('( 1 2 3 ) 4 <<', [[1, 2, 3, 4]], 'should <<');

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

  t.F('( 4 5 6 ) 10 @', [null], 'should @');

  t.F('( 1 2 3 ) dup 4 <<', [[1, 2, 3], [1, 2, 3, 4]], 'should <<, immutable');

  t.F('4 ( 1 2 3 ) >>', [[4, 1, 2, 3]], 'should >>');

  t.F('4 ( 1 2 3 ) tuck >>', [[1, 2, 3], [4, 1, 2, 3]], 'should >>, immutable');

  t.F('( 1 2 3 ) dup pop', [[1, 2, 3], [1, 2]], 'should pop, without mutation');

  t.F('( 1 2 3 ) dup shift', [[1, 2, 3], [2, 3]], 'should shift, without mutation');
});

test('Quotes', t => {
  t.F('[ 1 ] [ 2 ]', [ [1], [2] ], 'should push');

  t.F('[1] [2]', [ [1], [2] ], 'should handle missing whitespace');

  t.test('should not eval within quote', t => {
    var f = F('[ 1 ] [ 1 2 + ]');
    t.equal(f.stack.length, 2);
    t.deepEqual(f.getStack()[0], [1]);
    t.equal(f.stack[1].toString(), '1,2,+');
    t.ok(f.stack[1][2] instanceof Object);
    t.end();
  });

  t.F('[1] [2] +', [ [1, 2] ], 'should add');

  t.F('[ 1 2 + ] 2 *', [[ 1, 2, { type: '@@Action', value: '+' }, 1, 2, { type: '@@Action', value: '+' } ]], 'should multiply');

  t.test('should test equality', t => {
    t.F('[ 1 2 + ] [ 1 2 ] =', [false]);
    t.F('[ 1 2 + ] [ 1 2 + ] =', [true]);
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
  t.F('1 2 drop 3', [1, 3], 'should drop');

  t.F('1 2 swap 3', [2, 1, 3], 'should swap');

  t.test('should dup', t => {
    t.F('1 2 dup 3', [1, 2, 2, 3]);
    t.F('[ 1 2 + ] dup swap drop eval', [3]);
    t.end();
  });

  t.test('should dup clone', t => {
    var f = F('[ 1 2 3 ] dup');
    t.deepEqual(f.getStack(), [[1, 2, 3], [1, 2, 3]]);
    t.deepEqual(f.stack[0], f.stack[1]);
    t.end();
  });

  t.F('1 2 clr 3', [3], 'should clr');

  t.F('1 2 "x" sto 3 x x', [1, 3, 2, 2], 'should sto');

  t.F('[ 2 + ] "x" def 3 x x', [7], 'should def');

  t.F('[ 1 2 + ] 4 slip', [3, 4], 'should slip');

  t.F('1 2 3 stack', [[1, 2, 3]], 'should stack');

  t.F('[ 1 2 3 ] <-', [1, 2, 3], 'should unstack');

  t.test('should choose', t => {
    t.F('true 3 4 choose', [3]);
    t.F('false 3 4 choose', [4]);
    t.F('5 false [ 2 + ] [ 2 * ] branch', [10]);
    t.F('5 true [ 2 + ] [ 2 * ] branch', [7]);
    t.end();
  });
});

test('in/fork', t => {
  t.plan(3);
  t.F('[ 2 1 + ] in', [ [ 3 ] ], 'should evaluate list');

  t.F('"before" "a" sto [ a ] in', [ [ 'before' ] ], 'should have access to parent scope');

  t.F('"outer" "a" sto [ "inner" "a" sto a ] in a', [ [ 'inner' ], 'outer' ], 'should isolate child scope');
});

test('map', t => {
  t.plan(2);
  t.F('[ 3 2 1 ] [ 2 * ] map', [ [ 6, 4, 2 ] ], 'should map quotes over quotes');

  t.F('[ -3 -2 -1 ] abs: map', [ [ 3, 2, 1 ] ], 'should map words over quotes');
});

test('Object', t => {
  t.F('[ "first" "Manfred" "last" "von Thun" ] object', [ { first: 'Manfred', last: 'von Thun' } ], 'should create objects from arrays');

  t.F('{ first: "Manfred" last: "von Thun" }', [ { first: 'Manfred', last: 'von Thun' } ], 'should create objects');

  t.F('{ name: { first: "Manfred" last: "von Thun" } }', [ { name: { first: 'Manfred', last: 'von Thun' } } ], 'should create nested objects');

  t.F('{ first: "Manfred", last: "von Thun" }', [ { first: 'Manfred', last: 'von Thun' } ], 'commas are optional');

  t.F('{ first: "Manfred", last: [ "von" "Thun" ] " " * }', [ { first: 'Manfred', last: 'von Thun' } ], 'should evaluate in objects');

  t.test('should test is object', t => {
    t.F('{ first: "Manfred" last: "von Thun" } object?', [ true ]);
    t.F('[ first: "Manfred" last: "von Thun" ] object?', [ false ]);
    t.end();
  });

  t.F('{ first: "Manfred" last: "von Thun" } keys', [ ['first', 'last'] ], 'should get keys');

  t.F('{ first: "Manfred" last: "von Thun" } vals', [ ['Manfred', 'von Thun'] ], 'should get values');

  t.test('should get single values usint @', t => {
    t.F('{ first: "Manfred" last: "von Thun" } first: @', [ 'Manfred' ]);
    t.F('{ first: "Manfred" last: "von Thun" } last: @', [ 'von Thun' ]);
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

  t.F('{ first: "Manfred" last: "von Thun" } length', [ 2 ], 'should get keys length');
});

test('yield', t => {
  t.plan(6);

  t.F('[1 2 yield 4 5 yield 6 7] fork', [1, 2, [4, 5, { type: '@@Action', value: 'yield' }, 6, 7]], 'yield and fork');

  t.F('[1 2 yield 4 5 yield 6 7] fork fork', [1, 2, 4, 5, [6, 7]], 'yield and fork');

  t.F('[1 2 + yield 4 5 + ] fork', [3, [4, 5, { type: '@@Action', value: '+' }]], 'yield and fork');

  t.F('[1 2 + yield 4 5 + ] fork drop', [3], 'yield and next');

  t.F('[1 2 + yield 4 5 + yield ] fork fork drop', [3, 9], 'multiple yields');

  t.F('count* [ fork ] 10 times drop', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'multiple yields');
});

test('async', t => {
  t.test('eval should yield on async with callback', t => {
    t.plan(2);
    var f = F('10 !').eval('100 sleep 4 5 + +', done);
    t.deepLooseEqual(f.getStack(), [3628800]);

    function done (err, f) {
      if (err) throw err;
      t.deepLooseEqual(f.getStack(), [3628809]);
    }
  });

  t.test('constructor should yield on async with callback', t => {
    t.plan(2);
    var f = F('10 ! 100 sleep 4 5 + +', done);
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
    t.deepLooseEqual(f.getStack(), [[], 9]);

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

  t.test('should call callback (on next tick) even on sync', t => {
    t.plan(3);

    const f = F();
    f.eval('1 [ 10 ! ] in 4 5 +', done);
    t.deepLooseEqual(f.getStack(), [1, [3628800], 9]);

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
      t.deepLooseEqual(f.getStack(), [ [ [3628800], [3628800] ] ]);
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

    f.promise('100 sleep 10 !').then((f) => {
      t.deepLooseEqual(f.getStack(), [3628800]);
    });
  });

  t.test('should generate promise', t => {
    t.plan(1);
    F('100 sleep 10 !').promise().then((f) => {
      t.deepLooseEqual(f.getStack(), [3628800]);
    });
  });

  t.test('should resolve promise even on sync', t => {
    t.plan(1);
    F().promise('10 !').then((f) => {
      t.deepLooseEqual(f.getStack(), [3628800]);
    });
  });

  t.test('should work with async/await', async function (t) {
    t.plan(1);
    const f = await F().promise('100 sleep 10 !');
    t.deepLooseEqual(f.getStack(), [3628800]);
  });

  /* t.test('should work with async/await', async function (t) {
    t.plan(1);
    const f = await F.eval('100 sleep 10 !');
    t.deepLooseEqual(f.getStack(), [3628800]);
  }); */

  t.F('100 sleep 10 !', [3628800], 'should work with async/await');

  t.test('should fetch', t => {
    t.plan(1);
    t.F('"https://api.github.com/users/Hypercubed/repos" fetch-json', [good], 'should fetch');
  });
});

test('undo', t => {
  t.test('should undo on error', t => {
    const f = F('true auto-undo 1 2');
    t.deepEqual(f.getStack(), [1, 2]);

    f.eval('+ whatwhat');
    t.deepEqual(f.getStack(), [1, 2]);

    t.end();
  });

  t.test('should undo', t => {
    const f = F('1');

    f.eval('2');
    t.deepEqual(f.getStack(), [1, 2]);

    f.eval('+');
    t.deepEqual(f.getStack(), [3]);

    f.eval('undo');
    t.deepEqual(f.getStack(), [1, 2]);

    f.eval('undo');
    t.deepEqual(f.getStack(), [1]);

    t.end();
  });
});

test('experimental', t => {
  t.test('apply', t => {
    t.plan(2);
    t.F('10 [ 9 4 3 ] max: rcl ||>', [10, 9]);
    t.F('10 [ 9 4 3 ] min: rcl ||>', [10, 3]);
  });

  /* t.test('apply', t => {
    t.plan(2);
    t.F('10 [ 9 4 3 ] \\max rcl ||>', [10, 9]);
    t.F('10 [ 9 4 3 ] \\min rcl ||>', [10, 3]);
  }); */

  t.test('symbols', t => {
    t.plan(2);
    t.F('#test dup =', [true]);
    t.F('#test #test =', [false]);
  });

  /* t.test('string macro', t => {
    t.plan(1);
    t.F('$hello "hello" =', [true]);
  }); */

  t.test('fork', t => {
    t.plan(1);
    t.F('[1 2 +] fork', [[3]], 'fork');
  });

  t.test('others', t => {
    t.plan(2);
    t.F('get-log-level set-log-level', [], 'set-log-level');
    t.F('1 2 + [ 4 5 ] -> 6 7', [3, 4, 5], 'replace queue');
  });

  t.test('of', t => {
    t.plan(2);
    t.F('"abc" 123 of', [ '123' ]);
    t.F('123 "456" of', [ 456 ]);
  });

  t.test('empty', t => {
    t.plan(2);
    t.F('"abc" empty', [ '' ]);
    t.F('123 empty', [ 0 ]);
  });

  t.test('nop', t => {
    t.plan(2);
    t.F('"abc" nop', [ 'abc' ]);
    t.F('"abc" id', [ 'abc' ]);
  });

  t.test('depth', t => {
    t.plan(2);
    t.F('"abc" depth', [ 'abc', 1 ]);
    t.F('"abc" 123 depth', [ 'abc', 123, 2 ]);
  });

  t.test('identical?', t => {
    t.plan(3);
    t.F('"abc" "abc" identical?', [ true ]);
    t.F('["abc"] ["abc"] identical?', [ false ]);
    t.F('["abc"] dup identical?', [ true ]);
  });

  t.test('others', t => {
    t.plan(5);
    t.F('"abc" "b" indexof', [ 1 ], 'indexof');

    t.F('"abc" "def" swap', [ 'def', 'abc' ], 'swap strings');

    t.F('abc: def: swap', [ { type: '@@Action', value: 'def' }, { type: '@@Action', value: 'abc' } ], 'swap atoms');

    t.F('abc: dup', [ { type: '@@Action', value: 'abc' }, { type: '@@Action', value: 'abc' } ], 'dup atoms');

    t.F('[2 1 +] unstack', [ 2, 1, { type: '@@Action', value: '+' } ], 'unstack should not eval');
  });

  t.test('should slice', t => {
    t.plan(2);
    t.F('["a" "b" "c" "d"] 0 1 slice', [['a']]);
    t.F('["a" "b" "c" "d"] 0 -1 slice', [['a', 'b', 'c']]);
  });

  t.test('should split at', t => {
    t.plan(2);
    t.F('["a" "b" "c" "d"] 1 splitat', [['a'], ['b', 'c', 'd']]);
    t.F('["a" "b" "c" "d"] -1 splitat', [['a', 'b', 'c'], ['d']]);
  });

  t.test('filter and reduce', t => {
    t.plan(3);
    t.F('10 integers [ even? ] filter', [ [ 2, 4, 6, 8, 10 ] ], 'filter');
    t.F('10 integers 0 [ + ] reduce', [ 55 ], 'reduce');
    t.F('10 integers 1 [ * ] reduce', [ 3628800 ], 'reduce');

    // t.F('`-1 sqrt = $( -1 sqrt )`', ['-1 sqrt = 0+1i'], 'sdfsadfasdf');
  });

  t.test('zip, zipwith and dot', t => {
    t.plan(4);
    t.F('[ 1 2 3 ] [ 4 5 6 ] zip', [ [ 1, 4, 2, 5, 3, 6 ] ], 'zip');
    t.F('[ 1 2 3 ] [ 4 5 6 ] [ + ] zipwith in', [ [ 5, 7, 9 ] ], 'zipwith');
    t.F('[ 1 2 3 ] [ 4 5 6 ] dot', [ 32 ], 'dot');
    t.F('[ 1 2 3 4 ] [ 4 5 6 ] dot', [ 32 ], 'dot');
  });

  t.test('operations with null', t => {
    t.plan(12);
    t.F('null 5 +', [ 5 ], 'add');
    t.F('5 null +', [ 5 ], 'add');
    t.F('null 5 -', [ -5 ], 'sub');
    t.F('5 null -', [ 5 ], 'sub');
    t.F('null 5 *', [ 0 ], 'mul');
    t.F('5 null *', [ 0 ], 'mul');
    t.F('null 5 /', [ 0 ], 'div');
    t.F('5 null /', [ null ], 'div');  // should be infinity, bad JSON conversion
    t.F('null 5 <<', [ 0 ], '<<');
    t.F('5 null <<', [ 5 ], '<<');
    t.F('null 5 >>', [ 0 ], '>>');
    t.F('5 null >>', [ 5 ], '>>');
  });
});
