# Introduction

This is a small F♭ tutorial that should take no more than a few minutes to complete.

The cvode snippits below are meant to demostrate input and outputs in the fflat repl.  Lines starting with `F♭>` are user input followed by output.  The last item output by the repl is teh currtent stack.  The stack is always displayed in brackets.  For example:

```
F♭> 3 2 + 'Hello World' println   // user input
Hello World                       // text printed to the console

[ 5 ]                             // the current stack
```

For most examples below it is assumed that the current stack is clear.. The stack can be cleared between examples by typing `clr`.  `.clear` will reset the entire environment.

## Syntax

```
// Single-line comments start with two slashes.
/* Multiline comments start with slash-star,
   and end with star-slash */
```

White space does not matter, comma is whitespace.  Brackets are always considered to have whitespace padding.

```
F♭> ['these','are','equivalent']
[ [ 'these' 'are' 'equivalent' ] ]

F♭> [
  'these'
  'are'
  'equivalent'
]
[ [ 'these' 'are' 'equivalent' ] ]
```

## Types

### Strings

Strings are created with ', " or `.

```
F♭> 'abc'
[ 'abc' ]

F♭> "f-flat === f\u{266D}"      // double quotes to use encoded strings
[ 'f-flat === f♭' ]

F♭> `1 + 2 is $(1 2 +)`         // backticks for string templates
[ '1 + 2 is 3' ]
```

### Numbers

```
F♭> 15            // a number
[ 15 ]

F♭> 20%           // a percentage
[ 0.2 ]

F♭> 1_000_000     // Use underscores to improve readability!
[ 1000000 ]


F♭> (1 2) :complex  // Complex numbers
[ 1+2i ]

// Binary, octal, and hex values ca be entered using 0b, 0o, and 0b notation.

F♭> 0b111             // binary
[ 7 ]

F♭> 0o111             // octal
[ 73 ]

F♭> 0x111             // hexadecimal
[ 273 ]
```

### Booleans

```
F♭> true
[ true ]

F♭> false
[ false ]

F♭> null      // used to indicate a deliberate non-value (neither true nor false)
[ null ]
```

### Words

```
F♭> thing         // a word that is executed immediatly unless enclosed in an lazy array
[ ??? ]

F♭> thing:        // this is a key, it is not execuated unless explicitly evaluated
[ thing: ]

F♭> :thing        // a word that is executed immediatly even if it is enclosed in an lazy array
[ :thing ]

F♭> #thing        // a unique symbol
[ #thing ]
```

### Non-Literal Types

```
F♭> "1/1/1990" :date // dates
[ Mon Jan 01 1990 00:00:00 GMT-0700 (Mountain Standard Time) ]

F♭> '/a/' :regexp    // regular expressions
[ /a/ ]
```

## Arrays

Active arrays

```
F♭> (1 2 3)
[ [ 1 2 3 ] ]

F♭> (1 2 +)
[ [ 3  ] ]

F♭> ('Hello' 'World' +)
[ [ 'HelloWorld' ] ]
```

Lazy Arrays

```
F♭> [1 2 3]
[ [ 1 2 3 ] ]

F♭> [1 2 +]
[ [ 1 2 + ] ]

F♭> ['Hello' 'World' +]
[ [ "Hello" "World" + ] ]
```

Construction and concatination

```
F♭> 1 unit
[ [ 1 ] ]

F♭> [ 2 ] 3 <<
[ [ 2 3 ] ]

F♭> 5 [ 8 ] >>
[ [ 5 8 ] ]

F♭> [ 13 ] [ 21 ] + 
[ [ 13 21 ] ]

// `ln` is returns the length.
F♭> [ 5 8 13 ] ln
[ 3 ]

// Same for strings, which often work just like an array of characters
F♭> 'Hello' ln
[ 5 ]

// Arrays are zero-based, negitive for access from the back
F♭> [ 'first' 'second' ] 1 @
[ 'first' ]

F♭> 'This is a string' 0 @
[ 'T' ]

F♭> [ 'first' 'second' ] -2 @
[ 'first' ]

F♭> 'This is a string' -1 @
[ 'g' ]

// Some defined access words
F♭> [ 'first' 'second' ] first
[ 'first' ]

F♭> 'This is a string' last
[ 'g' ]

F♭> [ 1 2 3 4 ] rest
[ [ 2 3 4 ] ]

// Arrays can be evaluated
F♭> 2 [ 3 + ] eval
[ 5 ]

// Mapping and filtering
F♭> [ 2 ] 3 *               // repeat items in an array with *
[ [ 2 2 2 ] ]

F♭> [ 1 2 3 ] [ 2 * ] *     // Intersparse arrays using *
[ [ 1 2 * 2 2 * 3 2 * ] ]

F♭> [ 1 2 3 ] [ 2 * ] map
[ [ 2 4 6 ] ]

F♭> [ 1 2 3 ] [ < 2 ] map
[ [ 1 ] ]
```

