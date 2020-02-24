# Expressions / Evaluation

Expressions use postfix operators, unlike many other languages. Expressions are evaluated immediately unless they follow an unpaired square brackets \(`[`\) or the word is has the colon suffix (in which case it is considered a key). In general all words should follow the Subject-(Object-)-Verb pattern.

```
f♭> "Hello World!" println
Hello World!
[ ]

f♭> 1 2 +
[ 3 ]

f♭> [ 1 2 3 ^ min ]
[ 3 [ 1 2 3 ^ min ] ]

f♭> eval
[ 3 1 ]

f♭> (-1 -2 -3) [ sqrt ] map
[
  3
  1
  [ 0+1i 0+1.4142135623730950488i 0+1.7320508075688772935i ]
]
```

As mentioned above, lists are "lazy".  Words entered following an unmatched square bracket are not immediately evaluated unless the word is prefixed with a colon \(`:`\):

```
f♭> [ 9 sqrt ]
[ [ 9 sqrt ] ]

f♭> clr
[ ]

f♭> [ 9 :sqrt ]
[ [ 3 ] ]
```



