# Examples

## Hello World

Basic helow world:

```
'Hello World!' println
```

REPL:

```
f♭> "Hello, world!" println
Hello, world!
[  ]

f♭> ["Hello, world!" println] eval
Hello, world!
[  ]

f♭> hi: ["Hello, world!" println] ;
[  ]

f♭> hi
Hello, world!
[  ]

f♭> hi2: [ "Hello, " swap + "!" + println ] ;
[  ]

f♭> "world" hi2
Hello, world!
[  ]

f♭> hiall: [ hi2: * eval ] ;
[  ]

f♭> ["world" "everyone"] hiall
Hello, world!
Hello, everyone!
```

## Guessing game

```
'Guess the number!' println
'Please input your guess.' println
prompt

'You guessed: ' swap + println
```

## Various Project Euler solutions

See [euler.md](./euler.md).
