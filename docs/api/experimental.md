# Internal Experimental Words

## `clock`

## `stringify`

## `parse-json`

## `regexp`
convert string to RegExp

## `match`

## `test?`

## `replace`

## `||>` (apply)

## `spawn`
evalues the quote in a child environment, returns a future

( [A] -> {future} )

## `await`
evalues the quote in a child environment, waits for result

( [A] -> [a] )

## `suspend`
stops execution, push queue to stack, loses other state

( ... -> )

```
f♭> [ 1 2 * suspend 3 4 *  ] fork
[ [ 2 3 4 * ] ]
```

## `all`
executes each element in a child environment

( [ A B C ]-> [ [a] [b] [c] ])

## `race`
executes each element in a child environment, returns first to finish

( [ A B C ]-> [x])

## `sesssave`

## `\`
push the top of the queue to the stack

( -> {any} )
