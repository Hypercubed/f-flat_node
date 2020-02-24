# Internal Core Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L32">[src]</a></div>

## `@` (at)

returns the item at the specified index/key

`seq x -> a`

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]

f♭> [ 1 2 3 ] -1 @
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L80">[src]</a></div>

- string char at, zero based index

```
f♭> 'abc' 2 @
[ 'c' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L90">[src]</a></div>

- array at, zero based index

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L108">[src]</a></div>

- digit at, zero based index

```
f♭> 3.14159 2 @
[ 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L126">[src]</a></div>

- map get by key

```
f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
[ 'Manfred' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L146">[src]</a></div>

## `choose`

conditional (ternary) operator

`bool a b -> c`

```
f♭> true 1 2 choose
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L257">[src]</a></div>

## `q<`

moves the top of the stack to the tail of the queue

`a ->`

```
f♭> 1 2 4 q< 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L271">[src]</a></div>

## `q>`

moves the tail of the queue to the top of the stack

`-> a`

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L287">[src]</a></div>

## `stack`

replaces the stack with a quote containing the current stack

`a* -> [ a* ] )

```
f♭> 1 2 3 stack
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L303">[src]</a></div>

## `unstack`

push items in a quote to the stack without evaluation

`[ A* ] -> A*`

```
f♭> [ 1 2 * ] unstack
[ 1 2 * ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L321">[src]</a></div>

## `clr`

clears the stack

`a* ->`

```
f♭> 1 2 3 clr
[  ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L335">[src]</a></div>

## `depth`

pushes the size of the current stack (number of items on the stack)

`-> x`

```
f♭> 0 1 2 depth
[ 0 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L351">[src]</a></div>

## `eval`

evaluate quote or string

`[A*] -> a*`

```
f♭> [ 1 2 * ] eval
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L367">[src]</a></div>

## `in`

evalues the quote in a child environment

`[A*] -> [a*]`

```
f♭> [ 1 2 * ] in
[ [ 2 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L381">[src]</a></div>

## `in-catch`

Evaluates the quotation in a child environment
calls the second quotation in a child throws an error

`[A*] [B*] -> [ {a*|b*} ]`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L394">[src]</a></div>

## `throw`

Throws an error

`str ->`

```
f♭> 'PC LOAD LETTER' throw
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L414">[src]</a></div>

## `send`

pushes one element from stack to parent.

`a ->`

```
f♭> [ 1 2 3 send 4 ] in
[ 3 [ 1 2 4 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L430">[src]</a></div>

## `drop`

drops the item on the bottom of the stack

`a ->`

```
> 1 2 3 drop
[ 1 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L448">[src]</a></div>

## `swap`

swaps the items on the bottom of the stack

`a b -> b c`

```
> 1 2 3 swap
[ 1 3 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L464">[src]</a></div>

## `dup`

duplicates the item on the bottom of the stack

`a -> a a`

```
> 1 2 3 dup
[ 1 2 3 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L478">[src]</a></div>

## `indexof`

returns the position of the first occurrence of a specified value in a sequence

`[a*] b -> x`

```
f♭> [ '1' '2' '3' '4' ] '2' indexof
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L492">[src]</a></div>

## `zip`

`[A*] [B*] -> [C*]`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] zip
[ 1 4 2 5 3 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L505">[src]</a></div>

## `zipinto`

`[A*] [B*] [C*] -> [D*]`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
[ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L517">[src]</a></div>

## `(` (immediate quote)

pushes a quotation maker onto the stack

`-> #(`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L526">[src]</a></div>

## `)` (immediate dequote)

collects stack items upto the last quote marker

`#( a -> [ a ]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L535">[src]</a></div>

## `[` (lazy quote)
pushes a quotation maker onto the stack, increments depth

`-> #(`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L545">[src]</a></div>

## `]` (lazy dequote)

decrements depth, collects stack items upto the last quote marker

`#( A* -> [ A* ]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L557">[src]</a></div>

## `{` (immediate object quote)

pushes a quotation marker onto the stack

`-> #(`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L574">[src]</a></div>

## `}` (immediate object dequote)

collects stack items upto the last quote marker, converts to an object

`#( a* -> { A* }`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L583">[src]</a></div>

## `template`

converts a string to a string template

`str -> [A*]`

```
f♭> 'hello $(world)' template
[ [ '' 'hello ' + '(world)' eval string + '' + ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L600">[src]</a></div>

## `sleep`

wait x milliseconds

`x ->`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L620">[src]</a></div>

## `undo`

restores the stack to state before previous eval
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L636">[src]</a></div>

## `match

`str a -> bool`

Matches a string a regex and returns an array containing the results of that search.

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L648">[src]</a></div>

## `=~`

`a b -> bool`

Returns a Boolean value that indicates whether or not the lhs matches the rhs.

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L658">[src]</a></div>

## `_`

`-> #_`

Match symbol

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L668">[src]</a></div>
