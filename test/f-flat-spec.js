import test from 'tape';
import {Stack as F} from '../src/stack';

test('setup', t => {
  t.test('should create a stack object', t => {
    var f = F();
    // t.ok(f instanceof Array);
    t.ok(f instanceof F);
    // t.notEqual(f.lexer, undefined);
    t.notEqual(f.eval, undefined);
    t.end();
  });

  t.test('should create an empty stack', t => {
    var f = F();
    t.equal(f.stack.length, 0);
    t.deepEqual(f.stack, []);
    t.end();
  });

  t.test('should create an non-empty stack', t => {
    var f = F();
    f = F('1 2 3');
    t.equal(f.stack.length, 3);
    t.deepEqual(f.stack, [1, 2, 3]);
    t.end();
  });

  t.test('should be chainable', t => {
    var f = F();
    f.eval('1').eval('2 3 10');
    t.equal(f.stack.length, 4);
    t.deepEqual(f.stack, [1, 2, 3, 10]);
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
    t.deepEqual(f.eval('1').stack, [1]);
    t.deepEqual(f.eval('2').stack, [1, 2]);
    t.end();
  });

  t.test('should 0x4d2 push numbers', t => {
    var f = F();
    t.deepEqual(f.eval('0x5').stack, [5]);
    t.deepEqual(f.eval('0x4d2').stack, [5, 1234]);
    t.end();
  });

  t.test('should add numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 +').stack, [3]);
    t.end();
  });

  t.test('should sub numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 -').stack, [-1]);
    t.end();
  });

  t.test('should multiply numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 *').stack, [2]);
    t.end();
  });

  t.test('should divide numbers', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 /').stack, [0.5]);
    t.end();
  });

  t.test('should test equality', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 =').stack, [false]);
    t.deepEqual(F().eval('2 2 =').stack, [true]);
    t.end();
  });

  t.test('should test inequality', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 <').stack, [true]);
    t.deepEqual(F().eval('1 2 >').stack, [false]);
    t.deepEqual(F().eval('2 1 <').stack, [false]);
    t.deepEqual(F().eval('2 1 >').stack, [true]);
    t.end();
  });

  /* t.test('should test usedecimals', t => {
    var f = F();
    t.equal(f.eval('0.1 0.2 +').stack[0], 0.3);
    t.end();
  }); */
});

