# Control Structures, Conditionals and Blocks

The core control mechinism in f♭ is the conditional (ternary) operator `choose` word.

```
f♭> true 1 2 choose
[ 1 ]

f♭> false [ 3 ] [ 4 ] choose
[ 1 [ 4 ] ]
``` 
