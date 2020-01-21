import { F, fJSON, fValue, fValues, D, Word } from './helpers/setup';

test('should push quotes', async () => {
  expect(await fValues('[ 1 ] [ 2 ]')).toEqual([[1], [2]]);
  expect(await fValues('[1] [2]')).toEqual([[1], [2]]);
});

test('should not eval within quote', async () => {
  const f = F().eval('[ 1 ] [ 1 2 + ]');
  expect(f.stack.length).toBe(2);
  expect(f.toJSON()[0]).toEqual([D(1)]);
  expect(f.stack[1].toString()).toBe('1,2,+');
  expect(f.stack[1][2] instanceof Object).toBeTruthy();
});

test('should add quotes', async () => {
  expect(await fValues('[1] [2] +')).toEqual([[1, 2]]);
});

test('should mul quotes', async () => {
  const plus = new Word('+').toJSON();
  expect(await fJSON('[ 1 2 + ] 2 *')).toEqual([
    [D(1), D(2), plus, D(1), D(2), plus]
  ]);
});

test('should test equality', async () => {
  expect(await fJSON('[ 1 2 + ] [ 1 2 ] =')).toEqual([false]);
  expect(await fJSON('[ 1 2 + ] [ 1 2 + ] =')).toEqual([true]);
});

test('should eval quotes', async () => {
  const f = F().eval('[1 2 +]');
  expect(f.stack.length).toBe(1);
  expect((f.stack[0] as any[]).length).toEqual(3);
  expect(f.eval('eval').toJSON()).toEqual([D(3)]);
});

test('should zip quotes', async () => {
  const f = F().eval('[ 1 2 + ] [ 4 ]');
  expect(f.stack.length).toEqual(2);
  expect((f.stack[0] as any[]).length).toEqual(3);
  expect((f.stack[1] as any[]).length).toEqual(1);

  f.eval('*');
  expect(f.stack.length).toEqual(1);
  expect(f.stack[0].toString()).toBe('1,4,2,4,+,4');
});

test('should join lists', async () => {
  const f = F().eval('[ 1 2 + ] ","');
  expect(f.stack.length).toEqual(2);
  expect((f.stack[0] as any).length).toEqual(3);
  expect((f.stack[1] as any).length).toEqual(1);

  f.eval('*');
  expect(f.stack.length).toEqual(1);
  expect(f.stack[0].toString()).toEqual('1,2,+');
});

test('should <=> arrays by length', async () => {
  expect(await fValue('[1 2 3] [4 5 6] <=>')).toEqual(0);
  expect(await fValue('[1 2 3 4] [4 5 6] <=>')).toEqual(1);
  expect(await fValue('[1 2 3] [4 5 6 7] <=>')).toEqual(-1);
});
