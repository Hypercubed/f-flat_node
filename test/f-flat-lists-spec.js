import test from 'ava';
import {Stack as F} from '../';
import {log} from '../src/logger';

log.level = process.env.NODE_ENV || 'error';

process.chdir('..');

function fSync (a) {
  return new F(a).toArray();
}

test('should push lists', t => {
  t.same(fSync('( 1 ) ( 2 )'), [[1], [2]], 'should push');
  t.same(fSync('(1) (2)'), [[1], [2]], 'should handle missing whitespace');
  t.same(fSync('(1) (2 3 +)'), [[1], [5]], 'should eval within list');
});

test('should evaluate quoted lists', t => {
  t.same(fSync('[ ( 1 2 + ) ] in'), [[[3]]]);
});

test('should get length', t => {
  t.same(fSync('( 1 2 ) length'), [2], 'should get length');
});

test('should add', t => {
  t.same(fSync('(1) (2) +'), [[1, 2]], 'should add');
  t.same(fSync('(1 2 3) dup (4 5 6) +'), [[1, 2, 3], [1, 2, 3, 4, 5, 6]], 'should add without mutation');
});

test('should multiply', t => {
  t.same(fSync('(1) 2 *'), [[1, 1]]);
  t.same(fSync('(1) 3 *'), [[1, 1, 1]]);
  t.same(fSync('(1 2) 2 *'), [[1, 2, 1, 2]]);
  t.same(fSync('(1 2 +) 2 *'), [[3, 3]]);
  t.same(fSync('(1 2 +) 0 *'), [[]]);
});

test('mul identities', t => {
  t.same(fSync('(1) 3 * sum'), [3]);
  t.same(fSync('(2) 3 * sum'), [6]);
  t.same(fSync('(1) 3 * 3 / sum'), [1]);
  t.same(fSync('(2) 3 * 3 / sum'), [2]);
});

test('div identities', t => {
  t.same(fSync('(1) 1 /'), [[1]]);
  t.same(fSync('(1 1) 2 /'), [[1]]);
  t.same(fSync('(1 1 1 1) 2 /'), [[1, 1]]);
});

test('add/sub identities', t => {
  t.same(fSync('(1) 2 + sum'), [3]);
  // t.same(fSync('(1) 2 + 2 - sum', [1]); // ???
});

test('pow identities', t => {  // right associative
  t.same(fSync('(1) 2 pow'), [[1, 1]]);
  t.same(fSync('(2) 3 pow'), [[2, 2, 2]]);
  t.same(fSync('(1 1) 3 pow'), [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]);
  t.same(fSync('(1 2) 3 pow'), [[1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2]]);
  // t.same(fSync('(1) 2 + 2 - sum', [1]); // ???
});

test('should test equality', t => {
  t.same(fSync('(1 2) (1 2) ='), [true]);
  t.same(fSync('(1) (2) ='), [false]);
  t.same(fSync('(1 2)  (1) ='), [false]);
  t.same(fSync('(1 2) (1 1) ='), [false]);
});

test('should eval lists', t => {
  const f = new F();
  t.same(f.eval('( 1 2 )').toArray(), [[1, 2]]);
  t.same(f.eval('eval').toArray(), [1, 2]);
});

test('should zip lists', t => {
  const f = new F();
  t.same(f.eval('( 1 2 3 ) ( 4 )').toArray(), [[1, 2, 3], [4]]);
  t.same(f.eval('*').toArray(), [[1, 4, 2, 4, 3, 4]]);
});

test('should join', t => {
  t.same(fSync('( 1 2 3 ) "-" *'), ['1-2-3'], 'should join');
});

test('should <<', t => {
  t.same(fSync('( 1 2 3 ) 4 <<'), [[1, 2, 3, 4]], 'should <<');
  t.same(fSync('( 1 2 3 ) dup 4 <<'), [[1, 2, 3], [1, 2, 3, 4]], 'should <<, immutable');
});

test('should >>', t => {
  t.same(fSync('4 ( 1 2 3 ) >>'), [[4, 1, 2, 3]], 'should >>');
  t.same(fSync('4 ( 1 2 3 ) tuck >>'), [[1, 2, 3], [4, 1, 2, 3]], 'should >>, immutable');
});

test('should @', t => {
  t.same(fSync('( 4 5 6 ) 0 @'), [4]);
  t.same(fSync('( 4 5 6 ) 1 @'), [5]);
  t.same(fSync('( 4 5 6 ) 2 @'), [6]);
  t.same(fSync('( 4 5 6 ) 10 @'), [null], 'should @');
});

test('should @ from end', t => {
  t.same(fSync('( 4 5 6 ) -1 @'), [6]);
  t.same(fSync('( 4 5 6 ) -2 @'), [5]);
  t.same(fSync('( 4 5 6 ) -3 @'), [4]);
});

test('should pop and shift without mutation', t => {
  t.same(fSync('( 1 2 3 ) dup pop'), [[1, 2, 3], [1, 2]], 'should pop, without mutation');
  t.same(fSync('( 1 2 3 ) dup shift'), [[1, 2, 3], [2, 3]], 'should shift, without mutation');
});
