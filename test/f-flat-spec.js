import test from 'tape';
import {Stack as F} from '../src/stack';

test('setup', t => {
  t.test('should create a stack object', t => {
    var f = F();
    t.ok(f instanceof Array);
    t.ok(f instanceof F);
    // t.notEqual(f.lexer, undefined);
    t.notEqual(f.eval, undefined);
    t.end();
  });

  t.test('should create an empty stack', t => {
    var f = F();
    t.equal(f.length, 0);
    t.deepEqual(f.slice(0), []);
    t.end();
  });

  t.test('should create an non-empty stack', t => {
    var f = F();
    f = F('1 2 3');
    t.equal(f.length, 3);
    t.deepEqual(f.slice(0), [1, 2, 3]);
    t.end();
  });

  t.test('should be chainable', t => {
    var f = F();
    f.eval('1').eval('2 3 10');
    t.equal(f.length, 4);
    t.deepEqual(f.slice(0), [1, 2, 3, 10]);
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
    t.deepEqual(f.eval('1').slice(0), [1]);
    t.deepEqual(f.eval('2').slice(0), [1, 2]);
    t.end();
  });

  t.test('should 0x4d2 push numbers', t => {
    var f = F();
    t.deepEqual(f.eval('0x5').slice(0), [5]);
    t.deepEqual(f.eval('0x4d2').slice(0), [5, 1234]);
    t.end();
  });

  t.test('should add numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 +').slice(0), [3]);
    t.end();
  });

  t.test('should sub numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 -').slice(0), [-1]);
    t.end();
  });

  t.test('should multiply numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 *').slice(0), [2]);
    t.end();
  });

  t.test('should divide numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 /').slice(0), [0.5]);
    t.end();
  });

  t.test('should test equality', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 =').slice(0), [false]);
    t.deepEqual(F().eval('2 2 =').slice(0), [true]);
    t.end();
  });

  t.test('should test inequality', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 <').slice(0), [true]);
    t.deepEqual(F().eval('1 2 >').slice(0), [false]);
    t.deepEqual(F().eval('2 1 <').slice(0), [false]);
    t.deepEqual(F().eval('2 1 >').slice(0), [true]);
    t.end();
  });
});

test('Math', t => {
  t.test('should calculate trig funcs', t => {
    var f = F();
    t.deepEqual(f.eval('1 cos 1 sin 1 tan').slice(0), [Math.cos(1), Math.sin(1), Math.tan(1)]);
    t.end();
  });

  t.test('should calculate inv trig funcs', t => {
    var f = F();
    t.deepEqual(f.eval('1 acos 1 asin 1 atan').slice(0), [Math.acos(1), Math.asin(1), Math.atan(1)]);
    t.end();
  });

  t.test('should calculate inv trig funcs', t => {
    var f = F();
    t.deepEqual(f.eval('1 atan 4 *').slice(0), [Math.PI]);
    t.end();
  });

  t.test('should define constants', t => {
    var f = F();
    t.deepEqual(f.eval('e pi').slice(0), [Math.E, Math.PI]);
    t.end();
  });

  t.test('should define logs', t => {
    var f = F();
    t.deepEqual(f.eval('1 log 10 log 100 log').slice(0), [0, 1, 2]);
    t.deepEqual(f.eval('clr 2 ln 10 ln').slice(0), [Math.LN2, Math.LN10]);
    t.end();
  });

  t.test('should define factorial and gamma', t => {
    var f = F();
    var tolerance = 0.5 * Math.pow(10, -9);

    t.deepEqual(f.eval('20 !').slice(0), [2432902008176640000]);

    var r = (F()).eval('4 gamma')[0] - 6;
    t.ok(Math.abs(r) < tolerance);

    r = (F()).eval('1 2 / gamma')[0] - Math.sqrt(Math.PI);
    t.ok(Math.abs(r) < tolerance);

    r = ((F()).eval('100 !')[0] - 9.33262154e157) / 9.33262154e157;
    t.ok(Math.abs(r) < tolerance);
    t.end();
  });

  t.test('should do Knuth\'s up-arrow notation', t => {
    var f = F();
    t.deepEqual(f.eval('3 2 ^^^').slice(0), [7625597484987]);
    t.end();
  });
});

