# Internal Experimental Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L29">[src]</a></div>

## `throw`

Throws an error

```
f♭> 'PC LOAD LETTER' throw
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L41">[src]</a></div>

## `throws?`

Evaluates the quotation in a child, returns true if the evaluation errors

```
f♭> [ 1 + ] throws?
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L55">[src]</a></div>

## `stringify`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L67">[src]</a></div>

## `parse-json`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L74">[src]</a></div>

## `||>` (apply)
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L81">[src]</a></div>

## `spawn`

evalues the quote in a child environment, returns a future

( [A] -> {future} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L90">[src]</a></div>

## `await`

evalues the quote in a child environment, waits for result

( [A] -> [a] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L101">[src]</a></div>

## `suspend`

stops execution, push queue to stack, loses other state

( ... -> )

```
f♭> [ 1 2 * suspend 3 4 *  ] fork
[ [ 2 3 4 * ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L121">[src]</a></div>

## `all`

executes each element in a child environment

( [ A B C ]-> [ [a] [b] [c] ])
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L132">[src]</a></div>

## `race`

executes each element in a child environment, returns first to finish

( [ A B C ]-> [x])
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L143">[src]</a></div>

## `js-raw`

evalues a string as raw javascript

( {string} -> {any} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L154">[src]</a></div>
