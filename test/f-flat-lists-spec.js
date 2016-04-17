import test from 'ava';
import {F, fSync} from './setup';

test('should push lists', t => {
  t.deepEqual(fSync('( 1 ) ( 2 )'), [[1], [2]], 'should push');
  t.deepEqual(fSync('(1) (2)'), [[1], [2]], 'should handle missing whitespace');
  t.deepEqual(fSync('(1) (2 3 +)'), [[1], [5]], 'should eval within list');
});

test('should evaluate quoted lists', t => {
  t.deepEqual(fSync('[ ( 1 2 + ) ] in'), [[[3]]]);
});

test('should get length', t => {
  t.deepEqual(fSync('( 1 2 ) length'), [2], 'should get length');
});

test('should add', t => {
  t.deepEqual(fSync('(1) (2) +'), [[1, 2]], 'should add');
  t.deepEqual(fSync('(1 2 3) dup (4 5 6) +'), [[1, 2, 3], [1, 2, 3, 4, 5, 6]], 'should add without mutation');
});

test('should multiply', t => {
  t.deepEqual(fSync('(1) 2 *'), [[1, 1]]);
  t.deepEqual(fSync('(1) 3 *'), [[1, 1, 1]]);
  t.deepEqual(fSync('(1 2) 2 *'), [[1, 2, 1, 2]]);
  t.deepEqual(fSync('(1 2 +) 2 *'), [[3, 3]]);
  t.deepEqual(fSync('(1 2 +) 0 *'), [[]]);
});

test('mul identities', t => {
  t.deepEqual(fSync('(1) 3 * sum'), [3]);
  t.deepEqual(fSync('(2) 3 * sum'), [6]);
  t.deepEqual(fSync('(1) 3 * 3 / sum'), [1]);
  t.deepEqual(fSync('(2) 3 * 3 / sum'), [2]);
});

test('div identities', t => {
  t.deepEqual(fSync('(1) 1 /'), [[1]]);
  t.deepEqual(fSync('(1 1) 2 /'), [[1]]);
  t.deepEqual(fSync('(1 1 1 1) 2 /'), [[1, 1]]);
});

test('add/sub identities', t => {
  t.deepEqual(fSync('(1) 2 + sum'), [3]);
  // t.deepEqual(fSync('(1) 2 + 2 - sum', [1]); // ???
});

test('pow identities', t => {  // right associative
  t.deepEqual(fSync('(1) 2 pow'), [[1, 1]]);
  t.deepEqual(fSync('(2) 3 pow'), [[2, 2, 2]]);
  t.deepEqual(fSync('(1 1) 3 pow'), [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]);
  t.deepEqual(fSync('(1 2) 3 pow'), [[1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2]]);
  // t.deepEqual(fSync('(1) 2 + 2 - sum', [1]); // ???
});

test('should test equality', t => {
  t.deepEqual(fSync('(1 2) (1 2) ='), [true]);
  t.deepEqual(fSync('(1) (2) ='), [false]);
  t.deepEqual(fSync('(1 2)  (1) ='), [false]);
  t.deepEqual(fSync('(1 2) (1 1) ='), [false]);
});

test('should eval lists', t => {
  const f = new F();
  t.deepEqual(f.eval('( 1 2 )').toArray(), [[1, 2]]);
  t.deepEqual(f.eval('eval').toArray(), [1, 2]);
});

test('should zip lists', t => {
  const f = new F();
  t.deepEqual(f.eval('( 1 2 3 ) ( 4 )').toArray(), [[1, 2, 3], [4]]);
  t.deepEqual(f.eval('*').toArray(), [[1, 4, 2, 4, 3, 4]]);
});

test('should join', t => {
  t.deepEqual(fSync('( 1 2 3 ) "-" *'), ['1-2-3'], 'should join');
});

test('should <<', t => {
  t.deepEqual(fSync('( 1 2 3 ) 4 <<'), [[1, 2, 3, 4]], 'should <<');
  t.deepEqual(fSync('( 1 2 3 ) dup 4 <<'), [[1, 2, 3], [1, 2, 3, 4]], 'should <<, immutable');
});

test('should >>', t => {
  t.deepEqual(fSync('4 ( 1 2 3 ) >>'), [[4, 1, 2, 3]], 'should >>');
  t.deepEqual(fSync('4 ( 1 2 3 ) tuck >>'), [[1, 2, 3], [4, 1, 2, 3]], 'should >>, immutable');
});

test('should @', t => {
  t.deepEqual(fSync('( 4 5 6 ) 0 @'), [4]);
  t.deepEqual(fSync('( 4 5 6 ) 1 @'), [5]);
  t.deepEqual(fSync('( 4 5 6 ) 2 @'), [6]);
  t.deepEqual(fSync('( 4 5 6 ) 10 @'), [null], 'should @');
});

test('should @ from end', t => {
  t.deepEqual(fSync('( 4 5 6 ) -1 @'), [6]);
  t.deepEqual(fSync('( 4 5 6 ) -2 @'), [5]);
  t.deepEqual(fSync('( 4 5 6 ) -3 @'), [4]);
});

test('should pop and shift without mutation', t => {
  t.deepEqual(fSync('( 1 2 3 ) dup pop'), [[1, 2, 3], [1, 2]], 'should pop, without mutation');
  t.deepEqual(fSync('( 1 2 3 ) dup shift'), [[1, 2, 3], [2, 3]], 'should shift, without mutation');
});