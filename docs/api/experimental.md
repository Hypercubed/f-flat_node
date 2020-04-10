# Internal Experimental Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L9">[src]</a></div>

## `stringify`

`a -> str`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L16">[src]</a></div>

## `spawn`

evalues the quote in a child environment, returns a future

`[A] -> future`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L27">[src]</a></div>

## `await`

evalues the quote in a child environment, waits for result

`[A] -> [a]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L38">[src]</a></div>

## `suspend`

stops execution, push queue to stack, loses other state

`->`

```
f♭> [ 1 2 * suspend 3 4 *  ] in
[ [ 2 3 4 * ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L58">[src]</a></div>

## `all`

executes each element in a child environment

`[A] -> [a]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L69">[src]</a></div>

## `race`

executes each element in a child environment, returns first to finish

[A] -> [b]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L80">[src]</a></div>

## `js-raw`

evalues a string as raw javascript

`str -> a*`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L91">[src]</a></div>
