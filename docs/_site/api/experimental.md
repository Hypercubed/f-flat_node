# Internal Experimental Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L28">[src]</a></div>

## `stringify`

`a -> str`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L35">[src]</a></div>

## `||>` (apply)
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L42">[src]</a></div>

## `spawn`

evalues the quote in a child environment, returns a future

`[A] -> future`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L51">[src]</a></div>

## `await`

evalues the quote in a child environment, waits for result

`[A] -> [a]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L62">[src]</a></div>

## `suspend`

stops execution, push queue to stack, loses other state

`->`

```
f♭> [ 1 2 * suspend 3 4 *  ] in
[ [ 2 3 4 * ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L82">[src]</a></div>

## `all`

executes each element in a child environment

`[A] -> [a]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L93">[src]</a></div>

## `race`

executes each element in a child environment, returns first to finish

[A] -> [b]`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L104">[src]</a></div>

## `js-raw`

evalues a string as raw javascript

`str -> a*`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/experimental.ts#L115">[src]</a></div>
