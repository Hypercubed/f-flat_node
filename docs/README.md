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

## Type casting

TBD

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
