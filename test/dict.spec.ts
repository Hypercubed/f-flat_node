import { ƒ, τ, Word, Sentence } from './helpers/setup';

test('should def and use actions', async () => {
  expect(await ƒ('x: [ 1 2 + ] def 3 x x')).toEqual(`[ 3 3 3 ]`);
});

test('should def and use nested actions', async () => {
  expect(await ƒ('test_def: { x: [ 1 2 + ] } def test_def.x')).toEqual(`[ 3 ]`);
});

test('should def and use nested actions in a fork', async () => {
  expect(await ƒ('test_def: { x: [ 1 2 + ] } def [ test_def.x ] fork')).toEqual(
    `[ [ 3 ] ]`
  );
});

test('cannot overwrite defined words', async () => {
  await expect(ƒ('x: [123] def x: [456] def')).rejects.toThrow(
    'Cannot overwrite definition: x'
  );
});

test('should shadow definitions in a fork', async () => {
  expect(
    await ƒ('"a" [ "outsite-a" ] def a [ "a" [ "in-fork-a" ] def a ] fork a')
  ).toEqual(`[ 'outsite-a' [ 'in-fork-a' ] 'outsite-a' ]`);
  expect(
    await ƒ('"a" [ "outsite-a" ] def a [ "b" [ "in-in-b" ] def a b ] in a b')
  ).toEqual(`[ 'outsite-a' [ 'outsite-a' 'in-in-b' ] 'outsite-a' 'in-in-b' ]`);
});

test('should isloate definitions in a fork', async () => {
  expect(await ƒ('[ "a" ["in-fork-a"] def a ] fork')).toStrictEqual(
    `[ [ 'in-fork-a' ] ]`
  );
  await expect(ƒ('[ "a" ["in-fork-a"] def a ] fork a')).rejects.toThrow(
    'a is not define'
  );
});

test('should execute stored actions', async () => {
  expect(await ƒ('x: [ 1 2 + ] def x x')).toEqual(`[ 3 3 ]`);
  expect(await ƒ('test: { x: [ 1 2 + ] } def test.x')).toEqual(`[ 3 ]`);
});

test('create actions', async () => {
  expect(await ƒ('"eval" :')).toEqual(`[ eval ]`); // ??
});

describe('inline', () => {
  test('should inline internal actions', async () => {
    expect(await ƒ('[ eval ] inline')).toEqual(`[ [ eval ] ]`);
    expect(await ƒ('{ x: [ eval ] } inline')).toEqual(`[ { x: [ eval ] } ]`);
  });

  test('should inline defined actions', async () => {
    expect(await ƒ('[ slip ] inline')).toEqual(`[ [ q< eval q> ] ]`);
    expect(await ƒ('{ x: [ slip ] } inline')).toEqual(
      `[ { x: [ q< eval q> ] } ]`
    );
  });

  test('should not inline local qualified words', async () => {
    // Maybe this shouldn't work if the defintion is not local??
    expect(await ƒ('[ .slip ] inline')).toEqual(`[ [ .slip ] ]`);
    expect(await ƒ('{ x: [ .slip ] } inline')).toEqual(
      `[ { x: [ .slip ] } ]`
    );
  });

  test('should not inline keys', async () => {
    expect(await ƒ('eval: inline')).toEqual(`[ eval: ]`);
    expect(await ƒ('slip: inline')).toEqual(`[ slip: ]`);
    expect(await ƒ('{ x: slip: } inline')).toEqual(`[ { x: slip: } ]`);
    expect(await ƒ('[ slip: ] inline')).toEqual(`[ [ slip: ] ]`);
  });

  test('should inline deeply', async () => {
    expect(await ƒ('[ sip ] inline')).toEqual(`[ [ q< dup q> swap q< eval q> ] ]`);
  });
});

describe('defer', () => {
  test('can defer, but not use', async () => {
    expect(ƒ('x: defer x')).rejects.toThrow('x is not defined');
  });

  test('can defer, then define and use', async () => {
    expect(await ƒ('x: defer x: [ 1 ] def x')).toEqual(`[ 1 ]`);
  });

  test('can defer multiple times before defining', async () => {
    expect(await ƒ('x: defer x: defer x: [ 1 ] def x')).toEqual(`[ 1 ]`);
  });

  test(`can't defer after defining`, async () => {
    expect(ƒ('x: [ 1 ] def x: defer')).rejects.toThrow('Cannot overwrite definition: x');
  });

  test('mutually recursive', async () => {
    expect(
      await ƒ(`
      c: defer

      e: [ dup 2 / c ] ;
      o: [ dup 3 * 1 + c ] ;

      c: [
        dup 1 =
        [
          dup even?
            [ e ]
            [ o ]
            branch
        ]
        unless
      ] ;

      12 c
    `)
    ).toEqual(`[ 12 6 3 10 5 16 8 4 2 1 ]`);
  });
});

describe('rewrite', () => {
  test('rewrite words', async () => {
    expect(await ƒ(`[ x y y z ] { x: 1, y: 2 } rewrite`)).toEqual(
      `[ [ 1 2 2 z ] ]`
    );
  });

  test('rewrite qualified words', async () => {
    expect(await ƒ(`[ .x .y .y .z ] { x: 1, y: 2 } rewrite`)).toEqual(
      `[ [ 1 2 2 .z ] ]`
    );
  });

  test('should not rewrite keys', async () => {
    expect(await ƒ(`[ x y y: z ] { x: 1, y: 2 } rewrite`)).toEqual(
      `[ [ 1 2 y: z ] ]`
    );
  });
});

describe('binding', () => {
  test('defined words are bound', async () => {
    expect(await ƒ(`slip: [ 'junk' ] ; [ dip ] inline`)).toEqual(
      `[ [ swap q< eval q> ] ]`
    );
  });

  test('internal words are bound', async () => {
    expect(await ƒ(`eval: [ 'junk' ] ; [ dip ] inline`)).toEqual(
      `[ [ swap q< eval q> ] ]`
    );
  });
});

describe('invalid words', () => {
  test('invalid keys', async () => {
    await expect(ƒ(`'x:y' [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`'x y' [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`'x[y' [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`'x_%y' [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`'x,y' [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`'x"y' [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`"x\ty" [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`"123" [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
    await expect(ƒ(`"1.23" [456] def`)).rejects.toThrow(
      'Invalid definition key'
    );
  });
});
