# Internal Core Words

## `q<`
moves the top of the stack to the tail of the queue

( {any} -> )

```
f♭> 1 2 4 q< 3
[ 1 2 3 4 ]
```

## `q>`
moves the tail of the queue to the top of the stack

( -> {any} )

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```

## `stack`
replaces the stack with a quote containing the current stack

( ... -> [ ... ] )

```
f♭> 1 2 3 stack
[ [ 1 2 3 ] ]
```

## `d++`
increments the depth counter.  If depth > 0, words are not push to the stack as literals

```
f♭> d++ drop :d--
[ drop ]
```
## `d--`
decrements the d counter
## `quote`
pushes a quotation maker onto the stack

( -> #( )
## `dequote`
collects stack items upto the last quote marker

( #( ... -> [ ... ] )
## `depth`
pushes the size of the current stack

( -> {number} )

```
f♭> 0 1 2 depth
[ 0 1 2 3 ]
```

## `nop`
no op

( -> )

## `eval`
evaluate quote or string

( [A] -> a )

```
f♭> [ 1 2 * ] eval
[ 2 ]
```

## `drop`
drops the item on the bottom of the stack

( x -> )

```
> 1 2 3 drop
[ 1 2 ]
```

## `swap`
swaps the items on the bottom of the stack

( x y -- y x )

```
> 1 2 3 swap
[ 1 3 2 ]
```

## `dup`
duplicates the item on the bottom of the stack

( x -- x x )

```
> 1 2 3 dup
[ 1 2 3 3 ]
```

## `unstack`
push items in a quote to the stack without evaluation

( [A B C] -> A B C)

```
f♭> [ 1 2 * ] unstack
[ 1 2 * ]
```

## `length`
Outputs the length of the Array, string, or object.

( {seq} -> {number} )

```
> [ 1 2 3 ] length
3
```

## `slice`
a shallow copy of a portion of an array or string

( seq from to -> seq )

## `splitat`
splits a array or string

( seq at -> seq )

```
f♭> [ 1 2 3 4 ] 2 4 slice
[ [ 3 4 ] ]
```

## `indexof`
returns the position of the first occurrence of a specified value in a sequence

( seq item -> number )

```
f♭> [ '1' '2' '3' '4' ] '2' indexof
[ 1 ]
```

## `zip`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] zip
[ 1 4 2 5 3 6 ]
```