test('Math', t => {
  t.test('should calculate trig funcs', t => {
    var f = F();
    t.deepEqual(f.eval('1 cos 1 sin 1 tan').stack, [Math.cos(1), Math.sin(1), Math.tan(1)]);
    t.end();
  });

  t.test('should calculate inv trig funcs', t => {
    var f = F();
    t.deepEqual(f.eval('1 acos 1 asin 1 atan').stack, [Math.acos(1), Math.asin(1), Math.atan(1)]);
    t.end();
  });

  t.test('should calculate inv trig funcs', t => {
    var f = F();
    t.deepEqual(f.eval('1 atan 4 *').stack, [Math.PI]);
    t.end();
  });

  t.test('should define constants', t => {
    var f = F();
    t.deepEqual(f.eval('e pi').stack, [Math.E, Math.PI]);
    t.end();
  });

  t.test('should define logs', t => {
    var f = F();
    t.deepEqual(f.eval('1 log 10 log 100 log').stack, [0, 1, 2]);
    t.deepEqual(f.eval('clr 2 ln 10 ln').stack, [Math.LN2, Math.LN10]);
    t.end();
  });

  t.test('should define factorial and gamma', t => {
    var f = F();
    var tolerance = 0.5 * Math.pow(10, -9);

    t.deepEqual(f.eval('20 !').stack, [2432902008176640000], '20 !');

    var r = (F()).eval('4 gamma').stack[0] - 6;
    t.ok(Math.abs(r) < tolerance, '4 gamma');

    r = (F()).eval('1 2 / gamma').stack[0] - Math.sqrt(Math.PI);
    t.ok(Math.abs(r) < tolerance, '1 2 / gamma');

    r = ((F()).eval('100 !').stack[0] - 9.33262154e157) / 9.33262154e157;
    t.ok(Math.abs(r) < tolerance, '100 !');
    t.end();
  });

  t.test('should do Knuth\'s up-arrow notation', t => {
    var f = F();
    t.deepEqual(f.eval('3 2 ^^^').stack, [7625597484987]);
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
    var f = F();
    t.deepEqual(f.eval('true false').stack, [true, false]);
    t.end();
  });

  t.test('should or', t => {
    var f = F();
    t.deepEqual(f.eval('true false +').stack, [true]);
    t.deepEqual(f.eval('clr true true +').stack, [true]);
    t.deepEqual(f.eval('clr false false +').stack, [false]);
    t.end();
  });

  t.test('should xor', t => {
    t.deepEqual(F().eval('true false -').stack, [true]);
    t.deepEqual(F().eval('clr true true -').stack, [false]);
    t.deepEqual(F().eval('clr false false -').stack, [false]);
    t.end();
  });

  t.test('should and', t => {
    t.deepEqual(F().eval('true false *').stack, [false]);
    t.deepEqual(F().eval('clr true true *').stack, [true]);
    t.deepEqual(F().eval('clr false false *').stack, [false]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('true false =').stack, [false]);
    t.deepEqual(F().eval('true true =').stack, [true]);
    t.deepEqual(F().eval('false false =').stack, [true]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('true 0 =').stack, [false]);
    t.deepEqual(F().eval('true 1 =').stack, [true]);
    t.deepEqual(F().eval('false 0 =').stack, [true]);
    t.deepEqual(F().eval('false 1 =').stack, [false]);
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
    var f = F();
    t.deepEqual(f.eval('"ab de"').stack, ['ab de']);
    t.end();
  });

  t.test('should push strings with nested quotes', t => {
    var f = F();
    t.deepEqual(f.eval('"ab \'de\' fg"').stack, ['ab \'de\' fg']);
    t.deepEqual(F().eval("'ab \"de\" fg'").stack, ['ab \"de\" fg']);
    t.end();
  });

  t.test('should add', t => {
    var f = F();
    t.deepEqual(f.eval('"a" "b" +').stack, ['ab']);
    t.end();
  });

  t.test('should multiply', t => {
    var f = F();
    t.deepEqual(f.eval('"a" 2 *').stack, ['aa']);
    t.end();
  });

  t.test('should split', t => {
    var f = F();
    t.deepEqual(f.eval('"a-b-c" "-" /').stack, [['a', 'b', 'c']]);
    t.end();
  });

  t.test('should test equality', t => {
    var f = F();
    t.deepEqual(f.eval('"a" "b" =').stack, [false]);
    t.end();
  });

  t.test('should test equality', t => {
    var f = F();
    t.deepEqual(f.eval('"a" "a" =').stack, [true]);
    t.end();
  });

  t.test('should eval strings', t => {
    var f = F();
    t.deepEqual(f.eval('"1 2 +"').stack, ['1 2 +']);
    t.deepEqual(f.eval('eval').stack, [3]);
    t.end();
  });
});

test('lists', t => {
  t.test('should push', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 ) ( 2 )').stack, [ [1], [2] ]);
    t.end();
  });

  t.test('should handle missing whitespace', t => {
    var f = F();
    t.deepEqual(f.eval('(1) (2)').stack, [ [1], [2] ]);
    t.end();
  });

  t.test('should eval within list', t => {
    var f = F();
    t.deepEqual(f.eval('(1) (2 3 +)').stack, [ [1], [5] ]);
    t.end();
  });

  t.test('should add', t => {
    var f = F();
    t.deepEqual(f.eval('(1) (2) +').stack, [ [1, 2] ]);
    t.end();
  });

  t.test('should multiply', t => {
    t.deepEqual(F().eval('(1) 2 *').stack, [[1, 1]]);
    t.deepEqual(F().eval('(1) 3 *').stack, [[1, 1, 1]]);
    t.deepEqual(F().eval('(1 2) 2 *').stack, [[1, 2, 1, 2]]);
    t.deepEqual(F().eval('(1 2 +) 2 *').stack, [[3, 3]]);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('(1 2) (1 2) =').stack, [true]);
    t.deepEqual(F().eval('(1) (2) =').stack, [false]);
    t.deepEqual(F().eval('(1 2)  (1) =').stack, [false]);
    t.deepEqual(F().eval('(1 2) (1 1) =').stack, [false]);
    t.end();
  });

  t.test('should eval lists', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 2 )').stack, [[ 1, 2 ]]);
    t.deepEqual(f.eval('eval').stack, [1, 2]);
    t.end();
  });

  // [ [ 1 2 3 ] [ 4 ] zip [ 1 4 2 4 3 4 ] = ] "List Zip " assert

  t.test('should zip lists', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 2 3 ) ( 4 )').stack, [[ 1, 2, 3 ], [4]]);
    t.deepEqual(f.eval('*').stack, [[ 1, 4, 2, 4, 3, 4 ]]);
    t.end();
  });

  t.test('should join', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 2 3 ) "-" *').stack, ['1-2-3']);
    t.end();
  });

  t.test('should <<', t => {
    var f = F();
    t.deepEqual(f.eval('( 1 2 3 ) 4 <<').stack, [[1, 2, 3, 4]]);
    t.end();
  });

  t.test('should >>', t => {
    var f = F();
    t.deepEqual(f.eval('4 ( 1 2 3 ) >>').stack, [[4, 1, 2, 3]]);
    t.end();
  });
});

