import { ƒ, τ, Word, Sentence } from './helpers/setup';

describe('define', () => {
  test('should def and use actions', async () => {
    expect(await ƒ('x: [ 1 2 + ] def 3 x x')).toEqual(`[ 3 3 3 ]`);
    expect(await ƒ('x: [ dup 2 + ] def 3 x x')).toEqual(`[ 3 5 7 ]`);
  });

  test('should def and use nested actions', async () => {
    expect(await ƒ('test_def: { x: [ 1 2 + ] } def test_def.x')).toEqual(`[ 3 ]`);
  });

  test('should def and use nested actions in a in', async () => {
    expect(await ƒ('test_def: { x: [ 1 2 + ] } def [ test_def.x ] in')).toEqual(`[ [ 3 ] ]`);
  });

  test('cannot overwrite defined words', async () => {
    await expect(ƒ('x: [123] def x: [456] def')).rejects.toThrow(
      `Error calling 'def': cannot overwrite definition "x"`
    );
  });

  test('should shadow definitions in an in', async () => {
    expect(await ƒ('"a" [ "outsite-a" ] def a [ "a" [ "in-fork-a" ] def a ] in a')).toEqual(
      `[ 'outsite-a' [ 'in-fork-a' ] 'outsite-a' ]`
    );
    expect(await ƒ('"a" [ "outsite-a" ] def a [ "b" [ "in-in-b" ] def a b ] in a b: defined?')).toEqual(
      `[ 'outsite-a' [ 'outsite-a' 'in-in-b' ] 'outsite-a' false ]`
    );
  });

  test('should isloate definitions in a in', async () => {
    expect(await ƒ('[ "a" ["in-fork-a"] def a ] in')).toStrictEqual(`[ [ 'in-fork-a' ] ]`);
    await expect(ƒ('[ "a" ["in-fork-a"] def a ] in a')).rejects.toThrow('"a" is not defined');
  });
});

test('create keys', async () => {
  expect(await ƒ('"eval" :')).toEqual(`[ eval: ]`); // ??
});

describe('defer', () => {
  test('can defer, but not use', async () => {
    expect(ƒ('x: defer x')).rejects.toThrow('"x" is not defined');
  });

  test('can defer, then define and use', async () => {
    expect(await ƒ('x: defer x: [ 1 ] def x')).toEqual(`[ 1 ]`);
  });

  test('can defer multiple times before defining', async () => {
    expect(await ƒ('x: defer x: defer x: [ 1 ] def x')).toEqual(`[ 1 ]`);
  });

  test(`can't defer after defining`, async () => {
    expect(ƒ('x: [ 1 ] def x: defer')).rejects.toThrow(`Error calling 'defer': cannot overwrite definition "x"`);
  });

  test('mutually recursive', async () => {
    expect(
      await ƒ(`
      c: defer

      e: [ dup 2 / c ] def
      o: [ dup 3 * 1 + c ] def

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

describe('invalid words', () => {
  test('invalid keys', async () => {
    await expect(ƒ(`'x:y' [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x:y"`);
    await expect(ƒ(`'x y' [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x y"`);
    await expect(ƒ(`'x[y' [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x[y"`);
    await expect(ƒ(`'x_%y' [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x_%y"`);
    await expect(ƒ(`'x,y' [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x,y"`);
    await expect(ƒ(`'x"y' [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x"y"`);
    await expect(ƒ(`"x\ty" [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "x\ty"`);
    await expect(ƒ(`"123" [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "123"`);
    await expect(ƒ(`"1.23" [456] def`)).rejects.toThrow(`Error calling 'def': invalid key "1.23"`);
  });
});

test('see', async () => {
  expect(await ƒ(`'slip' see`)).toEqual(`[ '[ << eval ]' ]`);
  expect(await ƒ(`'swap' see`)).toEqual(`[ '[function swap]' ]`);
  expect(ƒ(`'_top' see`)).rejects.toThrow(`Error calling 'see': invalid key "_top"`); // ???
});

describe('bind', () => {
  test(`binding`, async () => {
    expect(await ƒ(`[ 5 ! ] bind`)).toEqual(`[ [ 5 ! ] ]`);
  });

  test(`binding doesn't change ln`, async () => {
    expect(await ƒ(`[ 5 ! ] bind ln`)).toEqual(`[ 2 ]`);
  });

  // todo: undefined words
});

describe('inline', () => {
  test('should inline internal actions', async () => {
    expect(await ƒ(`[ eval ] inline`)).toEqual(`[ [ eval ] ]`);
  });

  test('should inline defined actions', async () => {
    expect(await ƒ(`[ slip ] inline`)).toEqual(`[ [ << eval ] ]`);
  });

  test('should not inline local qualified words', async () => {
    expect(await ƒ(`[ .slip ] inline`)).toEqual(`[ [ .slip ] ]`);
  });

  test('should not inline keys', async () => {
    expect(await ƒ(`[ eval: ] inline`)).toEqual(`[ [ eval: ] ]`);
    expect(await ƒ(`[ slip: ] inline`)).toEqual(`[ [ slip: ] ]`);
  });

  test('should inline deeply', async () => {
    expect(await ƒ(`[ sip ] inline`)).toEqual(`[ [ q< dup q> swap << eval ] ]`);
  });

  // todo: undefined words
});
