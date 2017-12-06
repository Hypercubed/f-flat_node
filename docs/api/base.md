# Internal Base Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L11">[src]</a></div>

## `+` (add)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L18">[src]</a></div>

- list concatenation/function composition

```
f♭> [ 1 2 ] [ 3 ] +
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L28">[src]</a></div>

- boolean or

```
f♭> true false +
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L42">[src]</a></div>

- arithmetic addition

```
f♭> 0.1 0.2 +
[ 0.3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L53">[src]</a></div>

- object assign/assoc

```
f♭> { first: 'Manfred' } { last: 'von Thun' } +
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L64">[src]</a></div>

- date addition

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Mon Mar 17 2003 00:00:01 GMT-0700 (MST) ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L75">[src]</a></div>

- string concatenation

```
f♭> "abc" "xyz" +
[ "abcxyz" ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L88">[src]</a></div>

## `-` (minus)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L96">[src]</a></div>

- boolean xor

```
f♭> true true -
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L116">[src]</a></div>

- arithmetic subtraction

```
f♭> 2 1 -
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L126">[src]</a></div>

- date subtraction

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Sun Mar 16 2003 23:59:59 GMT-0700 (MST) ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L141">[src]</a></div>

## `*` (times)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L154">[src]</a></div>

- intersparse

```
f♭> [ 'a' ] [ 'b' ] *
[ [ 'a' 'b' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L164">[src]</a></div>

- Array join

```
f♭> [ 'a' 'b' ] ';' *
[ 'a;b' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L176">[src]</a></div>

- boolean and

```
f♭> true true *
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L186">[src]</a></div>

- repeat sequence

```
f♭> 'abc' 3 *
[ 'abcabcabc' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L197">[src]</a></div>

- arithmetic multiplication

```
f♭> 2 3 *
[ 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L208">[src]</a></div>

## `/` (forward slash)

( x y -> z)

```
f♭> 6 2 /
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L222">[src]</a></div>

- boolean nand

```
f♭> true true /
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L232">[src]</a></div>

- string split

```
f♭> 'a;b;c' ';' /
[ [ 'a' 'b' 'c' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L243">[src]</a></div>

- string/array slice

```
f♭> 'abcdef' 3 /
[ 'ab' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L253">[src]</a></div>

- arithmetic division

```
f♭> 6 2 /
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L275">[src]</a></div>

## `>>`
right shift

```
( x y -> z) 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L291">[src]</a></div>

- unshift/cons

```
f♭> 1 [ 2 3 ] >>
[ 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L302">[src]</a></div>

- object merge

```
f♭> { first: 'Manfred' } { last: 'von Thun' } >>
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L315">[src]</a></div>

- Sign-propagating right shift

```
f♭> 64 2 >>
[ 16 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L325">[src]</a></div>

## `<<`
Left shift

( x y -> z)

```
f♭> [ 1 2 ] 3 <<
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L339">[src]</a></div>

- push/snoc

```
f♭> [ 1 2 ] 3 <<
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L350">[src]</a></div>

- object merge

```
f♭> { first: 'Manfred' } { last: 'von Thun' } <<
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L361">[src]</a></div>

- left shift

```
f♭> 64 2 <<
[ 256 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L371">[src]</a></div>

## `choose`
conditional (ternary) operator

( {boolean} [A] [B] -> {A|B} )

```
f♭> true 1 2 choose
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L385">[src]</a></div>

## `@` (at)
returns the item at the specified index/key

( {seq} {index} -> {item} )

```
> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L400">[src]</a></div>

- string char at, zero based index

```
f♭> 'abc' 2 @
[ 'c' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L410">[src]</a></div>

- array at, zero based index

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L427">[src]</a></div>

- object get by key

```
f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
[ 'Manfred' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L445">[src]</a></div>

## `~` (not)
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L465">[src]</a></div>

- boolean (indeterminate) not

```
f♭> true ~
[ false ]
```

```
f♭> NaN ~
[ NaN ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L480">[src]</a></div>

## `<->` (stack)
swaps the last item on the stack and teh first item onteh queue
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L487">[src]</a></div>

## `<-` (stack)
replaces the stack with the item found at the top of the stack

( [A] -> A )

```
f♭> 1 2 [ 3 4 ] <-
[ 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L504">[src]</a></div>

## `->` (queue)
replaces the queue with the item found at the top of the stack

( [A] -> )

```
f♭> 1 2 [ 3 4 ] -> 5 6
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L520">[src]</a></div>

## `undo`
restores the stack to state before previous eval
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L529">[src]</a></div>

## `auto-undo`
set flag to auto-undo on error

( {boolean} -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L539">[src]</a></div>

## `i`
push the imaginary number 0+1i

( -> 0+1i )

 ```
f♭> i
[ 0+1i ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L554">[src]</a></div>

## `infinity`
pushes the value Infinity

( -> Infinity )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L562">[src]</a></div>

## `=` equal
Pushes true if x is equal to y.

( x y -> z )

```
f♭> 1 2 =
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L576">[src]</a></div>

## `cmp`
Pushes a -1, 0, or a +1 when x is 'less than', 'equal to', or 'greater than' y.

( x y -> z )

```
f♭> 1 2 cmp
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L589">[src]</a></div>

### `memoize`

memoize a defined word

( {string|atom} -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L631">[src]</a></div>

## `clr`

clears the stack

( ... -> )

```
f♭> 1 2 3 clr
[  ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L656">[src]</a></div>
