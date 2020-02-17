# Interactive F♭

If you are running F♭ from the github repo, you can start the REPL using `npm start`.  You will then see the F♭ command prompt:

```
          []]
          []]
[]]]]]]]] []] []]]      F♭ Version 0.0.8
[]]       []]]   []]    Copyright (c) 2000-2020 by Jayson Harshbarger
[]]       []]   []]
[]]]]]]   []]  []]      Type '.exit' to exit the repl
[]]       []][]]        Type '.clear' to reset
[]]                     Type '.help' for more help

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
f♭> 1 2
[ 1 2 ]

f♭> 'Hello'
[ 1 2 'Hello' ]

f♭>
```

The current stack will be printed after each value is entered.  The current stack can be cleared using the `clr` command, the entire envoronment can be reset using the `.clear` REPL command.
