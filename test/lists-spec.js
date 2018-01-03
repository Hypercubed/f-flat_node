import test from 'ava';
import { F, fSyncJSON, fSyncValues, D } from './setup';

test('should push lists', t => {
  t.deepEqual(fSyncValues('( 1 ) ( 2 )'), [[1], [2]], 'should push');
  t.deepEqual(fSyncValues('(1) (2)'), [[1], [2]], 'should handle missing whitespace');
  t.deepEqual(fSyncValues('(1) (2 3 +)'), [[1], [5]], 'should eval within list');
});

test('should evaluate quoted lists', t => {
  t.deepEqual(fSyncValues('[ ( 1 2 + ) ] in'), [[[3]]]);
});

test('should get length', t => {
  t.deepEqual(fSyncValues('( 1 2 ) ln'), [2], 'should get length');
});

test('should add', t => {
  t.deepEqual(fSyncValues('(1) (2) +'), [[1, 2]], 'should add');
  t.deepEqual(
    fSyncValues('(1 2 3) dup (4 5 6) +'),
    [[1, 2, 3], [1, 2, 3, 4, 5, 6]],
    'should add without mutation'
  );
});

test('should multiply', t => {
  t.deepEqual(fSyncValues('(1) 2 *'), [[1, 1]]);
  t.deepEqual(fSyncValues('(1) 3 *'), [[1, 1, 1]]);
  t.deepEqual(fSyncValues('(1 2) 2 *'), [[1, 2, 1, 2]]);
  t.deepEqual(fSyncValues('(1 2 +) 2 *'), [[3, 3]]);
  t.deepEqual(fSyncValues('(1 2 +) 0 *'), [[]]);
});

test('mul identities', t => {
  t.deepEqual(fSyncValues('(1) 3 * sum'), [3]);
  t.deepEqual(fSyncValues('(2) 3 * sum'), [6]);
  t.deepEqual(fSyncValues('(1) 3 * 3 / + sum'), [3]);
  t.deepEqual(fSyncValues('(2) 3 * 3 / + sum'), [6]);
});

test('div identities', t => {
  t.deepEqual(fSyncValues('(1) 1 /'), [[1], []]);
  t.deepEqual(fSyncValues('(1 2) 1 /'), [[1], [2]]);
  t.deepEqual(fSyncValues('(1 2 3 4) 2 /'), [[1, 2], [3,4]]);
});

test('add/sub identities', t => {
  t.deepEqual(fSyncValues('(1) 2 + sum'), [3]);
  // t.deepEqual(fSyncJSON('(1) 2 + 2 - sum', [1]); // ???
});

test('pow identities', t => {
  // right associative
  t.deepEqual(fSyncValues('(1) 2 pow'), [[1, 1]]);
  t.deepEqual(fSyncValues('(2) 3 pow'), [[2, 2, 2]]);
  t.deepEqual(fSyncValues('(1 1) 3 pow'), [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]);
  t.deepEqual(fSyncValues('(1 2) 3 pow'), [
    [1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2]
  ]);
  // t.deepEqual(fSyncJSON('(1) 2 + 2 - sum', [1]); // ???
});

test('should test equality', t => {
  t.deepEqual(fSyncJSON('(1 2) (1 2) ='), [true]);
  t.deepEqual(fSyncJSON('(1) (2) ='), [false]);
  t.deepEqual(fSyncJSON('(1 2)  (1) ='), [false]);
  t.deepEqual(fSyncJSON('(1 2) (1 1) ='), [false]);
});

test('should eval lists', t => {
  const f = new F();
  t.deepEqual(f.eval('( 1 2 )').toJSON(), D([[1, 2]]));
  t.deepEqual(f.eval('eval').toJSON(), D([1, 2]));
});

test('should zip lists', t => {
  const f = new F();
  t.deepEqual(f.eval('( 1 2 3 ) ( 4 )').toJSON(), D([[1, 2, 3], [4]]));
  t.deepEqual(f.eval('*').toJSON(), D([[1, 4, 2, 4, 3, 4]]));
});

