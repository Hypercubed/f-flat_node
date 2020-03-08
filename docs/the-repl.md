# Interactive F♭

If you are running F♭ from the github repo, you can start the REPL using `npm start`.  You will then see the F♭ command prompt:

```
          []]           F♭ Version 0.0.8
          []]           Copyright (c) 2000-2020 by Jayson Harshbarger
[]]]]]]]] []] []]]      Documentation: http://hypercubed.github.io/f-flat_node/
[]]       []]]   []]
[]]       []]   []]     
[]]]]]]   []]  []]      Type '.exit' to exit the repl
[]]       []][]]        Type '.clear' to clear the stack and the undo buffer
[]]                     Type '.reset' to reset the environment
[]]                     Type '.help' for more help

f♭>
```

You can exit the REPL by hitting ctrl-C twice or by typing `.exit`

```
f♭> 
To exit, press ^C again or type .exit

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

The current stack will be printed after each value is entered.  The current stack can be cleared using the `clr` command.  `.undo` will rset the stack to the state before the last command.  `.clear` will clear the stack and the undo histoy, leaving the current vocabulary intact.  `.reset` will reinitialize the entire envoronment.
