import test from 'ava';
import { fJSON, fValues, Word, Sentence, D } from './helpers/setup';

test('should def and use actions', async t => {
  t.deepEqual(
    await fValues('x: [ 1 2 + ] def 3 x x'),
    [3, 3, 3],
    'should execute actions'
  );
});

test('should def and use nested actions', async t => {
  t.deepEqual(
    await fValues('test_def: { x: [ 1 2 + ] } def test_def.x'),
    [3]
  );
});

test('should def and use nested actions in a fork', async t => {
  t.deepEqual(
    await fValues('test_def: { x: [ 1 2 + ] } def [ test_def.x ] fork'),
    [[3]]
  );
});

test('cannot overwrite defined words', async t => {
  await t.throwsAsync(() => fValues('x: 123 def x: 456 def'));
  await t.throwsAsync(() => fValues('x: 123 def x.y: 456 def'));
});

test('should shadow definitions in a fork', async t => {
  t.deepEqual(
    await fValues('"a" [ "outsite-a" ] def a [ "a" [ "in-fork-a" ] def a ] fork a'),
    ['outsite-a', ['in-fork-a'], 'outsite-a'],
    'fork should isolate child scope'
  );
  t.deepEqual(
    await fValues('"a" [ "outsite-a" ] def a [ "b" [ "in-in-b" ] def a b ] in a b'),
    ['outsite-a', ['outsite-a', 'in-in-b'], 'outsite-a', 'in-in-b'],
    'in does not isolate child scope'
  );
});

test('should isloate definitions in a fork', async t => {
  await t.notThrowsAsync(() => fValues('[ "a" ["in-fork-a"] def a ] fork'));
  await t.throwsAsync(() => fValues('[ "a" ["in-fork-a"] def a ] fork a'));
});

test('should execute stored actions', async t => {
  t.deepEqual(
    await fValues('x: [ 1 2 + ] def x x'),
    [3, 3]
  );
  t.deepEqual(
    await fValues('test: { x: [ 1 2 + ] } def test.x'),
    [3],
    'should define and use nested acion'
  );
});

test('create actions', async t => {
  const evalAction = new Word('eval').toJSON();

  t.deepEqual(await fJSON('"eval" :'), [evalAction]);
  t.deepEqual(await fJSON('eval:'), [evalAction]);
  // t.deepEqual(await fJSON('[ eval ] :'), [evalAction]);
});

test('should inline internal actions', async t => {
  const evalAction = new Word('eval').toJSON();

  t.deepEqual(await fJSON('eval: inline'), [evalAction]);
  // t.deepEqual(await fJSON('[ eval ] : inline'), [evalAction]);
  t.deepEqual(await fJSON('[ eval ] inline'), [[evalAction]]);
  t.deepEqual(await fJSON('{ x: eval: } inline'), [{ x: evalAction }]);
  // t.deepEqual(await fJSON('{ x: [ eval ] : } inline'), [{ x: evalAction }]);
  t.deepEqual(await fJSON('{ x: [ eval ] } inline'), [{ x: [evalAction] }]);
});

test('should inline defined actions', async t => {
  const qi = new Word('q<').toJSON();
  const evalAction = new Word('eval').toJSON();
  const qo = new Word('q>').toJSON();
  const slipAction = new Sentence([qi, evalAction, qo]).toJSON();

  t.deepEqual(await fJSON('slip: inline'), [slipAction]);
  // t.deepEqual(await fJSON('[ slip ] : inline'), [slipAction]);
  t.deepEqual(await fJSON('[ slip ] inline'), [[slipAction]]);
  t.deepEqual(await fJSON('{ x: slip: } inline'), [{ x: slipAction }]);
  // t.deepEqual(await fJSON('{ x: [ slip ] : } inline'), [{ x: slipAction }]);
  t.deepEqual(await fJSON('{ x: [ slip ] } inline'), [{ x: [slipAction] }]);
});
