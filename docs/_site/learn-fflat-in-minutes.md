# Introduction

This is a small F♭ tutorial that should take no more than a few minutes to complete.

The code snippets below are meant to demonstrate input and outputs in the fflat repl.  Lines starting with `F♭>` are user input followed by output.  The output by the repl is the currtent stack.  The stack is always displayed in brackets.  For example:

```
F♭> 3 2 + 'Hello World' println   // user input
Hello World                       // text printed to the console

[ 5 ]                             // the current stack
```

For most examples below it is assumed that the current stack is clear. The stack can be cleared between examples by typing `clr`.  `.clear` will reset the entire environment.

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

Strings are created with `'`, `"` or `\``.

```
F♭> 'abc'
[ 'abc' ]

F♭> 'λx:(μα.α→α).xx'            // can include Unicode characters
[ 'λx:(μα.α→α).xx' ]

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

### Active arrays

```
F♭> (1 2 3)
[ [ 1 2 3 ] ]

F♭> (1 2 +)
[ [ 3 ] ]

F♭> ('Hello' 'World' +)
[ [ 'HelloWorld' ] ]
```

### Lazy Arrays

```
F♭> [1 2 3]
[ [ 1 2 3 ] ]

F♭> [1 2 +]
[ [ 1 2 + ] ]

F♭> ['Hello' 'World' +]
[ [ 'Hello' 'World' + ] ]

F♭> ['Hello' ' World' :+]
[ [ 'Hello World' ] ]
```

### Construction and concatination

```
F♭> 1 unit
[ [ 1 ] ]

F♭> [ 2 ] 3 <<
[ [ 2 3 ] ]

F♭> 5 [ 8 ] >>
[ [ 5 8 ] ]

F♭> [ 13 ] [ 21 ] + 
[ [ 13 21 ] ]
```

### Operations

```
F♭> [ 5 8 13 ] ln             // `ln` is returns the length.
[ 3 ]

F♭> 'Hello' ln                // Same for strings, which often work just like an array of characters
[ 5 ]

F♭> [ 'first' 'second' ] 1 @  // Arrays are zero-based, negitive for access from the back
[ 'first' ]

F♭> 'This is a string' 0 @
[ 'T' ]

F♭> [ 'first' 'second' ] -2 @  // can acess from the end with negitive values
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

F♭> [ 5 8 13 ] 8 indexof
[ 1 ]

F♭> 'hello' 'l' indexof
[ 2 ]

// Arrays can be evaluated
F♭> 2 [ 3 + ] eval
[ 5 ]
```

### Operations over arrays

```
F♭> [ 2 ] 3 *               // repeat items in an array with *
[ [ 2 2 2 ] ]

F♭> [ 1 2 3 ] [ 2 * ] *     // Intersparse arrays using *
[ [ 1 2 * 2 2 * 3 2 * ] ]

F♭> [ 1 2 3 ] [ 2 * ] map
[ [ 2 4 6 ] ]

F♭> [ 1 2 3 ] [ 2 < ] filter
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

F♭> { x: 1 y: 2 } ln      // number of values
[ 2 ]
```

## Words

### Printing

```
F♭> 'hello' print    // prints without a new line
hello
[ ]

F♭> 'world' println    // prints with a new line
'world'

[ ]
```

### Stack Operations

```
F♭> 3 dup             // duplicate the top item
[ 3 3 ]

F♭> 2 5 swap          // swap the top with the second element
[ 5 2 ]

F♭> 4 0 drop          // remove the top item
[ 4 ]

F♭> 1 2 clr           // wipe out the entire stack
[ ]

F♭> 1 2 3 4 over      // duplicate the second item to the top
[ 1 2 3 4 3 ]

F♭> 1 2 3 4 2 pick    // duplicate the third item to the top
[ 1 2 3 4 2 3 ]
```

### Math is reverse polish

```
F♭> 6 7 *
[ 42 ]

F♭> 1360 23 -
[ 1337 ]

F♭> 12 4 /
[ 3 ]

F♭> 13 2 %
[ 1 ]

F♭> 99 ~
[ -99 ]

F♭> -10 abs                  // absolute value
[ 10 ]