## `zipinto`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
[ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
```

## `(` (immediate quote)
pushes a quotation maker onto the stack

( -> #( )

## `)` (immediate dequote)
collects stack items upto the last quote marker

( #( ... -> [ ... ] )

## `[` (lazy quote)
pushes a quotation maker onto the stack, increments depth

( -> #( )

## `]` (lazy dequote)
decrements depth, collects stack items upto the last quote marker

( #( ... -> [ ... ] )

## `{` (immediate object quote)
pushes a quotation maker onto the stack

( -> #( )

## `}` (immediate object dequote)
collects stack items upto the last quote marker, converts to an object

( #( ... -> [ ... ] )

## `template`
converts a string to a string template

( {string} -> {quote} )

```
f♭> 'hello $(world)' template
[ [ '' 'hello ' + '(world)' eval string + '' + ] ]
```

## `sleep`
wait x milliseconds

( x -> )

## `get-log-level`
gets the current logging level

( -> {string} )

## `set-log-level`
sets the current logging level

( {string} -> )

# Internal Base Words

## `+` (add)

( x y -> z)


- list concatenation/function composition

```
f♭> [ 1 2 ] [ 3 ] +
[ [ 1 2 3 ] ]
```

- boolean or

```
f♭> true false +
[ true ]
```

- object assign/assoc

```
f♭> { first: 'Manfred' } { last: 'von Thun' } +
[ { first: 'Manfred' last: 'von Thun' } ]
```

- arithmetic addition

```
f♭> 0.1 0.2 +
[ 0.3 ]
```

- date addition

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Mon Mar 17 2003 00:00:01 GMT-0700 (MST) ]
```

- string concatenation

```
f♭> "abc" "xyz" +
[ "abcxyz" ]
```

## `-` (minus)

( x y -> z)


- boolean or

```
f♭> true true -
[ false ]
```

- arithmetic subtraction

```
f♭> 2 1 -
[ 1 ]
```

- date subtraction

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Sun Mar 16 2003 23:59:59 GMT-0700 (MST) ]
```

## `*` (times)

( x y -> z)


- intersparse

```
f♭> [ 'a' ] [ 'b' ] *
[ [ 'a' 'b' ] ]
```

- Array and

```
f♭> [ 'a' 'b' ] ';' *
[ 'a;b' ]
```

- boolean and

```
f♭> true true *
[ true ]
```

- repeat sequence

```
f♭> 'abc' 3 *
[ 'abcabcabc' ]
```

- arithmetic multiplication

```
f♭> 2 3 *
[ 6 ]
```

## `/` (forward slash)

( x y -> z)

```
f♭> 6 2 /
[ 3 ]
```

- boolean nand

```
f♭> true true /
[ false ]
```

- string split

```
f♭> 'a;b;c' ';' /
[ [ 'a' 'b' 'c' ] ]
```

- string/array slice

```
f♭> 'abcdef' 3 /
[ 'ab' ]
```

- arithmetic division

```
f♭> 6 2 /
[ 3 ]
```

## `>>`
right shift

```
( x y -> z) 3 ]
```

- unshift/cons

```
f♭> 1 [ 2 3 ] >>
[ 1 2 3 ]
```

- object merge

```
f♭> { first: 'Manfred' } { last: 'von Thun' } >>
[ { first: 'Manfred' last: 'von Thun' } ]
```

- Sign-propagating right shift

```
f♭> 64 2 >>
[ 16 ]
```

## `<<`
Left shift

( x y -> z)

```
f♭> [ 1 2 ] 3 <<
[ [ 1 2 3 ] ]
```

- push/snoc

```
f♭> [ 1 2 ] 3 <<
[ [ 1 2 3 ] ]
```

- object merge

```
f♭> { first: 'Manfred' } { last: 'von Thun' } <<
[ { first: 'Manfred' last: 'von Thun' } ]
```

- Light shift

```
f♭> 64 2 <<
[ 256 ]
```

## `choose`
conditional (ternary) operator

( {boolean} [A] [B] -> {A|B} )

```
f♭> true 1 2 choose
[ 1 ]
```

## `@` (at)
returns the item at the specified index/key

( {seq} {index} -> {item} )

```
> [ 1 2 3 ] 1 @
[ 2 ]
```

- string char at, zero based index

```
f♭> 'abc' 2 @
[ 'c' ]
```

- array at, zero based index

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]
```

- object get by key

```
f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
[ 'Manfred' ]
```

## `<-` (stack)
replaces the stack with the item found at the top of the stack

( [A] -> A )

```
f♭> 1 2 [ 3 4 ] <-
[ 3 4 ]
```

## `->` (queue)
replaces the queue with the item found at the top of the stack

( [A] -> )

```
f♭> 1 2 [ 3 4 ] -> 5 6
[ 1 2 3 4 ]
```

## `undo`
restores the stack to state before previous eval

## `auto-undo`
set flag to auto-undo on error

( {boolean} -> )

## `i`
push the imaginary number 0+1i

( -> 0+1i )

 ```
f♭> i
[ 0+1i ]
```

## `infinity`
pushes the value Infinity

( -> Infinity )

## `=` equal
Pushes true if x is equal to y.

( x y -> z )

```
f♭> 1 2 =
[ false ]
```

## `cmp`
Pushes a -1, 0, or a +1 when x is 'less than', 'equal to', or 'greater than' y.

( x y -> z )

```
f♭> 1 2 cmp
[ -1 ]
```

