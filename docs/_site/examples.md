# Examples

## Hello World

Basic hello world:

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
f♭> guess-game: [
  'Guess the number!' println
  'Please input your guess.' println
  prompt
  'You guessed: ' swap + println
] ;
f♭> guess-game
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
20 integers
[
  dup 15 divisor?
  [ drop 'fizzbuzz' println ]
  [
    dup 3 divisor?
    [ drop 'fizz' println ]
    [ 
      dup 5 divisor?
      [ drop 'buzz' println ]
      [ println ]
      branch
    ]
    branch
  ]
  branch
] each

/**
 * FizzBuzz using switch-case
 */
20 integers
[
  [
    [ [15 divisor?] case     [drop 'fizzbuzz' println]]
    [ [3 divisor?] case      [drop 'fizz' println]]
    [ [dup 5 divisor?] case  [drop 'buzz' println]]
    [ [true] case            [println]]
  ] switch
] each

/**
 * FizzBuzz using pattern matching
 */
20 integers [
  dup [ 5 divisor? ] [ 3 divisor? ] bi pair
  [
    [dup [true true]   =~  [ drop 'fizzbuzz' println ]]
    [dup [false true]  =~  [ drop 'fizz' println ]]
    [dup [true false]  =~  [ drop 'buzz' println ]]
    [dup [false false] =~  [ drop println ]]
  ] switch
] each

/**
 * FizzBuzz using lambdas as switch
 */
20 integers [
  [ x: ] => [
    [
      [ .x 15 divisor? ['fizzbuzz' println]]
      [ .x 3 divisor?  ['fizz' println]]
      [ .x 5 divisor?  ['buzz' println]]
      [ true           [.x println]]
    ] switch
  ]
] lambda each
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
