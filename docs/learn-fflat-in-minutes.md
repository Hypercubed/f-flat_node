# Introduction

This is a small F♭ tutorial that should take no more than a few minutes to complete.

The code snippets below are meant to demonstrate input and outputs in the fflat repl.  Lines starting with `F♭>` are user input followed by output.  The output by the repl is the current stack.  The stack is always displayed in brackets.  For example:

```
F♭> 3 2 + 'Hello World' println   // user input
Hello World                       // text printed to the console

[ 5 ]                             // the current stack
```

For most examples it is assumed that the current stack is clear. The stack can be cleared between examples by typing `clr`.  `.clear` will reset the entire environment.

## Syntax

```
// Single-line comments start with two slashes.
/* Multiline comments start with slash-star,
   and end with star-slash */
```

White space does not matter, comma (,) is whitespace.  Brackets are always considered to have whitespace padding.

```
F♭> ['these','are',['equivalent']]
[ [ 'these' 'are' [ 'equivalent' ] ] ]

F♭> [
  'these'
  'are'
  [ 'equivalent' ]
]
[ [ 'these' 'are' [ 'equivalent' ] ] ]
```

## Types

### Strings

Strings are created with `'`, `"` or `\``.

```
F♭> 'abc'
[ 'abc' ]

F♭> 'λx:(μα.α→α).xx'            // can include Unicode characters
[ 'λx:(μα.α→α).xx' ]

F♭> "f-flat === f\u266D"        // double quotes to use encoded strings
[ 'f-flat === f♭' ]

F♭> `1 + 2 is $(1 2 +)`         // backticks for string templates
[ '1 + 2 is 3' ]
```

### Numbers

```
F♭> 15              // a number
[ 15 ]

F♭> 20%             // a percentage
[ 0.2 ]

F♭> 1_000_000       // Use underscores to improve readability!
[ 1000000 ]
```

```
// Binary, octal, and hex values ca be entered using 0b, 0o, and 0x notation.

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
F♭> thing         // a word that is executed immediatly unless enclosed in an lazy quote
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
F♭> (1 2) :complex  // Complex numbers
[ 1+2i ]

F♭> "1/1/1990" :date // dates
[ Mon Jan 01 1990 00:00:00 GMT-0700 (Mountain Standard Time) ]

F♭> '/a/' :regexp    // regular expressions
[ /a/ ]
```

## Quotations

### Active Quotation

Words within an active quotation are evaluated

```
F♭> (1 2 3)
[ [ 1 2 3 ] ]

F♭> (1 2 +)
[ [ 3 ] ]

F♭> ('Hello' 'World' +)
[ [ 'HelloWorld' ] ]
```

### Lazy Arrays

Words within an active quotation are not evaluated (by default)

```
F♭> [1 2 3]
[ [ 1 2 3 ] ]

F♭> [1 2 +]
[ [ 1 2 + ] ]

F♭> ['Hello' 'World' +]
[ [ 'Hello' 'World' + ] ]

F♭> ['Hello' ' World' :+]   // unless explitly marked as an immediate word
[ [ 'Hello World' ] ]
```

### Construction and concatenation

```
F♭> 1 unit
[ [ 1 ] ]

F♭> [ 2 ] 3 <<        // push
[ [ 2 3 ] ]

F♭> 5 [ 8 ] >>        // unshift
[ [ 5 8 ] ]

F♭> [ 13 ] [ 21 ] +   // concat
[ [ 13 21 ] ]
```

### Accessing values

```
F♭> [ 5 8 13 ] ln               // `ln` is returns the length.
[ 3 ]

F♭> 'Hello' ln                  // Same for strings, which often work just like an array of characters
[ 5 ]

F♭> [ 'first' 'second' ] 1 @    // Arrays are zero-based, negitive for access from the back
[ 'first' ]

F♭> 'This is a string' 0 @      // Again same for strings
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
```

### Quote Operations

```
F♭> [ 2 ] 3 *                           // repeat items in an quotes with *
[ [ 2 2 2 ] ]

F♭> [ 1 2 3 ] [ 2 * ] *                 // Intersparse quotes using *
[ [ 1 2 * 2 2 * 3 2 * ] ]

F♭> 2 [ 3 + ] eval                      // Quotes can be evaluated
[ 5 ]

F♭> 1 2 3 [ 3 + ] dip                   // `dip` is useful for evaluating against the second item on the stack
[ 1 5 3 ]

F♭> [ 3 2 * ] in                        // `in` runs the quote in a child scope (more on scoping below), pushing the child stack to the parent
[ [ 6 ] ]

F♭> [ 1 2 * suspend 3 4 *  ] in         // children can be suspended
[ [ 2 3 4 * ] ]

F♭> in                                  //  and continued
[ [ 2 12 ] ]

F♭> [ 1 2 3 ] [ 2 * ] map               // `map` is defined as `[ * in ]`
[ [ 2 4 6 ] ]

F♭> [ 1 2 3 ] [ 2 < ] filter
[ [ 1 ] ]
```

