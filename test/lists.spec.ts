import test from 'ava';
import { F, fJSON, fValues, D } from './setup';

test('should push lists', async t => {
  t.deepEqual(await fValues('( 1 ) ( 2 )'), [[1], [2]], 'should push');
  t.deepEqual(await fValues('(1) (2)'), [[1], [2]], 'should handle missing whitespace');
  t.deepEqual(await fValues('(1) (2 3 +)'), [[1], [5]], 'should eval within list');
});

test('should evaluate quoted lists', async t => {
  t.deepEqual(await fValues('[ ( 1 2 + ) ] in'), [[[3]]]);
});

test('should get length', async t => {
  t.deepEqual(await fValues('( 1 2 ) ln'), [2], 'should get length');
});

test('should add', async t => {
  t.deepEqual(await fValues('(1) (2) +'), [[1, 2]], 'should add');
  t.deepEqual(
    await fValues('(1 2 3) dup (4 5 6) +'),
    [[1, 2, 3], [1, 2, 3, 4, 5, 6]],
    'should add without mutation'
  );
});

test('should multiply', async t => {
  t.deepEqual(await fValues('(1) 2 *'), [[1, 1]]);
  t.deepEqual(await fValues('(1) 3 *'), [[1, 1, 1]]);
  t.deepEqual(await fValues('(1 2) 2 *'), [[1, 2, 1, 2]]);
  t.deepEqual(await fValues('(1 2 +) 2 *'), [[3, 3]]);
  t.deepEqual(await fValues('(1 2 +) 0 *'), [[]]);
});

test('mul identities', async t => {
  t.deepEqual(await fValues('(1) 3 * sum'), [3]);
  t.deepEqual(await fValues('(2) 3 * sum'), [6]);
  t.deepEqual(await fValues('(1) 3 * 3 / + sum'), [3]);
  t.deepEqual(await fValues('(2) 3 * 3 / + sum'), [6]);
});

test('div identities', async t => {
  t.deepEqual(await fValues('(1) 1 /'), [[1], []]);
  t.deepEqual(await fValues('(1 2) 1 /'), [[1], [2]]);
  t.deepEqual(await fValues('(1 2 3 4) 2 /'), [[1, 2], [3, 4]]);
});

test('add/sub identities', async t => {
  t.deepEqual(await fValues('(1) 2 + sum'), [3]);
  // t.deepEqual(await fJSON('(1) 2 + 2 - sum', [1]); // ???
});

test('pow identities', async t => {
  // right associative
  t.deepEqual(await fValues('(1) 2 pow'), [[1, 1]]);
  t.deepEqual(await fValues('(2) 3 pow'), [[2, 2, 2]]);
  t.deepEqual(await fValues('(1 1) 3 pow'), [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]);
  t.deepEqual(await fValues('(1 2) 3 pow'), [
    [1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2]
  ]);
  // t.deepEqual(await fJSON('(1) 2 + 2 - sum', [1]); // ???
});

test('should test equality', async t => {
  t.deepEqual(await fJSON('(1 2) (1 2) ='), [true]);
  t.deepEqual(await fJSON('(1) (2) ='), [false]);
  t.deepEqual(await fJSON('(1 2)  (1) ='), [false]);
  t.deepEqual(await fJSON('(1 2) (1 1) ='), [false]);
});

test('should eval lists', async t => {
  const f = F();
  t.deepEqual(f.eval('( 1 2 )').toJSON(), D([[1, 2]]));
  t.deepEqual(f.eval('eval').toJSON(), D([1, 2]));
});

test('should zip lists', async t => {
  const f = F();
  t.deepEqual(f.eval('( 1 2 3 ) ( 4 )').toJSON(), D([[1, 2, 3], [4]]));
  t.deepEqual(f.eval('*').toJSON(), D([[1, 4, 2, 4, 3, 4]]));
});

test('should join', async t => {
  t.deepEqual(await fJSON('( 1 2 3 ) "-" *'), ['1-2-3'], 'should join');
});

test('should <<', async t => {
  t.deepEqual(await fValues('( 1 2 3 ) 4 <<'), [[1, 2, 3, 4]], 'should <<');
  t.deepEqual(
    await fValues('( 1 2 3 ) dup 4 <<'),
    [[1, 2, 3], [1, 2, 3, 4]],
    'should <<, immutable'
  );
});

test('should >>', async t => {
  t.deepEqual(await fValues('4 ( 1 2 3 ) >>'), [[4, 1, 2, 3]], 'should >>');
  t.deepEqual(
    await fValues('4 ( 1 2 3 ) tuck >>'),
    [[1, 2, 3], [4, 1, 2, 3]],
    'should >>, immutable'
  );
});

test('should @', async t => {
  t.deepEqual(await fValues('( 4 5 6 ) 0 @'), [4]);
  t.deepEqual(await fValues('( 4 5 6 ) 1 @'), [5]);
  t.deepEqual(await fValues('( 4 5 6 ) 2 @'), [6]);

});

test('should @ from end', async t => {
  t.deepEqual(await fValues('( 4 5 6 ) -1 @'), [6]);
  t.deepEqual(await fValues('( 4 5 6 ) -2 @'), [5]);
  t.deepEqual(await fValues('( 4 5 6 ) -3 @'), [4]);
});

test('should @ out of range', async t => {
  t.deepEqual(await fJSON('( 4 5 6 ) 10 @'), [null]);
  t.deepEqual(await fJSON('( 4 5 6 ) -10 @'), [null]);
});

test('should pop and shift without mutation', async t => {
  t.deepEqual(
    await fValues('( 1 2 3 ) dup pop'),
    [[1, 2, 3], [1, 2]],
    'should pop, without mutation'
  );
  t.deepEqual(
    await fValues('( 1 2 3 ) dup shift'),
    [[1, 2, 3], [2, 3]],
    'should shift, without mutation'
  );
});

test('should fine maximum and minimum', async t => {
  t.deepEqual(
    await fValues('( 2 3 1 6 3 ) maximum'),
    [ 6 ]
  );
  t.deepEqual(
    await fValues('( 2 3 1 6 3 ) minimum'),
    [1]
  );
});

test('should uncons', async t => {
  t.deepEqual(await fValues('(5 4 3) uncons'), [5, [4, 3]]);
});

test('should quicksort', async t => {
  t.deepEqual(
    await fValues('[ 10 2 5 3 1 6 7 4 2 3 4 8 9 ] quicksort'),
    [[ 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8, 9, 10 ]]
  );
});

test('should filter', async t => {
  t.deepEqual(
    await fValues('[ 10 2 5 3 1 6 7 4 2 3 4 8 9 ] [ even? ] filter'),
    [[ 10, 2, 6, 4, 2, 4, 8 ]]
  );
});

test('should filter arrays of arrays', async t => {
  t.deepEqual(
    await fValues('[ [10 2] [5] [3 1 6 7] [4 2 3] [4] [8 9] ] [ ln even? ] filter'),
    [[ [10, 2], [3, 1, 6, 7], [8, 9] ]]
  );
});

test('should foldl and foldr', async t => {
  t.deepEqual(await fValues('10 integers 0 [+] foldl'), [ 55 ]);
  t.deepEqual(await fValues('10 integers 0 [+] foldr'), [ 55 ]);
  t.deepEqual(await fValues('10 integers 0 [-] foldl'), [ -55 ]);
  t.deepEqual(await fValues('10 integers 0 [-] foldr'), [ -5 ]);
});


