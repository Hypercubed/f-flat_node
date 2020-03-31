import { lexer } from '../src/parser/parser';

test('literals', () => {
  expect(lexer('1 true "a" null nan')).toMatchInlineSnapshot(`
    Array [
      Object {
        "$numberDecimal": "1",
      },
      true,
      "a",
      null,
      NaN,
    ]
  `);
});

test('words', () => {
  expect(lexer('[ a b: :c .d ]')).toMatchInlineSnapshot(`
    Array [
      Object {
        "@@Action": "[",
      },
      Object {
        "@@Action": "a",
      },
      Object {
        "@@Action": "b",
      },
      Object {
        "@@Action": ":c",
      },
      Object {
        "@@Action": ".d",
      },
      Object {
        "@@Action": "]",
      },
    ]
`);
});

test('tricky words', () => {
  expect(lexer('[a]')).toMatchInlineSnapshot(`
    Array [
      Object {
        "@@Action": "[",
      },
      Object {
        "@@Action": "a",
      },
      Object {
        "@@Action": "]",
      },
    ]
  `);

  expect(lexer('a:b')).toMatchInlineSnapshot(`
    Array [
      Object {
        "@@Action": "a",
      },
      Object {
        "@@Action": "b",
      },
    ]
  `);

  // TODO: fix this
  expect(lexer('"a":true')).toMatchInlineSnapshot(`
    Array [
      "a",
      Object {
        "@@Action": ":true",
      },
    ]
  `);
});

test('tricky strings', () => {
  expect(lexer(`"123\\"456"`)).toMatchInlineSnapshot(`
    Array [
      "123\\"456",
    ]
  `);
});