## Maps

Maps are sets of key value pairs

```
F♭> { x: 1 y: 2 }
[ { x: 1, y: 2 } ]

F♭> { x: 1 y: 2 } x: @               // use `@` to get a value by key or string
[ 1 ]

F♭> { x: 1 y: { z: 3 } } 'y.z' @     // access deeply
[ 3 ]

F♭> { x: 1 } { y: 2 } +              // joined
[ { x: 1, y: 2 } ]

F♭> { x: 1 y: 2 } ln                 // number of key/values
[ 2 ]
```

## Words

### Printing

```
F♭> 'world' println    // prints with a new line
world
[ ]
```

### Files

```
F♭> cwd
[ 'file:///Users/jmh/workspace/projects/f-flat_node/src/ff-lib/' ]

F♭> '../../readme.md' read       // text files from cwd can be loaded as strings
[
  '# F♭\n\nF♭ (pronounced F-flat) is a toy language.\n\nF♭ is a dynamically typed array-oriented concatenative language like Forth, Joy, and [others](http://www.concate ... \n\nMIT\n'
]

F♭> 'lambdas.ff' read eval       // ff files can be evaluated
[ ]
```

### Stack Operations

```
F♭> 3 dup             // `dup`licate the bottom (last) item
[ 3 3 ]

F♭> 2 5 swap          // `swap` the bottom with the second element
[ 5 2 ]

F♭> 4 0 drop          // `drop` the bottom item
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

F♭> 13 2 %                        // modulo
[ 1 ]

F♭> 99 ~                          // unary negation
[ -99 ]

F♭> -10 abs                       // absolute value
[ 10 ] 

F♭> 2 3 ^                         // power function
[ 8 ]

F♭> 1000 !                        // factorial (see math.ff)
[ 4.0238726007709377384e+2567 ]

F♭> 1.5 !                         // factorial approximation (using `gamma` see math.ff)
[ 1.3293403881791368454 ]

F♭> 10 ln                         // natural log
[ 2.302585092994046 ]

F♭> 5 exp                         // exponential
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


F♭> 1 1 =              // Equality defined as `=`
[ true ]

F♭> 2 1 !=             //  and inequality defined `!=`
[ true ]

F♭> #x #x =            // symbols are never equal
[ false ]

F♭> #x dup =           // unless they are the same
[ true ]

F♭> [ 1 2 ] [ 1 2 ] =  // arrays are checked by element
[ true ]

F♭> [1 [2]] [1 [3]] =  // and deeply
[ false ]

F♭> 4 5 !=
[ true ]

F♭> 'a' 'b' <          // Compare with `<`, `>`, `>=`, `<=`
[ true ]

F♭> 'a' 'b' >=
[ false ]
```

### Types and Conversion

```
F♭> 255 type
[ 'number' ]

F♭> 255 string?       // same as `type 'string' =`
[ false ]

F♭> 255 string
[ '255' ]

F♭> '300' number
[ 300 ]

F♭> 'hello' boolean
[ true ]

F♭> null boolean      // `null` is neither
[ null ]
```

### Pattern Matching and Regular Expressions

```
F♭> 5 3 =~                          // pattern match
[ false ]

F♭> 5 5 =~                          // for literals same as `=`
[ true ]

F♭> 'Hello' '/^Hell/':regexp =~     // strings can match regex
[ true ]

F♭> 'This can be anything' _ =~     // underscore (`_`) matches anything
[ true ]

F♭> [ 1 2 3 ] [ 1 _ 3 ] =~          // arrays matched per element
[ true ]
```

### Control Flow

```
//  test  if true         if false             
//  ----  --------------  ---------------
F♭> true  'this is true'  'this is false'  choose
[ 'this is true' ]

F♭> null 'A' 'B' choose                                  // null is neither true nor false
[ null ]

F♭> 2 [ 'Two is true' ] [ 'Two is not false' ] branch    // `branch` is defined as `choose eval`
[ 'Two is true' ]

F♭> 5 [ 'Five is true' ] when                            // `when` is defined as `[] branch`
[ 'Five is true' ]

F♭> 0 [ 'Zero is false' ] when
[ ]

F♭> false [ 'false is false' ] unless
[ 'false is false' ]
```

### Switch

Switch calls the quotation in the first quotation whose evaluation yields a truthy value.

