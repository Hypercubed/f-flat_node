# F♭ by example

## Hello World

Our first example is to print a traditional "Hello World" message.  When you firt open f-flat in interactive mode you will see the wolcome message:

```
Welcome to F♭ REPL Interpreter
F♭ Version 0.0.6 (C) 2000-2017 J. Harshbarger

f♭>
```

The `f♭>` is the REPL input prompt.  To print our message type the string and `println`:

```
f♭> 'Hello World' println
Hello World
[  ]
```

The empty brackets after the message indicate that the stack is empty.

To exit the REPL type `.exit` or hit `ctrl-c` twice.

[More information on the F-Flat REPL](https://hypercubed.gitbooks.io/f-flat/content/the-repl.html)

## Comments

F♭ supports both:

* // Line comments which go to the end of the line.
* /_ Block comments which go to the closing delimiter. _/

```
// This is an example of a line comments

/* 
 * This is another type of comment, the block comment.
 */

f♭> 'Hello World' println
```

## Stack manipulation

```
// push items onto the stack
f♭> 3 'Hello World'
[ 3 'Hello World' ]

// duplicate an item
f♭> dup
[ 3 'Hello World' 'Hello World' ]

// remove an item
f♭> drop
[ 3 'Hello World' ]

// swap items
f♭> swap
[ 'Hello World' 3 ]

// undo last user action
f♭> undo
[ 3 'Hello World' ]

// clear the stack
f♭> clr
[ ]

// clear the environment (cannot be undone)
f♭> .clear
Clearing context...

Welcome to F♭ REPL Interpreter
F♭ Version 0.0.6 (C) 2000-2017 J. Harshbarger

f♭>
// now ready for more input
```

## Literals and Operators

    // using postfix notation
    f♭> 6 5 4 * +
    [ 26 ]

    f♭> 6.5 /
    [ 4 ]

    f♭> 10 *
    [ 40 ]

    f♭> 5 /
    [ 8 ]

    f♭> 2 %
    [ 0 ]

    // ln on a number to calculate natural log
    f♭> ln
    [ -Infinity ]

    // println prints a value
    f♭> clr 3 println
    3
    [  ]

    // single quotes for strings
    f♭> 'Hello' println
    Hello
    [  ]

    // double quotes to use encoded strings
    f♭> "f-flat === f\u{266D}" println
    f-flat === f♭
    [  ]

    // Use backticks for string templates
    f♭> `1 + 2 is $(1 2 +)` println
    1 + 2 is 3
    [  ]

    // string concatenation with +
    f♭> 'f' '-flat' + println
    f-flat
    [  ]

    // boolean logic
    f♭> `true AND false is $(true false *)` println
    true AND false is false
    [  ]

    f♭> `true OR false is $(true false +)` println
    true OR false is true
    [  ]

    f♭> `NOT true is $(true ~)` println
    NOT true is false
    [  ]

    // Null is considered unknown for boolean logic
    f♭> `false AND null is $(false null *)` println
    false AND null is false
    [  ]

    f♭> `true AND null is $(true null *)` println
    true AND null is
    [  ]

    // Bitwise operations
    // Binary, octal, and hex values ca be entered using 0b, 0o, and 0b notation.
    f♭> `0011 AND 0101 is $( 0b011 0b101 & bin )` println
    0011 AND 0101 is 0b1
    [  ]

    f♭> `0011 OR 0101 is $( 0b011 0b101 | bin )` println
    0011 OR 0101 is 0b111
    [  ]

    f♭> `0011 XOR 0101 is $( 0b011 0b101 $ )` println
    0011 XOR 0101 is 6
    [  ]

    f♭> `1 << 5 is $( 1 5 << )` println
    1 << 5 is 32
    [  ]

    f♭> `0x80 >> 2 is $( 0x80 2 >> hex )` println
    0x80 >> 2 is 0x20
    [  ]

    // Use underscores to improve readability!
    f♭> `One million is written as $( 1_000_000 )` println
    One million is written as 1000000
    [  ]

Other internal operators can be found in the [API](/docs/api/base.md) section.

## Arrays

Expressions within square brackets are not evaluated.  Expressions within round brackets are.  Commas are whitespace.

```
f♭> [ 5, 4 ]
[ [ 5 4 ] ]

f♭> ( 3 2 * )
[ [ 5 4 ] [ 6 ] ]

f♭> <<
[ [ 5 4 [ 6 ] ] ]

f♭> [ println ] >>
[ [ [ 5 4 3 [ 3 ] ] println ] ]

f♭> 0 @
[ [ 5 4 3 [ 2 ] ] ]
```

## Maps

Objects/Maps are key value pairs.  Keys can be strings or words \(identifies with a colon suffix\).  Again, commas are whitespace.

```
f♭> { 'x' 123, y: 456 }
[ { x: 123 y: 456 } ]

f♭> { "y": 890 }
[ { x: 123 y: 456 } { y: 890 } ]

f♭> <<
[ { y: 890 x: 123 } ]

f♭> x: @
[ 123 ]

f♭> undo
[ { y: 890 x: 123 } ]

f♭> { x: 123 y: 890 }
[ { y: 890 x: 123 } { x: 123 y: 890 } ]

f♭> =
[ true ]
```

Interesting note: [F♭ is a superset of JSON](https://hypercubed.gitbooks.io/f-flat/content/compared-to-json.html)

## Words

Words can be recalled from the dictionary by entering the identifier directly.  If a word is defined as an expression it is executed. If a word contains a colon suffix, the word is pushed to the stack as a literal.  If the colon is a prefix, it is executed immediately, this is useful inside lazy lists.

```
f♭> pi
[ 3.1415926535897932385 ]

f♭> cos
[ -1 ]

f♭> sin:
[ -1 sin ]

f♭> clr [ -1 sin ]
[ [ -1 sin ] ]

f♭> clr [ -1 :sin ]
[ [ -0.84147098480789650665 ] ]
```

## Storing values

```
// Use sto to store a value in the dictionary
f♭> 45 x: sto
[  ]

// use rcl to recall the value
f♭> x
[ 45 ]

// dictionary words cannot be over written
f♭> 54 x: sto
FFlatError: Error: Cannot overwrite definitions in strict mode: x
```

## Slices and Lengths

    // first we store some values for later use... this is discouraged in general.
    f♭> [1, 2, 3, 4, 5] xs: sto
    [  ]

    f♭> 'Hello+World' ss: sto
    [  ]

    // Indexing starts at 0
    f♭> `first element of the array: $( xs 0 @ )` println
    first element of the array: 1
    [  ]

    f♭> `second element of the array: $( xs 1 @ )` println
    second element of the array: 2
    [  ]

    f♭> `first character of the string: $( ss 0 @ )` println
    first character of the string: H
    [  ]

    f♭> `second character of the string: $( ss 1 @ )` println
    second character of the string: e
    [  ]

    // `ln` returns the length/size
    f♭> `array size: $( xs ln )` println
    array size: 5
    [  ]

    f♭> `string size: $( ss ln )` println
    string size: 11
    [  ]

    // `/` splits an array or string
    f♭> `array split at 2:` println xs 2 /
     array split at 2:
    [ [ 1 2 ] [ 3 4 5 ] ]

    f♭> clr `string split at 6:` println ss 6 /
     string split at 6:
    [ 'Hello+' 'World' ]

    f♭> clr ` string split at "+"` println ss '+' /
     string split at "+"
    [ [ 'Hello' 'World' ] ]

    // * joins an array
    f♭> clr [ 'Hello' 'World' ] '::' * println
    Hello::World
    [  ]

## Types

```
f♭> 5 type println
number
[  ]

f♭> 'Hello' type println
string
[  ]

f♭> i type println
complex
[  ]

f♭> [] type println
array
[  ]

f♭> now type println
date
[  ]

f♭> {} type println
object
[  ]
```

## Conversions

```
f♭> 15 string
[ '15' ]

f♭> number
[ 15 ]

// string to regex
f♭> clr '/a/' regexp
[ /a/ ]

// string to complex value
f♭> clr '1+5i' complex
[ 1+5i ]

// string to date
f♭> clr '1/1/1990' date
[ Mon Jan 01 1990 00:00:00 GMT-0700 (Mountain Standard Time) ]
```

Using the conversion words inside lazy lists are lazy.  However, using the colon word prefix the conversion can be executed immediately:

```
f♭> [ '/a/i':regexp '1+5i':complex '1/1/1990':date ]
[ [ /a/i
    1+5i
    Mon Jan 01 1990 00:00:00 GMT-0700 (Mountain Standard Time) ] ]

f♭> ln
[ 3 ]
```

## Expressions

Expression are arrays containing literals and words. They are stored in thedictionary like any other value discussed above \(using `sto`\), however, they must first be converted to an expression using the colon \(`:`\) operator.  The semi-colon operator is a short cut definition for defining expressions.

    // convert to an expression and sto
    f♭> [ dup * ] : sqr: sto
    [  ]

    // same as above (; is defined as [ : swap sto ])
    f♭> cube: [ dup sqr * ] ;
    [  ]

    f♭> `5 is $( 5 )` println
    5 is 5
    [  ]

    f♭> `5 squared is $( 5 sqr )` println
    5 squared is 25
    [  ]

    f♭> `5 cubed is $( 5 cube)` println
    5 cubed is 125
    [  ]

To see the definition of a single word use `see`:

```
f♭> ';' see println
[ : swap sto ]
[  ]

f♭> sqr: see println
[ dup * ]
[  ]
```

Use `words` to see all words currently defined:

```
f♭> words [ println ] each
...etc
sqr
cubed
...etc
[ ]
```

## Mapping and Filters

```
// repeat items in an array with *
f♭> [ 2 ] 2 *
[ [ 2 2 ] ]

// Intersparse arrays using *

f♭> [ 2 * ] *
[ [ 2 2 * 2 2 * ] ]

// which can be evaluated
f♭> eval
[ 4 4 ]

// or use map (note map == * eval)
f♭> [ 2 2 ] [ 2 * ] map
[ [ 4 4 ] ]

// Add items to an array with << (or >> from lhs)
f♭> [ 5 ] <<
[ [ 4 4 [ 5 ] ] ]

f♭> eval: map
[ [ 4 4 5 ] ]

// Array are equal if that are deeply equal
f♭> [ 4 4 5 ] =
[ true ]

f♭> clr [ 1 2 3 4 5 ] [ even? ] filter
[ [ 2 4 ] ]

f♭> clr [ 1 2 3 4 5 ] [ println ] each
1
2
3
4
5
[  ]

// these actions also work with strings
f♭> 'AbCDefg'
[ 'AbCDefg' ]

f♭> [ ucase ] map '' *
[ 'ABCDEFG' ]

f♭> undo
[ 'AbCDefg' ]

f♭> [ dup ucase = ] filter
[ 'ACD' ]
```

## Flow Control

The base operator for flow control is choose... similar to the tertiary operator in other languages.

```
f♭> true 'Value is true' 'Value is false' choose println
Value is true
[  ]

f♭> false [ 'Value is true' println ] [ 'Value is false' println ] branch
Value is false
[  ]
```

## Pattern Matching and Regular Expressions

```
f♭> 5 3 =~
[ false ]

f♭> clr 'Hello' '/^Hell/' regexp =~
[ true ]

f♭> clr 'This can be anything' _ =~
[ true ]

f♭> clr [ 'Hello' 3 4 5 ] [ '/^Hell/':regexp 3 ... ]
[ [ 'Hello' 3 4 5 ] [ /^Hell/ 3 ... ] ]

f♭> =~
[ true ]
```

## Functions

Let's define fizzbuzz

```
/**
 * FizzBuzz using branching
 */
20 integers
[
  dup 15 divisor?
  [ drop 'fizzbuzz' println ]
  [
    dup 3 divisor?
    [ drop 'fizz' println ]
    [ 
      dup 5 divisor?
      [ drop 'buzz' println ]
      [ println ]
      branch
    ]
    branch
  ]
  branch
] each

/**
 * FizzBuzz using switch
 */
20 integers
[
  [
    [ [15 divisor?] check   [drop 'fizzbuzz' println]]
    [ [3 divisor?] check    [drop 'fizz' println]]
    [ [5 divisor?] check    [drop 'buzz' println]]
    [ [true]                [println]]
  ] switch
] each

/**
 * FizzBuzz using pattern matching
 */
20 integers [
  dup [ 5 divisor? ] [ 3 divisor? ] bi pair
  [
    [[true true]   ~case  [ drop drop 'fizzbuzz' println ]]
    [[false true]  ~case  [ drop drop 'fizz' println ]]
    [[true false]  ~case  [ drop drop 'buzz' println ]]
    [[false false] ~case  [ drop println ]]
  ] switch
] each

/**
 * FizzBuzz using lambdas as switch
 */
20 integers [
  [ x: ] => [
    [
      [ .x 15 divisor? ['fizzbuzz' println]]
      [ .x 3 divisor?  ['fizz' println]]
      [ .x 5 divisor?  ['buzz' println]]
      [ true           [.x println]]
    ] switch
  ]
] lambda each
```

## More Stack Combinators

    // `dip` calls a quotation while temporarily hiding the top item on the stack
    f♭> 1 2 4 [ + ] dip
    [ 3 4 ]

    // `keep` calls a quotation with an item on the stack, restoring that item after the quotation returns
    f♭> clr 1 2 4 [ + ] keep
    [ 1 6 4 ]

    // `bi` applies quotation p to x, then applies quotation q to x
    f♭> clr [ 1 2 3 ] [ sum ] [ length ] bi /
    [ 2 ]

    // `bi*` applies quotation p to x, then applies quotation q to y
    f♭> clr [ 1 2 ] [ 3 4 ] [ 0 @ ] [ 1 @ ] bi*
    [ 1 4 ]

    // `bi@` applies the quotation to x, then to y
    f♭> clr "Hello" "All" [ ln ] bi@
    [ 5 3 ]

## Scoping and Child Environments

TBR

## Concurrency

TBR

## Modules

TBR