test('boolean', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('true').slice(0), [true]);
    t.deepEqual(f.lexer('false').slice(0), [false]);
    t.end();
  }); */

  t.test('should push booleans', t => {
    var f = F();
    t.deepEqual(f.eval('true false').slice(0), [true, false]);
    t.end();
  });

  t.test('should or', t => {
    var f = F();
    t.deepEqual(f.eval('true false +').slice(0), [true]);
    t.deepEqual(f.eval('clr true true +').slice(0), [true]);
    t.deepEqual(f.eval('clr false false +').slice(0), [false]);
    t.end();
  });

  t.test('should xor', t => {
    t.deepEqual(F().eval('true false -').slice(0), [true]);
    t.deepEqual(F().eval('clr true true -').slice(0), [false]);
    t.deepEqual(F().eval('clr false false -').slice(0), [false]);
    t.end();
  });

  t.test('should and', t => {
    t.deepEqual(F().eval('true false *').slice(0), [false]);
    t.deepEqual(F().eval('clr true true *').slice(0), [true]);
    t.deepEqual(F().eval('clr false false *').slice(0), [false]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('true false =').slice(0), [false]);
    t.deepEqual(F().eval('true true =').slice(0), [true]);
    t.deepEqual(F().eval('false false =').slice(0), [true]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('true 0 =').slice(0), [false]);
    t.deepEqual(F().eval('true 1 =').slice(0), [true]);
    t.deepEqual(F().eval('false 0 =').slice(0), [true]);
    t.deepEqual(F().eval('false 1 =').slice(0), [false]);
    t.end();
  });
});

test('strings', t => {
  /* t.test('should parse', t => {
    var f = F();
    t.deepEqual(f.lexer('"test"').slice(0), ['test']);
    t.deepEqual(f.lexer('"test 1 2 3"').slice(0), ['test 1 2 3']);
    t.end();
  }); */

  t.test('should push strings', t => {
    var f = F();
    t.deepEqual(f.eval('"a"').slice(0), ['a']);
    t.deepEqual(f.eval('"b"').slice(0), ['a', 'b']);
    t.end();
  });

  t.test('should push strings', t => {
    var f = F();
    t.deepEqual(f.eval("'a'").slice(0), ['a']);
    t.deepEqual(f.eval("'b'").slice(0), ['a', 'b']);
    t.end();
  });

  t.test('should push strings with spaces', t => {
    var f = F();
    t.deepEqual(f.eval('"ab de"').slice(0), ['ab de']);
    t.end();
  });

  t.test('should push strings with nested quotes', t => {
    var f = F();
    t.deepEqual(f.eval('"ab \'de\' fg"').slice(0), ['ab \'de\' fg']);
    t.deepEqual(F().eval("'ab \"de\" fg'").slice(0), ['ab \"de\" fg']);
    t.end();
  });

  t.test('should add', t => {
    var f = F();
    t.deepEqual(f.eval('"a" "b" +').slice(0), ['ab']);
    t.end();
  });

  t.test('should multiply', t => {
    var f = F();
    t.deepEqual(f.eval('"a" 2 *').slice(0), ['aa']);
    t.end();
  });

  t.test('should split', t => {
    var f = F();
    t.deepEqual(f.eval('"a-b-c" "-" /').slice(0), [['a', 'b', 'c']]);
    t.end();
  });

  t.test('should test equality', t => {
    var f = F();
    t.deepEqual(f.eval('"a" "b" =').slice(0), [false]);
    t.end();
  });

  t.test('should test equality', t => {
    var f = F();
    t.deepEqual(f.eval('"a" "a" =').slice(0), [true]);
    t.end();
  });

  t.test('should eval strings', t => {
    var f = F();
    t.deepEqual(f.eval('"1 2 +"').slice(0), ['1 2 +']);
    t.deepEqual(f.eval('eval').slice(0), [3]);
    t.end();
  });
});

