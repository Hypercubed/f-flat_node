# Function Definitions / Expanding Functions

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

## Definition convention

- Object(s)-Verb pattern
- Should be lower kebab-case
- Inquisitive words (typically boolean returning functions) should end with question mark (`?`)
  - `string?`, `zero?`, `prime?`
- Procedures should be verbs
  - `dup`, `dip`, `drop`
- Types should be nouns
  - `string`, `number`, `complex`
- By convention words begging with underscore `_` are considered private.
