# F♭ by example

## Hello World

A traditional Hello World:

```
'Hello World' println
```

## Comments

F♭ supports both :

* // Line comments which go to the end of the line.
* /* Block comments which go to the closing delimiter. */

```
// This is an example of a line comments

/* 
 * This is another type of comment, the block comment.
 */
 
 'Hello World' println
```

## Literals and Operators

```
`1 + 2 is $(1 2 +)` println

// Integer subtraction
`1 - 2 is $(1 2 -)` println

// boolean logic
`true AND false is $(true false *)` println
`true OR false is $(true false +)` println
`NOT true is $(true ~)` println

// Bitwise operations
`0011 AND 0101 is $( 0b011 0b101 & bin )` println
`0011 OR 0101 is $( 0b011 0b101 | bin )` println
`0011 XOR 0101 is $( 0b011 0b101 $ )` println
`1 << 5 is $( 1 5 << )` println
`0x80 >> 2 is $( 0x80 2 >> hex )` println

// Use underscores to improve readability!
`One million is written as $( 1_000_000 )` println
```

## Arrays and slices

```
[1, 2, 3, 4, 5] xs: sto

// Indexing starts at 0
`first element of the array: $( xs 0 @ )` println
`second element of the array: $( xs 1 @ )` println

// `ln` returns the size of the array
`array size: $( xs ln )` println

// / splits an array
`array split at 2:` println
xs 2 /
```

## Conversions

```
// number to string
15 string

// string to number
'15' number

// string to regex
'/a/' regexp

// string to complex value
'1+5i' complex

// string to date
'1/1/1990' date 
```

