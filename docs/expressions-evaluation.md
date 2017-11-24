## Expressions / Evaluation

Expressions use postfix operators, unlike many other languages. Expressions are evaluated immediately unless they follow an unpair in square brackets (`[`) or the word is has the colon suffix.. In general all words should follow the Object(s)-Verb pattern.

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

f♭> (-1 -2 -3) sqrt: map
[ 3
1
[ 0+1i 0+1.4142135623730950488i 0+1.7320508075688772936i ] ]
