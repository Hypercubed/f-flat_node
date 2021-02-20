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
        "@@Word": "[",
      },
      Object {
        "@@Word": "a",
      },
      Object {
        "@@Key": "b",
      },
      Object {
        "@@Word": ":c",
      },
      Object {
        "@@Word": ".d",
      },
      Object {
        "@@Word": "]",
      },
    ]
  `);
});

test('tricky words', () => {
  expect(lexer('[a]')).toMatchInlineSnapshot(`
    Array [
      Object {
        "@@Word": "[",
      },
      Object {
        "@@Word": "a",
      },
      Object {
        "@@Word": "]",
      },
    ]
  `);

  expect(lexer('a:b')).toMatchInlineSnapshot(`
Array [
  Object {
    "@@Key": "a",
  },
  Object {
    "@@Word": "b",
  },
]
`);

  // TODO: fix this
  expect(lexer('"a":true')).toMatchInlineSnapshot(`
    Array [
      "a",
      Object {
        "@@Word": ":true",
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
