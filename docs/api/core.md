# Internal Core Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L40">[src]</a></div>

## `q<`
moves the top of the stack to the tail of the queue

( {any} -> )

```
f♭> 1 2 4 q< 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L53">[src]</a></div>

## `q>`
moves the tail of the queue to the top of the stack

( -> {any} )

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L68">[src]</a></div>

## `q@`
moves a copy of the tail of the queue onto the stack

( -> {any} )

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L83">[src]</a></div>

## `stack`
replaces the stack with a quote containing the current stack

( ... -> [ ... ] )

```
f♭> 1 2 3 stack
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L98">[src]</a></div>

## `unstack`
push items in a quote to the stack without evaluation

( [A B C] -> A B C)

```
f♭> [ 1 2 * ] unstack
[ 1 2 * ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L115">[src]</a></div>

## `<->` (s-q swap)
swaps the last item on the stack and the first item on the queue
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L124">[src]</a></div>

## `<-` (stack)
replaces the stack with the item found at the top of the stack

( [A] -> A )

```
f♭> 1 2 [ 3 4 ] <-
[ 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L141">[src]</a></div>

## `->` (queue)
replaces the queue with the item found at the top of the stack

( [A] -> )

```
f♭> 1 2 [ 3 4 ] -> 5 6
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L157">[src]</a></div>

## `depth`
pushes the size of the current stack (number of items on the stack)

( -> {number} )

```
f♭> 0 1 2 depth
[ 0 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L173">[src]</a></div>

## `nop`
no op

( -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L183">[src]</a></div>

## `eval`
evaluate quote or string

( [A] -> a )

```
f♭> [ 1 2 * ] eval
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L196">[src]</a></div>

## `fork`

evalues the quote in a child environment

( [A] -> [a] )

```
f♭> [ 1 2 * ] fork
[ [ 2 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L217">[src]</a></div>

## `send`
pushes one element from stack to parent.

( A -> )

```
f♭> [ 1 2 3 send 4 ] fork
[ 3 [ 1 2 4 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L232">[src]</a></div>

## `drop`
drops the item on the bottom of the stack

( x -> )

```
> 1 2 3 drop
[ 1 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L249">[src]</a></div>

## `swap`
swaps the items on the bottom of the stack

( x y -- y x )

```
> 1 2 3 swap
[ 1 3 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L262">[src]</a></div>

## `dup`
duplicates the item on the bottom of the stack

( x -- x x )

```
> 1 2 3 dup
[ 1 2 3 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L275">[src]</a></div>

## `length`
Outputs the length of the Array, string, or object.

( {seq} -> {number} )

```
> [ 1 2 3 ] length
3
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L288">[src]</a></div>

## `slice`
a shallow copy of a portion of an array or string

( seq from to -> seq )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L301">[src]</a></div>

## `splitat`
splits a array or string

( seq at -> seq )

```
f♭> [ 1 2 3 4 ] 2 4 slice
[ [ 3 4 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L314">[src]</a></div>

## `indexof`
returns the position of the first occurrence of a specified value in a sequence

( seq item -> number )

```
f♭> [ '1' '2' '3' '4' ] '2' indexof
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L327">[src]</a></div>

## `zip`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] zip
[ 1 4 2 5 3 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L341">[src]</a></div>

## `zipinto`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
[ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L360">[src]</a></div>

## `(` (immediate quote)
pushes a quotation maker onto the stack

( -> #( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L377">[src]</a></div>

## `)` (immediate dequote)
collects stack items upto the last quote marker

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L386">[src]</a></div>

## `[` (lazy quote)
pushes a quotation maker onto the stack, increments depth

( -> #( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L396">[src]</a></div>

## `]` (lazy dequote)
decrements depth, collects stack items upto the last quote marker

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L407">[src]</a></div>

## `{` (immediate object quote)
pushes a quotation maker onto the stack

( -> #( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L418">[src]</a></div>

## `}` (immediate object dequote)
collects stack items upto the last quote marker, converts to an object

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L426">[src]</a></div>

## `template`
converts a string to a string template

( {string} -> {quote} )

```
f♭> 'hello $(world)' template
[ [ '' 'hello ' + '(world)' eval string + '' + ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L442">[src]</a></div>

## `sleep`
wait x milliseconds

( x -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L450">[src]</a></div>

## `get-log-level`
gets the current logging level

( -> {string} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L467">[src]</a></div>

## `set-log-level`
sets the current logging level

( {string} -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L475">[src]</a></div>
