# F♭ guide

## Guiding principles

- interactive first
  - minimal hidden state
  - easy to type and read
  - reads left to right, top to bottom
  - whitespace not significant syntax
  - no lambdas/parameters
  - interactive development
- flat concatenative language
  - name code not values
  - multiple return values
  - concatenation is composition/pipeline style
  - no unnecessary parentheses.
- no surprises (Principle of "least astonishment")
  - immutable data
  - decimal and complex numbers
  - percent values
  - both double and single quotes
  - no order of operations (RPN)
- state is serializable
- Use common work-flow in Forth-like languages: <sup>[Read-Eval-Print-λove]</sup>
  - Write some code to perform a task
  - Identify some fragment that might be generally useful
  - Extract it and give it a name
  - Replace the relevant bits with the new word
  - Factor when:
    - complexity tickles your conscious limits
    - you’re able to elucidate a name for something
    - at the point when you feel that you need a comment
    - the moment you start repeating yourself
    - when you need to hide detail
    - when your command set (API) grows too large
    - Don’t factor idioms

## Word definition requirements

- Cannot start or end with a colon (`:`) (special meaning)
- Cannot start with an `@` or `.`
- Cannot contain white space (space, new lines, tabs, etc) or comma (`,`).
- Cannot contain brackets ( `(){}[]` ).
- Cannot contain quotes ( '"\` )
- Cannot be numeric (starting with a numeric value is ok)
- Cannot begin with a hash (`#`)
- Cannot be a reserved word (`null`, `true` or `false`)

## Word definition convention

- should be lower kebab-case
- inquisitive words (typically boolean returning functions) should end with question mark (`?`)
  - `string?`, `zero?`, `prime?`
- procedures should be verbs
  - `dup`, `dip`, `drop`
- types should be nouns
  - `string`, `number`, `complex`

## Numeric values

  - Unsigned and negative integer or float (`3`, `-3`, `3.1415`, `-3.1415`)
  - Zero and negative zero (`0`, `-0`)
  - Exponential (power-of-ten exponent) notation (`8e5`, `123e-2`)
  - Unsigned and negative binary, hexadecimal or octal integer (`0xFF`, `-0xFF`)
  - Unsigned and negative binary, hexadecimal or octal float (`0x1.1`, `-0x1.1`)
  - Unsigned and negative binary, hexadecimal or octal in power-of-two exponent notation (`0x1.1p5`, `-0x1.1p-2`, `0x1.921FB4D12D84Ap+1`)
  - Percentages (`10%`, `0x1.921FB4D12D84A%`)

  [Read-Eval-Print-λove]: https://leanpub.com/readevalprintlove003/read
