# Internal Core Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L38">[src]</a></div>

## `@` (at)

returns the item at the specified index/key

`[a*] n ⇒ a`

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]

f♭> [ 1 2 3 ] -1 @
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L92">[src]</a></div>

- string char at, zero based index

```
f♭> 'abc' 2 @
[ 'c' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L102">[src]</a></div>

- array at, zero based index

```
f♭> [ 1 2 3 ] 1 @
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L120">[src]</a></div>

- digit at, zero based index

```
f♭> 3.14159 2 @
[ 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L138">[src]</a></div>

- map get by key

```
f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
[ 'Manfred' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L158">[src]</a></div>

## `choose`

conditional (ternary) operator

`bool a b ⇒ a||b`

```
f♭> true 1 2 choose
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L269">[src]</a></div>

## `q<`

moves the top of the stack to the tail of the queue

`a ⇒`

```
f♭> 1 2 4 q< 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L283">[src]</a></div>

## `q>`

moves the tail of the queue to the top of the stack

`⇒ a`

```
f♭> 1 2 q> 4 3
[ 1 2 3 4 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L299">[src]</a></div>

## `stack`

replaces the stack with a quote containing the current stack

`a* ⇒ [a*] )

```
f♭> 1 2 3 stack
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L315">[src]</a></div>

## `unstack`

push items in a quote to the stack without evaluation

`[A*] ⇒ A*`

```
f♭> [ 1 2 * ] unstack
[ 1 2 * ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L333">[src]</a></div>

## `clr`

clears the stack

`a* ⇒`

```
f♭> 1 2 3 clr
[  ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L347">[src]</a></div>

## `depth`

pushes the size of the current stack (number of items on the stack)

`⇒ n`

```
f♭> 0 1 2 depth
[ 0 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L363">[src]</a></div>

## `eval`

evaluate quote or string

`[A*] ⇒ a*`

```
f♭> [ 1 2 * ] eval
[ 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L379">[src]</a></div>

## `in`

evalues the quote in a child environment

`[A*] ⇒ [a*]`

```
f♭> [ 1 2 * ] in
[ [ 2 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L393">[src]</a></div>

## `in-catch`

Evaluates the first quotation in a child environment
calls the second quotation in a child if the frist throws an error

`[A*] [B*] ⇒ [ a*||b* ]`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L406">[src]</a></div>

## `throw`

Throws an error

`str ⇒`

```
f♭> 'PC LOAD LETTER' throw
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L426">[src]</a></div>

## `send`

pushes one element from stack to parent.

`a ⇒`

```
f♭> [ 1 2 3 send 4 ] in
[ 3 [ 1 2 4 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L442">[src]</a></div>

## `drop`

drops the item on the bottom of the stack

`a ⇒`

```
> 1 2 3 drop
[ 1 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L460">[src]</a></div>

## `swap`

swaps the items on the bottom of the stack

`a b ⇒ b c`

```
> 1 2 3 swap
[ 1 3 2 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L476">[src]</a></div>

## `dup`

duplicates the item on the bottom of the stack

`a ⇒ a a`

```
> 1 2 3 dup
[ 1 2 3 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L490">[src]</a></div>

## `indexof`

returns the position of the first occurrence of a specified value in a sequence

`[a*] b ⇒ n`

```
f♭> [ '1' '2' '3' '4' ] '2' indexof
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L504">[src]</a></div>

## `zip`

`[A*] [B*] ⇒ [[A B]*]`

```
f♭> [ 1 2 3 ] [ 4 5 6 ] zip
[ [ 1 4 ] [ 2 5 ] [ 3 6 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L517">[src]</a></div>

## `(` (immediate quote)

pushes a quotation maker onto the stack

`⇒ #(`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L526">[src]</a></div>

## `)` (immediate dequote)

collects stack items upto the last quote marker

`#( a* ⇒ [ a* ]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L535">[src]</a></div>

## `[` (lazy quote)
pushes a quotation maker onto the stack, increments depth

`⇒ #(`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L545">[src]</a></div>

## `]` (lazy dequote)

decrements depth, collects stack items upto the last quote marker

`#( A* ⇒ [ A* ]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L557">[src]</a></div>

## `{` (immediate object quote)

pushes a quotation marker onto the stack

`⇒ #(`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L574">[src]</a></div>

## `}` (immediate object dequote)

collects stack items upto the last quote marker, converts to an object

`#( a b ... ⇒ { a: b ... }`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L583">[src]</a></div>

## `template`

converts a string to a string template

`str ⇒ [A*]`

```
f♭> 'hello $(world)' template
[ [ '' 'hello ' + '(world)' eval string + '' + ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L600">[src]</a></div>

## `sleep`

wait x milliseconds

`n ⇒`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L620">[src]</a></div>

## `match

`str a ⇒ bool`

Matches a string a regex and returns an array containing the results of that search.

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L639">[src]</a></div>

## `=~`

`a b ⇒ bool`

Returns a Boolean value that indicates whether or not the lhs matches the rhs.

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L649">[src]</a></div>

## `_`

`⇒ #_`

Match symbol

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/core.ts#L659">[src]</a></div>
