import { ƒ, τ, Word, Sentence } from './helpers/setup';

test('should def and use actions', async () => {
  expect(await ƒ('x: [ 1 2 + ] ; 3 x x')).toEqual(`[ 3 3 3 ]`);
});

test('should def and use nested actions', async () => {
  expect(await ƒ('test_def: { x: [ 1 2 + ] } ; test_def.x')).toEqual(`[ 3 ]`);
});

test('should def and use nested actions in a in', async () => {
  expect(await ƒ('test_def: { x: [ 1 2 + ] } ; [ test_def.x ] in')).toEqual(
    `[ [ 3 ] ]`
  );
});

test('cannot overwrite defined words', async () => {
  await expect(ƒ('x: [123] ; x: [456] ;')).rejects.toThrow(
    `';' cannot overwrite definition: "x"`
  );
});

test('should shadow definitions in an in', async () => {
  expect(
    await ƒ('"a" [ "outsite-a" ] ; a [ "a" [ "in-fork-a" ] ; a ] in a')
  ).toEqual(`[ 'outsite-a' [ 'in-fork-a' ] 'outsite-a' ]`);
  expect(
    await ƒ(
      '"a" [ "outsite-a" ] ; a [ "b" [ "in-in-b" ] ; a b ] in a b: defined?'
    )
  ).toEqual(`[ 'outsite-a' [ 'outsite-a' 'in-in-b' ] 'outsite-a' false ]`);
});

test('should isloate definitions in a in', async () => {
  expect(await ƒ('[ "a" ["in-fork-a"] ; a ] in')).toStrictEqual(
    `[ [ 'in-fork-a' ] ]`
  );
  await expect(ƒ('[ "a" ["in-fork-a"] ; a ] in a')).rejects.toThrow(
    'Word is not defined: "a"'
  );
});

test('should execute stored actions', async () => {
  expect(await ƒ('x: [ 1 2 + ] ; x x')).toEqual(`[ 3 3 ]`);
  expect(await ƒ('test: { x: [ 1 2 + ] } ; test.x')).toEqual(`[ 3 ]`);
});

test('create keys', async () => {
  expect(await ƒ('"eval" :')).toEqual(`[ eval: ]`); // ??
});

describe('defer', () => {
  test('can defer, but not use', async () => {
    expect(ƒ('x: defer x')).rejects.toThrow('Word is not defined: "x"');
  });

  test('can defer, then define and use', async () => {
    expect(await ƒ('x: defer x: [ 1 ] ; x')).toEqual(`[ 1 ]`);
  });

  test('can defer multiple times before defining', async () => {
    expect(await ƒ('x: defer x: defer x: [ 1 ] ; x')).toEqual(`[ 1 ]`);
  });

  test(`can't defer after defining`, async () => {
    expect(ƒ('x: [ 1 ] ; x: defer')).rejects.toThrow(
      `'defer' cannot overwrite definition: "x"`
    );
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

describe('undefined words', () => {
  test('defined words are bound', async () => {
    expect(ƒ(`x: [ junk ] ;`)).rejects.toThrow(
      `';' Word is not defined: "junk"`
    );
  });
});

describe('invalid words', () => {
  test('invalid keys', async () => {
    await expect(ƒ(`'x:y' [456] ;`)).rejects.toThrow(`';' invalid key: "x:y"`);
    await expect(ƒ(`'x y' [456] ;`)).rejects.toThrow(`';' invalid key: "x y"`);
    await expect(ƒ(`'x[y' [456] ;`)).rejects.toThrow(`';' invalid key: "x[y"`);
    await expect(ƒ(`'x_%y' [456] ;`)).rejects.toThrow(
      `';' invalid key: "x_%y"`
    );
    await expect(ƒ(`'x,y' [456] ;`)).rejects.toThrow(`';' invalid key: "x,y"`);
    await expect(ƒ(`'x"y' [456] ;`)).rejects.toThrow(`';' invalid key: "x"y"`);
    await expect(ƒ(`"x\ty" [456] ;`)).rejects.toThrow(
      `';' invalid key: "x\ty"`
    );
    await expect(ƒ(`"123" [456] ;`)).rejects.toThrow(`';' invalid key: "123"`);
    await expect(ƒ(`"1.23" [456] ;`)).rejects.toThrow(
      `';' invalid key: "1.23"`
    );
  });
});

test('see', async () => {
  expect(await ƒ(`'slip' see`)).toEqual(`[ '[ << eval ]' ]`);
  expect(await ƒ(`'swap' see`)).toEqual(`[ '[function swap]' ]`);
  // expect(await ƒ(`'math' see`)).toEqual(`[ '[function swap]' ]`);
  expect(ƒ(`'_top' see`)).rejects.toThrow(`'see' invalid key: "_top"`); // ???
});

test(`inlining doesn't change ln`, async () => {
  expect(await ƒ(`x: [ [ 5 ! ] ln ] ; x`)).toEqual(`[ 2 ]`);
  expect(await ƒ(`x: [ [ 5 ! ] [ * ] * ] ; x`)).toEqual(`[ [ 5 * ! * ] ]`);
});
