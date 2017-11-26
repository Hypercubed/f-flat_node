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
