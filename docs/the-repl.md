# Interactive F♭

If you are running F♭ from the github repo, you can start the REPL using `npm start`.  You will then see the F♭ command prompt:

```
          []]
          []]
[]]]]]]]] []] []]]      F♭ Version 0.0.7
[]]       []]]   []]    Copyright (c) 2000-2020 by J. Harshbarger
[]]       []]   []]
[]]]]]]   []]  []]      Type '.help' for help
[]]       []][]]        Type '.clear' to reset
[]]
[]]

f♭>
```

You can exit the REPL by hitting ctrl-C twice or by typing `.exit`

```
f♭> 
(To exit, press ^C again or type .exit)
f♭>
```

Starting the REPL again you can enter values either as a single line or one value at at time:

```
Welcome to F♭ REPL Interpreter
F♭ Version 0.0.0 (C) 2000-2017 J. Harshbarger

f♭> 1 2
[ 1 2 ]

f♭> "Hello"
[ 1 2 'Hello' ]

f♭>
```

The current stack will be printed after each value is entered.  The current stack can be cleared using the `clr` command, the entire envoronment can be reset using the `.clear` REPL command.

## Interactive Calculator

As shown in the [demo](demo.md), F♭ can be \(and is\) used as a interactive arbitrary precision calculator:

```
f♭> 0.1 0.2 +
[ 0.3 ]

f♭> 0.3 =
[ true ]

f♭> clr
[]

f♭> -1 sqrt
[ 0+1i ]

f♭> 1 atan 4 *
[ 0+1i, 3.1415926535897932385 ]

f♭> * exp
[ -1-3.7356616720497115803e-20i ]

f♭> abs
[ 1 ]

f♭> clr
[]

f♭> [ 2 swap ^ 1 - prime? ] "mersenne?" def
[]

f♭> 10 integers
[ [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] ]

f♭> [ mersenne? ] map
[ [ true, true, true, false, true, false, true, false, false, false ] ]

f♭> clr
[]

f♭> 1000 !
[ 4.0238726007709377384e+2567 ]

f♭> clr
[]

f♭> i !
[ 0.49801566811835599106-0.15494982830181068731i ]
```



