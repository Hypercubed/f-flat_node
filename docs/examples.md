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

f♭> hi-all: [ hi2: * eval ] ;
[  ]

f♭> ["world" "everyone"] hi-all
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

## Average Some Values

```
[ 1 3 5 6 9 ] dup length [ 0 [ + ] reduce ] dip /
```

## A tail of 'fizz' (3) Fizz buzzs

```
/**
 * FizzBuzz using branching
 */
fizzbuzz: [
  dup 15 divisor?
  [ drop 'fizzbuzz' ]
  [
    dup 3 divisor?
    [ drop 'fizz' ]
    [ 
      dup 5 divisor?
      [ drop 'buzz' ]
      when
    ]
    branch
  ]
  branch
  println
] ;

20 integers [ fizzbuzz ] each

/**
 * FizzBuzz using conditionals
 */
c-fizzbuzz: [
  [
    [[dup 15 divisor?] [drop 'fizzbuzz']]
    [[dup 3 divisor?]  [drop 'fizz']]
    [[dup 5 divisor?]  [drop 'buzz']]
    [[true]            []]
  ] cond println
] ;

20 integers [ c-fizzbuzz ] each

/**
 * FizzBuzz using pattern matching
 */
p-fizzbuzz: [
  dup [ 5 divisor? ] [ 3 divisor? ] bi pair
  [
    [[ true true  ]   [ drop 'fizzbuzz' ] ]
    [[ false true ]   [ drop 'fizz' ] ]
    [[ true false ]   [ drop 'buzz' ] ]
    [[ false false ]  [] ]
  ]
  p-choose eval println
] ;

20 integers [ p-fizzbuzz ] each
```

## The quadratic equation using lambdas

```
quad: [
  [ a: b: c: ] => [
    .b -1 * .b .b * 4 .a .c * * - sqrt -+
    [ 2 .a * / ] bi@    
  ]
] lambda ;

1 2 3 quad
```

## Various Project Euler solutions

See [euler.md](./euler.md).
