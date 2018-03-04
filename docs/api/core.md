# Internal Core Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L34">[src]</a></div>

## `choose`
conditional (ternary) operator

( {boolean} [A] [B] -> {A|B} )

```
f♭> true 1 2 choose
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L47">[src]</a></div>

## `@` (at)

returns the item at the specified index/key

( {seq} {index} -> {item} )

```
> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L64">[src]</a></div>

- string char at, zero based index

```
f♭> 'abc' 2 @
[ 'c' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L74">[src]</a></div>

- array at, zero based index

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L91">[src]</a></div>

- map get by key

```
f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
[ 'Manfred' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L109">[src]</a></div>

## `q<`
moves the top of the stack to the tail of the queue

( {any} -> )

```
f♭> 1 2 4 q< 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L128">[src]</a></div>

## `q>`
moves the tail of the queue to the top of the stack

( -> {any} )

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L143">[src]</a></div>

## `q@`
moves a copy of the tail of the queue onto the stack

( -> {any} )

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L158">[src]</a></div>

## `stack`
replaces the stack with a quote containing the current stack

( ... -> [ ... ] )

```
f♭> 1 2 3 stack
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L173">[src]</a></div>

## `unstack`
push items in a quote to the stack without evaluation

( [A B C] -> A B C )

```
f♭> [ 1 2 * ] unstack
[ 1 2 * ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L190">[src]</a></div>

## `<->` (s-q swap)
swaps the last item on the stack and the first item on the queue
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L200">[src]</a></div>

## `<-` (stack)
replaces the stack with the item found at the top of the stack

( [A] -> A )

```
f♭> 1 2 [ 3 4 ] <-
[ 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L217">[src]</a></div>

## `->` (queue)
replaces the queue with the item found at the top of the stack

( [A] -> )

```
f♭> 1 2 [ 3 4 ] -> 5 6
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L233">[src]</a></div>

## `clr`

clears the stack

( ... -> )

```
f♭> 1 2 3 clr
[  ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L250">[src]</a></div>

## `depth`
pushes the size of the current stack (number of items on the stack)

( -> {number} )

```
f♭> 0 1 2 depth
[ 0 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L265">[src]</a></div>

## `eval`
evaluate quote or string

( [A] -> a )

```
f♭> [ 1 2 * ] eval
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L280">[src]</a></div>

## `fork`

evalues the quote in a child environment

( [A] -> [a] )

```
f♭> [ 1 2 * ] fork
[ [ 2 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L301">[src]</a></div>

## `send`
pushes one element from stack to parent.

( A -> )

```
f♭> [ 1 2 3 send 4 ] fork
[ 3 [ 1 2 4 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L316">[src]</a></div>

## `drop`
drops the item on the bottom of the stack

( x -> )

```
> 1 2 3 drop
[ 1 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L333">[src]</a></div>

## `swap`
swaps the items on the bottom of the stack

( x y -- y x )

```
> 1 2 3 swap
[ 1 3 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L346">[src]</a></div>

## `dup`
duplicates the item on the bottom of the stack

( x -- x x )

```
> 1 2 3 dup
[ 1 2 3 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L359">[src]</a></div>

## `indexof`
returns the position of the first occurrence of a specified value in a sequence

( seq item -> number )

```
f♭> [ '1' '2' '3' '4' ] '2' indexof
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L372">[src]</a></div>

## `zip`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] zip
[ 1 4 2 5 3 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L386">[src]</a></div>

## `zipinto`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
[ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L405">[src]</a></div>

## `(` (immediate quote)
pushes a quotation maker onto the stack

( -> ( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L426">[src]</a></div>

## `)` (immediate dequote)
collects stack items upto the last quote marker

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L434">[src]</a></div>

## `[` (lazy quote)
pushes a quotation maker onto the stack, increments depth

( -> ( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L444">[src]</a></div>

## `]` (lazy dequote)
decrements depth, collects stack items upto the last quote marker

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L455">[src]</a></div>

## `{` (immediate object quote)
pushes a quotation maker onto the stack

( -> #( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L466">[src]</a></div>

## `}` (immediate object dequote)
collects stack items upto the last quote marker, converts to an object

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L474">[src]</a></div>

## `template`
converts a string to a string template

( {string} -> {quote} )

```
f♭> 'hello $(world)' template
[ [ '' 'hello ' + '(world)' eval string + '' + ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L492">[src]</a></div>

## `sleep`
wait x milliseconds

( x -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L510">[src]</a></div>

## `undo`
restores the stack to state before previous eval
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L525">[src]</a></div>

## `<q`
push the top of the queue to the stack

( -> {any} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L535">[src]</a></div>

## `match`

Matches a string a regex and returns an array containing the results of that search.

{string} [regexp} -> {boolean}

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L547">[src]</a></div>

## `=~`

Returns a Boolean value that indicates whether or not the lhs matches the rhs.

{any} {any} -> {boolean}

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L560">[src]</a></div>

## `_`

Match symbol

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L568">[src]</a></div>

## `infinity`
pushes the value Infinity

( -> Infinity )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L576">[src]</a></div>