test('lists', t => {
  t.test('should push', t => {
    var f = F();
    t.deepEqual(f.eval('{ 1 } { 2 }').slice(0), [ [1], [2] ]);
    t.end();
  });

  t.test('should handle mssing whitespace', t => {
    var f = F();
    t.deepEqual(f.eval('{1} {2}').slice(0), [ [1], [2] ]);
    t.end();
  });

  t.test('should eval within list', t => {
    var f = F();
    t.deepEqual(f.eval('{1} {2 3 +}').slice(0), [ [1], [5] ]);
    t.end();
  });

  t.test('should add', t => {
    var f = F();
    t.deepEqual(f.eval('{ 1 } { 2 } +').slice(0), [ [1, 2] ]);
    t.end();
  });

  t.test('should multiply', t => {
    t.deepEqual(F().eval('{ 1 } 2 *').slice(0), [[1, 1]]);
    t.deepEqual(F().eval('{ 1 } 3 *').slice(0), [[1, 1, 1]]);
    t.deepEqual(F().eval('{ 1 2 } 2 *').slice(0), [[1, 2, 1, 2]]);
    t.deepEqual(F().eval('{ 1 2 + } 2 *').slice(0), [[3, 3]]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('{ 1 2 } { 1 2 } =').slice(0), [true]);
    t.deepEqual(F().eval('{ 1 } { 2 } =').slice(0), [false]);
    t.deepEqual(F().eval('{ 1 2 } { 1 } =').slice(0), [false]);
    t.deepEqual(F().eval('{ 1 2 } { 1 1 } =').slice(0), [false]);
    t.end();
  });

  t.test('should eval lists', t => {
    var f = F();
    t.deepEqual(f.eval('{ 1 2 }').slice(0), [[ 1, 2 ]]);
    t.deepEqual(f.eval('eval').slice(0), [1, 2]);
    t.end();
  });

  // [ [ 1 2 3 ] [ 4 ] zip [ 1 4 2 4 3 4 ] = ] "List Zip " assert

  t.test('should zip lists', t => {
    var f = F();
    t.deepEqual(f.eval('{ 1 2 3 } { 4 }').slice(0), [[ 1, 2, 3 ], [4]]);
    t.deepEqual(f.eval('*').slice(0), [[ 1, 4, 2, 4, 3, 4 ]]);
    t.end();
  });

  t.test('should join', t => {
    var f = F();
    t.deepEqual(f.eval('{ 1 2 3 } "-" *').slice(0), ['1-2-3']);
    t.end();
  });

  t.test('should <<', t => {
    var f = F();
    t.deepEqual(f.eval('{ 1 2 3 } 4 <<').slice(0), [[1, 2, 3, 4]]);
    t.end();
  });

  t.test('should >>', t => {
    var f = F();
    t.deepEqual(f.eval('4 { 1 2 3 } >>').slice(0), [[4, 1, 2, 3]]);
    t.end();
  });
});

