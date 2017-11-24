# Introduction

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

## The stack and the REPL

TBD

## Structure

### Comments

Comments are C-style.

```
// Single-line comment.

/*
  Multi-line
  comment.
*/
```

### White space

In F♭, spaces, tabs, newlines and commas (`,`) are all considered whitespace, and have no impact on code execuation except as a seperator between elements.

## Values

### Numbers

Numeric literals in F♭ are arbitary precision decimals.  The values may be input as integer or floats in binary, hexadecimal or octal form.

- Unsigned and negative integer or float (`3`, `-3`, `3.1415`, `-3.1415`, `.14`, `-.14`)
- Zero and negative zero (`0`, `-0`)
- Exponential (power-of-ten exponent) notation (`8e5`, `-123e-2`)
- Unsigned and negative binary, hexadecimal or octal integer (`0xFF`, `-0xFF`)
- Unsigned and negative binary, hexadecimal or octal float (`0x1.1`, `-0x1.1`)
- Unsigned and negative binary, hexadecimal or octal in power-of-two exponent notation (`0x1.1p5`, `-0x1.1p-2`, `0x1.921FB4D12D84Ap+1`)
- Percentages (`10%`, `0x1.921FB4D12D84A%`)

### Complex numbers

F♭ supports complex values. Complex values are not input directly but created through expressions:

```
f♭> 3 i 2 * +
[ 3+2i ]

f♭> -1 sqrt
[ 3+2i 0+1i ]
```
### Number-Like

F♭ supports infinity and nan literals.  In addtion to -infinity as the result of a calulation.

```
f♭> infinity
[ Infinity ]

f♭> -1 *
[ -Infinity ]

f♭> nan
[ -Infinity NaN ]
```

### Booleans and null

F♭ supports `true`, `false` and `null` values.

### Strings

String literals in F♭ use single, double, and backtick quotes where double quoted strings supports unicode escapes and backticks are string templates.

```
f♭> 'Hello world!'
[ 'Hello world!' ]

f♭> "\u0048\u0065\u006C\u006C\u006F\u0020\u0077\u006F\u0072\u006C\u0064"
[ 'Hello world!' 'Hello world' ]

f♭> clr `3 === $(1 2 +)`
[ '3 === 3' ]
```

### Dates

Dates are input as strings and convered to date values uning teh `date` word.

```
f♭> '1/1/1990'
[ '1/1/1990' ]

f♭> date
[ Mon Jan 01 1990 00:00:00 GMT-0700 (MST) ]
```

### Words

A word (aka symbols or keys) can be added to the stack without execution by either postfixing the word with a colon (`:`) or converting a string to a word using a colon (`:`).

```
f♭> x:
[ x ]

f♭> 'y' :
[ x y ]
```

## Type casting

TBD

## Data Structures

### Lists

Lists / Arrays are surrounded by square (`[]`) or round (`()`) brackets with optinally comma-separated elements.  The difference being that expressions within round brackets are executed immediately.

```
f♭> ( 1 2 )
[ [ 1 2 ] ]

f♭> ( 3, 4 )
[ [ 1 2 ] [ 3 4 ] ]

f♭> ( 5 6 * )
[ [ 1 2 ] [ 3 4 ] [ 30 ] ]

f♭> [ 1 2 * ]
[ [ 1 2 ] [ 3 4 ] [ 30 ] [ 1 2 * ] ]
```

### Maps

Maps (aka objects or records) are surrounded by curly brackets (`{}`) with optinally comma-separated elements.  The key in a key value pair is actullay a word as described above.  Expressions within curly brackets are executed immediately.

```
f♭> { x: 1 y: 2 }
[ { x: 1 y: 2 } ]

f♭> { z: 3, u: 4 5 * }
[ { x: 1 y: 2 } { z: 3 u: 20 } ]

f♭> { 'v' : 3 , 'w' : 4 }
[ { x: 1 y: 2 } { z: 3 u: 20 } { v: 3 w: 4 } ]
```

## Expressions / Evaluation

Expressions use postfix operators, unlike many other languages.  Expressions are evaluated immediatly unless they follow an unpair in square brackets (`[`) or the word is has teh colon suffix..  In general all words should follow the Object(s)-Verb pattern.

```
f♭> "Hello World!" println
Hello World!
[  ]

f♭> 1 2 +
[ 3 ]

f♭> [ 1 2 3 ^ min ]
[ 3 [ 1 2 3 ^ min ] ]

f♭> eval
[ 3 1 ]

f♭> (-1 -2 -3) sqrt: map
[ 3
  1
  [ 0+1i 0+1.4142135623730950488i 0+1.7320508075688772936i ] ]
```

## Values, Immutability, and Persistence

TBD

## Control Structures, Conditionals and Blocks

The core control mechinism in f♭ is the conditional (ternary) operator `choose` word.

```
f♭> true 1 2 choose
[ 1 ]

f♭> false [ 3 ] [ 4 ] choose
[ 1 [ 4 ] ]
``` 

## Looping and Recursion

TBD

## Dictionary / Locals

Unlike many other languages, f♭ does not have a concept of variables nor lambdas.  Like most stack based languages the primary location for value storage is the stack.  f♭ has a write once dictionary for storage of word definitions.  Values within a dictionary cannot be overwitten or deleted. However, using child stacks (discussed later) dictionary words can be shadowd. (similar to JS scoping rules).

Values can be stored and recalled from the stack using the `sto` and `rcl` verbs.

```
f♭> 123 x: sto
[  ]

f♭> x: rcl
[ 123 ]

f♭> x: 456 sto
Error: Cannot overrite definitions in strict mode: x
[  ]

f♭> x: rcl
[ 123 123 ]

f♭> clr [ 456 x: sto x: rcl ] fork x: rcl
[ [ 456 ] 123 ]
```

### Word requirements

- Cannot start or end with a colon (`:`) (special meaning)
- Cannot start with an `@` or `.`
- Cannot contain white space (space, new lines, tabs, or comma `,`).
- Cannot contain brackets ( `(){}[]` ).
- Cannot contain quotes ( '"\` )
- Cannot be numeric (starting with a numeric value is ok)
- Cannot begin with a hash (`#`)
- Cannot be a reserved word (`null`, `true` or `false`)

## Function Definitions / Expanding Functions

In the above examples we stored and recalled a literal value using `sto` and `rcl`.  In this case you may also recall the value by simply invoking the word.

```
f♭> 123 x: sto
[  ]

f♭> x
[ 123 ]
```

The difference being that if the stored value is an action it will be executed instead of recalled.  The colon word (`:`) is used to convert a list into an action.

```
f♭> [ 1 2 + ] : y: sto
[  ]

f♭> y: rcl
[ [ 1 2 + ] ]

f♭> clr y
[ 3 ]
```

This pattern is so common that a shorthand method is usually defined to the semi-colon (`;`) word:

```
f♭> z: [ 3 4 + ] ;
[  ]

f♭> z: rcl
[ [ 3 4 + ] ]

f♭> clr z
[ 7 ]
```

### Definition convention

- Object(s)-Verb pattern
- should be lower kebab-case
- inquisitive words (typically boolean returning functions) should end with question mark (`?`)
  - `string?`, `zero?`, `prime?`
- procedures should be verbs
  - `dup`, `dip`, `drop`
- types should be nouns
  - `string`, `number`, `complex`

## Bread and Butter Functions

For core words see [api.md](./api.md).

## Recipies and Examples

See [examples.md](./examples.md).



