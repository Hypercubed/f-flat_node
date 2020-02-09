# Internal Core Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L32">[src]</a></div>

## `@` (at)

returns the item at the specified index/key

( {seq} {index} -> {item} )

```
> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L58">[src]</a></div>

- string char at, zero based index

```
f♭> 'abc' 2 @
[ 'c' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L68">[src]</a></div>

- array at, zero based index

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L86">[src]</a></div>

- digit at, zero based index

```
f♭> 3.14159 2 @
[ 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L104">[src]</a></div>

- map get by key

```
f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
[ 'Manfred' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L124">[src]</a></div>

## `choose`

conditional (ternary) operator

( {boolean} [A] [B] -> {A|B} )

```
f♭> true 1 2 choose
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L227">[src]</a></div>

## `q<`

moves the top of the stack to the tail of the queue

( {any} -> )

```
f♭> 1 2 4 q< 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L243">[src]</a></div>

## `q>`

moves the tail of the queue to the top of the stack

( -> {any} )

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L259">[src]</a></div>

## `stack`

replaces the stack with a quote containing the current stack

( ... -> [ ... ] )

```
f♭> 1 2 3 stack
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L275">[src]</a></div>

## `unstack`

push items in a quote to the stack without evaluation

( [A B C] -> A B C )

```
f♭> [ 1 2 * ] unstack
[ 1 2 * ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L293">[src]</a></div>

## `clr`

clears the stack

( ... clr )

```
f♭> 1 2 3 clr
[  ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L307">[src]</a></div>

## `depth`

pushes the size of the current stack (number of items on the stack)

( -> {number} )

```
f♭> 0 1 2 depth
[ 0 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L323">[src]</a></div>

## `eval`

evaluate quote or string

( [A] -> a )

```
f♭> [ 1 2 * ] eval
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L339">[src]</a></div>

## `fork`

evalues the quote in a child environment

( [A] -> [a] )

```
f♭> [ 1 2 * ] fork
[ [ 2 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L353">[src]</a></div>

## `send`

pushes one element from stack to parent.

( A -> )

```
f♭> [ 1 2 3 send 4 ] fork
[ 3 [ 1 2 4 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L369">[src]</a></div>

## `drop`

drops the item on the bottom of the stack

( x -> )

```
> 1 2 3 drop
[ 1 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L387">[src]</a></div>

## `swap`

swaps the items on the bottom of the stack

( x y -- y x )

```
> 1 2 3 swap
[ 1 3 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L403">[src]</a></div>

## `dup`

duplicates the item on the bottom of the stack

( x -- x x )

```
> 1 2 3 dup
[ 1 2 3 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L417">[src]</a></div>

## `indexof`

returns the position of the first occurrence of a specified value in a sequence

( seq item -> number )

```
f♭> [ '1' '2' '3' '4' ] '2' indexof
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L431">[src]</a></div>

## `zip`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] zip
[ 1 4 2 5 3 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L441">[src]</a></div>

## `zipinto`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
[ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L451">[src]</a></div>

## `(` (immediate quote)

pushes a quotation maker onto the stack

( -> ( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L460">[src]</a></div>

## `)` (immediate dequote)

collects stack items upto the last quote marker

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L469">[src]</a></div>

## `[` (lazy quote)
pushes a quotation maker onto the stack, increments depth

( -> ( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L479">[src]</a></div>

## `]` (lazy dequote)

decrements depth, collects stack items upto the last quote marker

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L491">[src]</a></div>

## `{` (immediate object quote)

pushes a quotation maker onto the stack

( -> #( )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L503">[src]</a></div>

## `}` (immediate object dequote)

collects stack items upto the last quote marker, converts to an object

( #( ... -> [ ... ] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L512">[src]</a></div>

## `template`

converts a string to a string template

( {string} -> {quote} )

```
f♭> 'hello $(world)' template
[ [ '' 'hello ' + '(world)' eval string + '' + ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L529">[src]</a></div>

## `sleep`

wait x milliseconds

( x -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L548">[src]</a></div>

## `undo`

restores the stack to state before previous eval
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L564">[src]</a></div>

## `match`

Matches a string a regex and returns an array containing the results of that search.

{string} {regexp | string} -> {boolean}

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L576">[src]</a></div>

## `=~`

Returns a Boolean value that indicates whether or not the lhs matches the rhs.

{any} {any} -> {boolean}

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L586">[src]</a></div>

## `_`

Match symbol

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L594">[src]</a></div>