test('quote', t => {
  t.test('should push', t => {
    var f = F();
    f.eval('[ 1 ] [ 2 ]');
    t.deepEqual(f.stack, [ [1], [2] ]);
    t.end();
  });

  t.test('should handle mssing whitespace', t => {
    var f = F();
    t.deepEqual(f.eval('[1] [2]').stack, [ [1], [2] ]);
    t.end();
  });

  t.test('should not eval within quote', t => {
    var f = F();
    f.eval('[ 1 ] [ 1 2 + ]');
    t.equal(f.stack.length, 2);
    t.deepEqual(f.stack[0], [1]);
    t.equal(f.stack[1].toString(), '1,2,+');
    t.ok(f.stack[1][2] instanceof Object);
    t.end();
  });

  t.test('should add', t => {
    var f = F();
    t.deepEqual(f.eval('[1] [2] +').stack, [ [1, 2] ]);
    t.end();
  });

  t.test('should multiply', t => {
    t.equal((F().eval('[ 1 2 + ] 2 *').stack[0]).length, 6);
    t.end();
  });

  t.test('should test equality', t => {
    t.deepEqual(F().eval('[ 1 2 + ] [ 1 2 ] =').stack, [false]);
    t.deepEqual(F().eval('[ 1 2 + ] [ 1 2 + ] =').stack, [true]);
    t.end();
  });

  t.test('should eval lists', t => {
    var f = F();
    f.eval('[1 2 +]');
    t.equal(f.stack.length, 1);
    t.deepEqual(f.stack[0].length, 3);
    t.deepEqual(f.eval('eval').stack, [3]);
    t.end();
  });

  t.test('should zip lists', t => {
    var f = F();
    f.eval('[ 1 2 + ] [ 4 ]');
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
    var f = F();
    f.eval('[ 1 2 + ] ","');
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
    var f = F();
    t.deepEqual(f.eval('1 2 drop 3').stack, [1, 3]);
    t.end();
  });

  t.test('should swap', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 swap 3').stack, [2, 1, 3]);
    t.end();
  });

  t.test('should dup', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 dup 3').stack, [1, 2, 2, 3]);
    t.end();
  });

  t.test('should dup clone', t => {
    var f = F();
    f.eval('[ 1 2 3 ] dup');
    t.deepEqual(f.stack, [[1, 2, 3], [1, 2, 3]]);
    t.deepEqual(f.stack[0], f.stack[1]);
    t.notEqual(f.stack[0], f.stack[1]);
    t.end();
  });

  t.test('should clr', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 clr 3').stack, [3]);
    t.end();
  });

  t.test('should sto', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 "x" sto 3 x x').stack, [1, 3, 2, 2]);
    t.end();
  });

  t.test('should def', t => {
    var f = F();
    t.deepEqual(f.eval('[ 2 + ] "x" def 3 x x').stack, [7]);
    t.end();
  });

  t.test('should slip', t => {
    var f = F();
    t.deepEqual(f.eval('[ 1 2 + ] 4 slip').stack, [3, 4]);
    t.end();
  });

  t.test('should stack', t => {
    var f = F();
    t.deepEqual(f.eval('1 2 3 stack').stack, [[1, 2, 3]]);
    t.end();
  });

  t.test('should unstack', t => {
    var f = F();
    t.deepEqual(f.eval('[ 1 2 3 ] unstack').stack, [1, 2, 3]);
    t.end();
  });

  t.test('should choose', t => {
    var f = F();
    t.deepEqual(f.eval('true 3 4 choose').stack, [3]);
    t.deepEqual(F().eval('false 3 4 choose').stack, [4]);
    t.deepEqual(F().eval('5 false [ 2 + ] [ 2 * ] branch').stack, [10]);
    t.deepEqual(F().eval('5 true [ 2 + ] [ 2 * ] branch').stack, [7]);
    t.end();
  });
});