### `memoize`
memoize a defined word

( {string|atom} -> )

## `clr`
clears the stack

( ... -> )

```
f♭> 1 2 3 clr
[  ]
```

## `\\`
push the top of the queue to the stack

( -> {any} )

# Internal Dictionary Words

## `sto`
stores a value in the dictionary

( [A] {string|atom} -> )

```
f♭> [ dup * ] "sqr" sto
[ ]
```

## `rcl`
recalls a value in the dictionary

( {string|atom} -> [A] )

```
f♭> "sqr" rcl
[ [ dup * ] ]
```

## `delete`
deletes a defined word

( {string|atom} -> )

## `defineParent`
defines a word (or dict) in the parent

( {string|atom} -> )

## `define`
defines a set of words from an object

( {object} -> )

```
f♭> { sqr: "dup *" } define
[ ]
```

## `expand`
expand a quote

( [A] -> [a b c])

```
f♭> [ sqr ] expand
[ [ dup * ] ]
```

## `see`
recalls the definition of a word as a formatted string

( {string|atom} -> {string} )

```
f♭> "sqr" see
[ '[ dup * ]' ]
```

## `words`
returns a list of defined words

( -> {array} )

## `locals`
returns a list of locals words

( -> {array} )

## `dict`
returns the local dictionary

( -> {array} )

# Internal Math Words

## `re`

## `im`

## `div`

- integer division

## `rem`

## `mod`

## `abs`

## `cos`

## `sin`

## `tan`

## `acos`

## `asin`

## `atan`

## `atan2`

## `round`

## `floor`

## `ceil`

## `sqrt`

## `max`

## `min`

## `exp`

## `gamma`

## `nemes`

## `spouge`

## `erf`

## `ln`

## `^` (pow)

## `rand`

## `get-precision`

# Internal Node Words

## `os`

## `cwd`

## `println`

## `print`

## `?`

## `bye`

## `rand-u32`

## `env`

## `dirname`

## `path-join`

## `resolve`

# fs.existsSync

## `read`

## `sesssave`

# Internal Object Words

## `object`

## `object?`

## `contains?`

## `keys`

## `vals`

## `assign`

# Internal Type Words

## `type`

## `number`

## `number?`

## `complex?`

## `string`

## `valueof`

## `itoa`

## `atoi`

## `atob`
ecodes a string of data which has been encoded using base-64 encoding

## `btoa`
creates a base-64 encoded ASCII string from a String

## `boolean`

## `:` (action)

## `array`

## `integer`

## `nan`

## `of`

## `empty`

## `is?`

## `nothing?`

## `date`

## `now`

## `date-expand`

# Internal Experimental Words

## `clock`

## `stringify`

## `parse-json`

## `regexp`
convert string to RegExp

## `match`

## `test?`

## `replace`

## `||>` (apply)

## `fork`
evalues the quote in a child environment

( [A] -> [a] )

```
f♭> [ 1 2 * ] fork
[ [ 2 ] ]
```

## `spawn`
evalues the quote in a child environment, returns a future

( [A] -> {future} )

## `await`
evalues the quote in a child environment, waits for result

( [A] -> [a] )

## `send`
pushes one element from stack to parent.

( A -> )

```
f♭> [ 1 2 3 send 4 ] fork
[ 3 [ 1 2 4 ] ]
```

## `return`
pushes current stack to parent

( ... -> )

```
f♭> [ 1 2 3 return 4 ] fork
[ 1 2 3 [ 4 ] ]
```

## `suspend`
stops execution, push queue to stack, loses other state

( ... -> )

```
f♭> [ 1 2 * suspend 3 4 *  ] fork
[ [ 2 3 4 * ] ]
```

## `all`
executes each element in a child environment

( [ A B C ]-> [ [a] [b] [c] ])

## `race`
executes each element in a child environment, returns first to finish

( [ A B C ]-> [x])
