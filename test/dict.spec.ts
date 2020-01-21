import { fJSON, fValues, Word, Sentence, D } from './helpers/setup';

test('should def and use actions', async () => {
  expect(await fValues('x: [ 1 2 + ] def 3 x x')).toEqual([3, 3, 3]);
});

test('should def and use nested actions', async () => {
  expect(await fValues('test_def: { x: [ 1 2 + ] } def test_def.x')).toEqual([
    3
  ]);
});

test('should def and use nested actions in a fork', async () => {
  expect(
    await fValues('test_def: { x: [ 1 2 + ] } def [ test_def.x ] fork')
  ).toEqual([[3]]);
});

test('cannot overwrite defined words', async () => {
  await expect(fValues('x: 123 def x: 456 def')).rejects.toThrow('Cannot overwrite local definition: x');
});

test('invalid keys', async () => {
  await expect(fValues('x: 123 def x.y: 456 def')).rejects.toThrow('Invalid definition key: x.y');
});

test('should shadow definitions in a fork', async () => {
  expect(
    await fValues(
      '"a" [ "outsite-a" ] def a [ "a" [ "in-fork-a" ] def a ] fork a'
    )
  ).toEqual(['outsite-a', ['in-fork-a'], 'outsite-a']);
  expect(
    await fValues(
      '"a" [ "outsite-a" ] def a [ "b" [ "in-in-b" ] def a b ] in a b'
    )
  ).toEqual(['outsite-a', ['outsite-a', 'in-in-b'], 'outsite-a', 'in-in-b']);
});

test('should isloate definitions in a fork', async () => {
  expect(await fValues('[ "a" ["in-fork-a"] def a ] fork')).toStrictEqual([['in-fork-a']]);
  await expect(fValues('[ "a" ["in-fork-a"] def a ] fork a')).rejects.toThrow('a is not define');
});

test('should execute stored actions', async () => {
  expect(await fValues('x: [ 1 2 + ] def x x')).toEqual([3, 3]);
  expect(await fValues('test: { x: [ 1 2 + ] } def test.x')).toEqual([3]);
});

test('create actions', async () => {
  const evalAction = new Word('eval').toJSON();

  expect(await fJSON('"eval" :')).toEqual([evalAction]);
  expect(await fJSON('eval:')).toEqual([evalAction]);
  // t.deepEqual(await fJSON('[ eval ] :'), [evalAction]);
});

test('should inline internal actions', async () => {
  const evalAction = new Word('eval').toJSON();

  expect(await fJSON('eval: inline')).toEqual([evalAction]);
  // t.deepEqual(await fJSON('[ eval ] : inline'), [evalAction]);
  expect(await fJSON('[ eval ] inline')).toEqual([[evalAction]]);
  expect(await fJSON('{ x: eval: } inline')).toEqual([{ x: evalAction }]);
  // t.deepEqual(await fJSON('{ x: [ eval ] : } inline'), [{ x: evalAction }]);
  expect(await fJSON('{ x: [ eval ] } inline')).toEqual([{ x: [evalAction] }]);
});

test('should inline defined actions', async () => {
  const qi = new Word('q<').toJSON();
  const evalAction = new Word('eval').toJSON();
  const qo = new Word('q>').toJSON();
  const slipAction = new Sentence([qi, evalAction, qo]).toJSON();

  expect(await fJSON('slip: inline')).toEqual([slipAction]);
  // t.deepEqual(await fJSON('[ slip ] : inline'), [slipAction]);
  expect(await fJSON('[ slip ] inline')).toEqual([[slipAction]]);
  expect(await fJSON('{ x: slip: } inline')).toEqual([{ x: slipAction }]);
  // t.deepEqual(await fJSON('{ x: [ slip ] : } inline'), [{ x: slipAction }]);
  expect(await fJSON('{ x: [ slip ] } inline')).toEqual([{ x: [slipAction] }]);
});