```
F♭> 0
  [
    [ dup 0 = [drop 'no apples']]
    [ dup 1 = [drop 'one apple']]
    [ dup 1 > [string ' apples' +]]
  ] switch
[ 'no apples' ]
```

### Switch-Case

```
F♭> 1 2 [ 2 = ] case   // case evaluates a quote without consuming a value
[ 1 2 true ]

F♭> 1
  [
    [ [ 0 = ] case [drop 'no apples']]
    [ [ 1 = ] case [drop 'one apple']]
    [ [ 1 > ] case [string ' apples' +]]
  ] switch
[ 'one apple' ]
```

### Switch-P-Case
```
F♭> 1 2 3 p-case       // p-case pattern matches without consuming a value
[ 1 2 false ]

F♭> 3
  [
    [ 0 p-case [drop 'no apples']]
    [ 1 p-case [drop 'one apple']]
    [ _ p-case [string ' apples' +]]
  ] switch
[ '3 apples' ]

F♭> 3                 // switch can combine different versions
  [
    [ 0 p-case      [ ]]
    [ 1 p-case      [ ]]
    [ [ 15 > ] case [ binet ]]
    [ true          [[1 - fib]  [2 - fib] bi + ]]
  ] switch
[ 2 ]
```

## Definitions

### Defining new words

```
//  name    body      define
//  ------- --------- -
F♭> square: [ dup * ] ;
[ ]

// apply functions by invoking the word
F♭> 5 square
[ 25 ]

F♭> x: 1 ;                // creates a function that always returns 1 (shortcut for `x: [ 1 ] ;`)
[ ]

// We can print what a word does.
F♭> 'square' show
[ dup * ]
[ ]

F♭> y: [ x 2 + ] ;        // Referenced words must be defined at defintion time
Thrown:
FFlatError: ';' Word is not defined: "x"

F♭> x: defer y: defer     // mutually recursive words must be defered
[ ]

F♭> x: [ 1 > [ dup --] [ y ] branch ] ;
[ ]

F♭> y: [ 0 = [ dup ++ ] [ x ] branch ] ;
[ ]
```

### Lambdas (see lambdas.ff)

```
F♭> 1 2 3 [ a: b: c: ] =>                      // `=>` consumes one value per key, returning a map
[ { a: 1, b: 2, c: 3 } ]

F♭> [ 1 a b * ] { a: 2 b: 3 } rewrite          // `rewrite` will use a map to rewrite a quote
[ [ 1 2 3 * ] ]

F♭> quad: [
  [ a: b: c: ] => [
    .b -1 * .b .b * 4 .a .c * * - sqrt -+      // words prefixed with a period (.) are not bound at definition time
    [ 2 .a * / ] bi@
  ]
] lambda ;                                     // quotes can be converted to lambdas, which use a map to rewrite the quote before evaluation
[ ]

F♭> 1 -3 0 quad
[ 0 3 ]
```

### Scoping

```
F♭> hello: [ 'Hello ' swap + ] ;                     // words are defined in a local context
[ ]

F♭> 'World' hello
[ 'Hello World' ]

F♭> hello: [ 'Hi ' swap + ] ;                        // words cannot be redefined in the current context
Thrown:
FFlatError: ';' cannot overwrite definition: 'hello'

F♭> [ hello: [ 'Hi ' swap + ] ; 'World' hello ] in   // `in` runs the quote in a child scope, pushing the child stack to the parent
[ 'Hello World' [ 'Hi World' ] ]

F♭> 'World' hello                                    // without inpacting definitions in parent
[ 'Hello World' [ 'Hi World' ] 'Hello World' ]
```

### Vocabulary

```
F♭> vocab                                         // `vocab` will return a dictionary of words defined in the current context (key-symbol pairs)
[ { hello: #hello } ]

F♭> [ hi: [ 'Hi ' swap + ] ; vocab ] in           // in a child
[ [ { hi: #hi } ] ]

F♭> 'example.ff' import                           // `import` will read a file, evaluate the string, and return the vocabulary (see `loader.ff`)
[ { hi: #hi } ]

F♭> 'example.ff' import use                       // `use` will bring the definitions into the current scope (not current context)
[ ]

F♭> 'World' hi
[ 'Hi World' ]

F♭> example: 'example.ff' import ;                // The `vocab` dictionary can also be defined as a word
[ ]

F♭> 5 example.hi                                  // for access by name
[ 'Hi World' ]
```

## Concurrency

```
F♭> [ 2 3 * ] spawn                               // `spawn` is like `in` but returns a future
[ [Future:pending [2,3,*]] ]

F♭>                                               // press enter to show the stack
[ [Future:resolved [6]] ]

F♭> eval
[ 6 ]

F♭> [ 2 3 * ] spawn await                         // await will wait for a future to be resolved
[ [ 6 ] ]
```