test('quote', t => {
  t.test('should push', t => {
    var f = F();
    f.eval('[ 1 ] [ 2 ]');
    t.deepEqual(f.slice(0), [ [1], [2] ]);
    t.end();
  });

  t.test('should handle mssing whitespace', t => {
    var f = F();
    t.deepEqual(f.eval('[1] [2]').slice(0), [ [1], [2] ]);
    t.end();
  });

  t.test('should not eval within quote', t => {
    var f = F();
    f.eval('[ 1 ] [ 1 2 + ]');
    t.equal(f.length, 2);
    t.deepEqual(f[0], [1]);
    t.equal(f[1].toString(), '1,2,+');
    t.ok(f[1][2] instanceof Object);
    t.end();
  });

  t.test('should add', t => {
    var f = F();
    t.deepEqual(f.eval('[1] [2] +').slice(0), [ [1, 2] ]);
    t.end();
  });

  t.test('should multiply', t => {
    t.equal((F().eval('[ 1 2 + ] 2 *').slice(0)[0]).length, 6);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('[ 1 2 + ] [ 1 2 ] =').slice(0), [false]);
    t.deepEqual(F().eval('[ 1 2 + ] [ 1 2 + ] =').slice(0), [true]);
    t.end();
  });

  t.test('should eval lists', t => {
    var f = F();
    f.eval('[1 2 +]');
    t.equal(f.length, 1);
    t.deepEqual(f[0].length, 3);
    t.deepEqual(f.eval('eval').slice(0), [3]);
    t.end();
  });

  t.test('should zip lists', t => {
    var f = F();
    f.eval('[ 1 2 + ] [ 4 ]');
    t.deepEqual(f.length, 2);
    t.deepEqual(f[0].length, 3);
    t.deepEqual(f[1].length, 1);

    f.eval('*');
    t.deepEqual(f.length, 1);
    t.deepEqual(f[0].length, 6);
    t.equal(f[0].toString(), '1,4,2,4,+,4');
    t.end();
  });

  t.test('should join lists', t => {
    var f = F();
    f.eval('[ 1 2 + ] ","');
    t.deepEqual(f.length, 2);
    t.deepEqual(f[0].length, 3);
    t.deepEqual(f[1].length, 1);

    f.eval('*');
    t.deepEqual(f.length, 1);
    t.deepEqual(f[0].length, 5);
    t.deepEqual(f[0].toString(), '1,2,+');
    t.end();
  });
});

test('stack', t => {
  t.test('should drop', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 drop 3').slice(0), [1, 3]);
    t.end();
  });

  t.test('should swap', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 swap 3').slice(0), [2, 1, 3]);
    t.end();
  });

  t.test('should dup', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 dup 3').slice(0), [1, 2, 2, 3]);
    t.end();
  });

  t.test('should dup clone', t => {
    var f = F();
    f.eval('[ 1 2 3 ] dup');
    t.deepEqual(f.slice(0), [[1, 2, 3], [1, 2, 3]]);
    t.deepEqual(f[0], f[1]);
    t.notEqual(f[0], f[1]);
    t.end();
  });

  t.test('should clr', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 clr 3').slice(0), [3]);
    t.end();
  });

  t.test('should sto', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 "x" sto 3 x x').slice(0), [1, 3, 2, 2]);
    t.end();
  });

  t.test('should def', t => {
    var f = F();
    t.deepEqual(f.eval('[ 2 + ] "x" def 3 x x').slice(0), [7]);
    t.end();
  });

  t.test('should slip', t => {
    var f = F();
    t.deepEqual(f.eval('[ 1 2 + ] 4 slip').slice(0), [3, 4]);
    t.end();
  });

  t.test('should stack', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 3 stack').slice(0), [[1, 2, 3]]);
    t.end();
  });

  t.test('should unstack', t => {
    var f = F();
    t.deepEqual(f.eval('[ 1 2 3 ] unstack').slice(0), [1, 2, 3]);
    t.end();
  });

  t.test('should choose', t => {
    var f = F();
    t.deepEqual(f.eval('true 3 4 choose').slice(0), [3]);
    t.deepEqual(F().eval('false 3 4 choose').slice(0), [4]);
    t.deepEqual(F().eval('5 false [ 2 + ] [ 2 * ] branch').slice(0), [10]);
    t.deepEqual(F().eval('5 true [ 2 + ] [ 2 * ] branch').slice(0), [7]);
    t.end();
  });
});