test('should join', t => {
  t.deepEqual(fSyncJSON('( 1 2 3 ) "-" *'), ['1-2-3'], 'should join');
});

test('should <<', t => {
  t.deepEqual(fSyncValues('( 1 2 3 ) 4 <<'), [[1, 2, 3, 4]], 'should <<');
  t.deepEqual(
    fSyncValues('( 1 2 3 ) dup 4 <<'),
    [[1, 2, 3], [1, 2, 3, 4]],
    'should <<, immutable'
  );
});

test('should >>', t => {
  t.deepEqual(fSyncValues('4 ( 1 2 3 ) >>'), [[4, 1, 2, 3]], 'should >>');
  t.deepEqual(
    fSyncValues('4 ( 1 2 3 ) tuck >>'),
    [[1, 2, 3], [4, 1, 2, 3]],
    'should >>, immutable'
  );
});

test('should @', t => {
  t.deepEqual(fSyncValues('( 4 5 6 ) 0 @'), [4]);
  t.deepEqual(fSyncValues('( 4 5 6 ) 1 @'), [5]);
  t.deepEqual(fSyncValues('( 4 5 6 ) 2 @'), [6]);
  
});

test('should @ from end', t => {
  t.deepEqual(fSyncValues('( 4 5 6 ) -1 @'), [6]);
  t.deepEqual(fSyncValues('( 4 5 6 ) -2 @'), [5]);
  t.deepEqual(fSyncValues('( 4 5 6 ) -3 @'), [4]);
});

test('should @ out of range', t => {
  t.deepEqual(fSyncJSON('( 4 5 6 ) 10 @'), [null]);
  t.deepEqual(fSyncJSON('( 4 5 6 ) -10 @'), [null]);
});

test('should pop and shift without mutation', t => {
  t.deepEqual(
    fSyncValues('( 1 2 3 ) dup pop'),
    [[1, 2, 3], [1, 2]],
    'should pop, without mutation'
  );
  t.deepEqual(
    fSyncValues('( 1 2 3 ) dup shift'),
    [[1, 2, 3], [2, 3]],
    'should shift, without mutation'
  );
});

test('should fine maximum and minimum', t => {
  t.deepEqual(
    fSyncValues('( 2 3 1 6 3 ) maximum'),
    [ 6 ]
  );
  t.deepEqual(
    fSyncValues('( 2 3 1 6 3 ) minimum'),
    [1]
  );
});

test('should xxs', t => {
  t.deepEqual(fSyncValues('(5 4 3) xxs'), [5, [4,3]]);
});

test('should quicksort', t => {
  t.deepEqual(
    fSyncValues('[ 10 2 5 3 1 6 7 4 2 3 4 8 9 ] quicksort'),
    [[ 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8, 9, 10 ]]
  );
});

test('should filter', t => {
  t.deepEqual(
    fSyncValues('[ 10 2 5 3 1 6 7 4 2 3 4 8 9 ] [ even? ] filter'),
    [[ 10, 2, 6, 4, 2, 4, 8 ]]
  );
});

test('should filter arrays of arrays', t => {
  t.deepEqual(
    fSyncValues('[ [10 2] [5] [3 1 6 7] [4 2 3] [4] [8 9] ] [ ln even? ] filter'),
    [[ [10, 2], [3, 1, 6, 7], [8, 9] ]]
  );
});

test('should foldl and foldr', t => {
  t.deepEqual(fSyncValues('10 integers 0 [+] foldl'),[ 55 ]);
  t.deepEqual(fSyncValues('10 integers 0 [+] foldr'),[ 55 ]);
  t.deepEqual(fSyncValues('10 integers 0 [-] foldl'),[ -55 ]);
  t.deepEqual(fSyncValues('10 integers 0 [-] foldr'),[ -5 ]);
});


