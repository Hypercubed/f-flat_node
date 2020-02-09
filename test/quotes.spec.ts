import { ƒ, τ, F, Decimal, Word } from './helpers/setup';

test('should push quotes', async () => {
  expect(await ƒ('[ 1 ] [ 2 ]')).toEqual(`[ [ 1 ] [ 2 ] ]`);
  expect(await ƒ('[1] [2]')).toEqual(`[ [ 1 ] [ 2 ] ]`);
});

test('should not eval within quote', async () => {
  const f = F().eval('[ 1 ] [ 1 2 + ]');
  expect(f.stack.length).toBe(2);
  expect(f.stack[0]).toEqual([new Decimal(1)]);
  expect(f.stack[1].toString()).toBe('1,2,+');
  expect(f.stack[1][2] instanceof Object).toBeTruthy();
});

test('should add quotes', async () => {
  expect(await ƒ('[1] [2] +')).toEqual(`[ [ 1 2 ] ]`);
});

test('should mul quotes', async () => {
  const plus = new Word('+');
  expect(await ƒ('[ 1 2 + ] 2 *')).toEqual(τ([[1, 2, plus, 1, 2, plus]]));
});

test('should test equality', async () => {
  expect(await ƒ('[ 1 2 + ] [ 1 2 ] =')).toEqual(`[ false ]`);
  expect(await ƒ('[ 1 2 + ] [ 1 2 + ] =')).toEqual(`[ true ]`);
});

test('should eval quotes', async () => {
  expect(await ƒ('[1 2 +] eval')).toEqual(`[ 3 ]`);
});

test('should zip quotes', async () => {
  expect(await ƒ('[ 1 2 + ] [ 4 ] *')).toEqual(`[ [ 1 4 2 4 + 4 ] ]`);
});

test('should join lists', async () => {
  expect(await ƒ('[ 1 2 + ] "," *')).toEqual(`[ '1,2,+' ]`);
});

test('should <=> arrays by length', async () => {
  expect(await ƒ('[1 2 3] [4 5 6] <=>')).toEqual(`[ 0 ]`);
  expect(await ƒ('[1 2 3 4] [4 5 6] <=>')).toEqual(`[ 1 ]`);
  expect(await ƒ('[1 2 3] [4 5 6 7] <=>')).toEqual(`[ -1 ]`);
});