## Maps

```
F♭> { x: 1 y: 2 }
[ { x: 1, y: 2 } ]

F♭> { x: 1 y: 2 } 'x' @   // accessed by key
[ 1 ]

F♭> { x: 1 } { y: 2 } +   // joined
[ { x: 1, y: 2 } ]

F♭> { x: 1 y: 2 } ln     // number of values
[ 2 ]
```

## Words

Printing

```
F♭> 'hello' print    // prints without a new line
hello
[ ]

F♭> 'world' println    // prints with a new line
'world'

[ ]
```

Math is straightforward (reverse polish).

```
F♭> 6 7 *
[ 42 ]

F♭> 1360 23 -
[ 1337 ]

F♭> 12 12 /
[ 1 ]

F♭> 13 2 %
[ 1 ]

F♭> 99 ~
[ -99 ]

F♭> 2 3 ^
[ 8 ]

F♭> 10 ln               // natural log
[ 2.302585092994046 ]

F♭> (1 2) :complex (6 -4) :complex *
[ 14+8i ]

// Boolean operations
F♭> true false +  // OR
[ true ]

F♭> true false *  // AND
[ false ]

F♭> true ~        // NOT
[ false ]

// Null is considered unknown for boolean logic
F♭> false null *  // OR
[ false ]

F♭> true null *   // AND
[ null ]

F♭> null ~        // NOT
[ null ]

// Comparisons
F♭> 'a' 'b' <=>   // Three-way comparison returns -1, 0, 1
[ 1 ]

F♭> 2 1 <=>
[ -1 ]

F♭> 2 1 <=>
[ -1 ]

F♭> 'x' 'x' <=>
[ 0 ]

// Equality defined as = and inequality defined !=
F♭> 1 1 =
[ true ]

F♭> 2 1 =
[ false ]

F♭> #x #x =   // symbols are never equal
[ false ]

F♭> #x dup =   // unless they are the same
[ true ]

F♭> 4 5 !=
[true]

// Compare with < and >
F♭> "a" "b" <
[ true ]

F♭> "a" "b" >=
[ false ]

// A number of words are provided to manipulate the stack, collectively known as shuffle words.
F♭> 3 dup -           // duplicate the top item
[ 0 ]

F♭> 2 5 swap /        // swap the top with the second element
[ 2.5 ]

F♭> 4 0 drop 2 /      // remove the top item
[ 2 ]

F♭> 1 2 clr           // wipe out the entire stack
[ ]

F♭> 1 2 3 4 over      // duplicate the second item to the top
[ 1 2 3 4 3 ]

F♭> 1 2 3 4 2 pick    // duplicate the third item to the top
[ 1 2 3 4 2 3 ]

```

## Word Defintions

Defining new words

```
//  name    body
//  ------- ---------
F♭> square: [ dup * ] def
[ ]

// apply functions by invoking the word
F♭> 5 square
[ 25 ]

F♭> x: 1 def                // creates a function that always returns 1
[ ]

// We can show what a word does.
F♭> 'square' show
[ dup * ]

[ ]

// recursive words must be defered
F♭> x: defer
[ ]

F♭> x: [ 1 > [ dup --] [ x ] branch ] def
[ ]

// for use outside current namespace, words should be inlined
F♭> x: [ a b c ] inline def
[ ]

// `;` will defer and inline
F♭> x: [ a b c ] ;  // same as x: defer x: [ a b c ] inline def
[ ]
```

## Control Flow

```
//  test  if true         if false             
//  ----  --------------  ---------------
F♭> true  'this is true'  'this is false'  choose
[ 'this is true' ]

F♭> 5 [ 'Five is true' ] when
[ 'Five is true' ]

F♭> 0 [ 'Zero is flase' ] when
[ ]

F♭> false [ 'false is false' ] unless
[ 'false is false' ]

F♭> 2 [ 'Two is true' ] [ 'Two is false' ] branch
[ 'Two is true' ]
```

## Pattern Matching and Regular Expressions

```
F♭> 5 3 =~                      // pattern match
[ false ]

F♭> 5 5 =~                      // for literals save as =
[ true ]

F♭> 'Hello' '/^Hell/':regexp =~
[ true ]

F♭> 'This can be anything' _ =~     // underscore matches anything
[ true ]
```

## Lambdas

## Modules and namespaces

## Scoping and Child Environments

## Concurrency