F♭> 2 3 ^                    // power function
[ 8 ]

F♭> 1000 !                   // factorial
[ 4.0238726007709377384e+2567 ]

F♭> 1.5 !                    // factorial approximation
[ 1.3293403881791368454 ]

F♭> 10 ln                    // natural log
[ 2.302585092994046 ]

F♭> 5 exp                   // exponential
[ 148.41315910257660342 ]

F♭> 0.7 sin
[ 0.64421768723769105367 ]

F♭> (1 2) :complex (6 -4) :complex *
[ 14+8i ]
```

### Boolean operations

```
F♭> true false +  // OR
[ true ]

F♭> true false *  // AND
[ false ]

F♭> true ~        // NOT
[ false ]

// Null is considered unknown for boolean logic (Three-valued logic)
F♭> false null *   // OR
[ false ]

F♭> true null *    // AND
[ null ]

F♭> false null *   // AND
[ false ]

F♭> null ~         // NOT
[ null ]
```

### Bitwise operations

```
F♭> 0xFF 0xF0 bit-and
[ 240 ]

F♭> 0x0F 0xF0 bit-or
[ 255 ]

F♭> 0xF0 bit-not
[ -241 ]
```

### Comparisons

```
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

F♭> #x #x =    // symbols are never equal
[ false ]

F♭> #x dup =   // unless they are the same
[ true ]

F♭> [ 1 2 ] [ 1 2 ] =  // arrays are checked by element
[ true ]

F♭> [1 [2]] [1 [3]] =  // and deeply
[ false ]

F♭> 4 5 !=
[true]

// Compare with <, >, >=, <=
F♭> 'a' 'b' <
[ true ]

F♭> 'a' 'b' >=
[ false ]
```

### Types and Conversion

```
F♭> 255 type
[ 'number' ]

F♭> 255 string?
[ false ]

F♭> 255 string
[ '255' ]

F♭> '300' number
[ 300 ]

F♭> 'hello' boolean   // truthy?
[ true ]
```

## Word Defintions

### Defining new words

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
F♭> x: defer x: [ 1 > [ dup --] [ x ] branch ] def
[ ]

// for use outside current namespace, words should be inlined
F♭> x: [ a b c ] inline def
[ ]

// `;` will defer and inline
F♭> x: [ a b c ] ;  // same as x: defer x: [ a b c ] inline def
[ ]
```

## Pattern Matching and Regular Expressions

```
F♭> 5 3 =~                      // pattern match
[ false ]

F♭> 5 5 =~                      // for literals save as =
[ true ]

F♭> 'Hello' '/^Hell/':regexp =~     // strinsg can match regex
[ true ]

F♭> 'This can be anything' _ =~     // underscore matches anything
[ true ]

F♭> [ 1 2 3 ] [ 1 _ 3 ] =~          // arrays matched per element
[ true ]
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

### Switch

```
F♭> 0
  [
    [ dup 0 = [drop 'no apples']]
    [ dup 1 = [drop 'one apple']]
    [ true    [string ' apples' +]]
  ] switch
[ 'no apples' ]
```

### Switch-Case

```
F♭> 1 2 [ 2 = ] case   // case evaluates without consuming a value
[ 1 2 true ]

F♭> 1
  [
    [ [0 = ] case [drop 'no apples']]
    [ [1 = ] case [drop 'one apple']]
    [ true        [string ' apples' +]]
  ] switch
[ 'one apple' ]
```

### Switch-P-Case
```
F♭> 1 2 3 p-case       // p-case pattern matches without consuming a value
[ 1 2 false ]

F♭> 3
  [
    [ 0 p-case     [drop 'no apples']]
    [ 1 p-case     [drop 'one apple']]
    [ _ p-case     [string ' apples' +]]
  ] switch
[ '3 apples' ]

fib: [  // swicth can combine different case versions
  [
    [ 0 p-case      [ ]]
    [ 1 p-case      [ ]]
    [ [ 15 > ] case [ binet ]]
    [ true          [[1 - fib]  [2 - fib] bi + ]]
  ] switch
] ;
```

## Lambdas

## Modules and namespaces

## Scoping and Child Environments

## Concurrency