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

- arithmetic addition

```
f♭> 0.1 0.2 +
[ 0.3 ]
```

- object assign/assoc

```
f♭> { first: 'Manfred' } { last: 'von Thun' } +
[ { first: 'Manfred' last: 'von Thun' } ]
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


- boolean xor

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

- Array join

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

- left shift

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

## `~` (not)

- boolean (indeterminate) not

```
f♭> true ~
[ false ]
```

```
f♭> NaN ~
[ NaN ]
```

## `<->` (stack)
swaps the last item on the stack and teh first item onteh queue

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
