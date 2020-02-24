# Control Structures, Conditionals and Blocks

## Choose

The core control mechanism in f♭ is the conditional \(ternary\) operator `choose` word.

```
f♭> true 1 2 choose
[ 1 ]

f♭> clr false [ 3 ] [ 4 ] choose
[ [ 4 ] ]
```

If conditional values are quotes they must be evaluated to execute.

```
f♭> true [ 1 2 + ] [ 1 2 * ] choose
[ [ 1 2 + ] ]

f♭> clr true [ 1 2 + ] [ 1 2 * ] choose eval
[ 3 ]

f♭> clr false [ 1 2 + ] [ 1 2 * ] choose eval
[ 2 ]
```

Defining the word `branch: [ choose eval ] ;` allows simplified branching:

```
f♭> true [ 1 2 + ] [ 1 2 * ] branch
[ 3 ]

f♭> clr false [ 1 2 + ] [ 1 2 * ] branch
[ 2 ]
```

## When, Unless

TBR

## Switch, Case

TBR



