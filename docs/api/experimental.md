# Internal Experimental Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L64">[src]</a></div>

## `throw`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L69">[src]</a></div>

## `stringify`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L76">[src]</a></div>

## `parse-json`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L81">[src]</a></div>

## `||>` (apply)
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L86">[src]</a></div>

## `spawn`
evalues the quote in a child environment, returns a future

( [A] -> {future} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L96">[src]</a></div>

## `await`
evalues the quote in a child environment, waits for result

( [A] -> [a] )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L106">[src]</a></div>

## `suspend`
stops execution, push queue to stack, loses other state

( ... -> )

```
f♭> [ 1 2 * suspend 3 4 *  ] fork
[ [ 2 3 4 * ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L125">[src]</a></div>

## `all`
executes each element in a child environment

( [ A B C ]-> [ [a] [b] [c] ])
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L135">[src]</a></div>

## `race`
executes each element in a child environment, returns first to finish

( [ A B C ]-> [x])
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L145">[src]</a></div>

## `sesssave`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L152">[src]</a></div>

## `js-raw`
evalues a string as raw javascript

( {string} -> {any} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L174">[src]</a></div>

### `memoize`

memoize a defined word

( {string|atom} -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L185">[src]</a></div>
