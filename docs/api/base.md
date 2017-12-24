# Internal Base Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L52">[src]</a></div>

## `+` (add)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L59">[src]</a></div>

- list concatenation/function composition

```
f♭> [ 1 2 ] [ 3 ] +
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L69">[src]</a></div>

- boolean or

```
f♭> true false +
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L87">[src]</a></div>

- RegExp union

Return a Regexp object that is the union of the given patterns.
That is the regexp matches either input regex

```
f♭> "skiing" regexp "sledding" regexp +
[ /(?:skiing)|(?:sledding)/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L100">[src]</a></div>

- arithmetic addition

```
f♭> 0.1 0.2 +
[ 0.3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L110">[src]</a></div>

- map assign/assoc

Shallow merges two maps

```
f♭> { first: 'Manfred' } { last: 'von Thun' } +
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L124">[src]</a></div>

- date addition

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Mon Mar 17 2003 00:00:01 GMT-0700 (MST) ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L135">[src]</a></div>

- string concatenation

```
f♭> "abc" "xyz" +
[ "abcxyz" ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L149">[src]</a></div>

## `-` (minus)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L160">[src]</a></div>

- boolean nor

```
f♭> true true -
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L180">[src]</a></div>

- RegExp joint denial (nor)

Return a Regexp object that is the joint denial of the given patterns.
That is the regexp matches neither

```
f♭> "skiing" regexp "sledding" regexp -
[ /(?!skiing|sledding)/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L193">[src]</a></div>

- arithmetic subtraction

```
f♭> 2 1 -
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L203">[src]</a></div>

- date subtraction

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Sun Mar 16 2003 23:59:59 GMT-0700 (MST) ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L218">[src]</a></div>

## `*` (times)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L232">[src]</a></div>

- array intersparse

```
f♭> [ 'a' ] [ 'b' ] *
[ [ 'a' 'b' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L242">[src]</a></div>

- Array join

```
f♭> [ 'a' 'b' ] ';' *
[ 'a;b' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L255">[src]</a></div>

- string intersparse

```
f♭> 'xyz' ';'
[ [ 'x;y;z' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L265">[src]</a></div>

- boolean and

```
f♭> true true *
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L276">[src]</a></div>

- object and

Returns a new object containing keys contained in both objects with values from the rhs

```
f♭> { first: 'James' } { first: 'Manfred', last: 'von Thun' } *
[ { first: 'Manfred' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L288">[src]</a></div>

- RegExp join (and)

Return a Regexp object that is the join of the given patterns.
That is the regexp matches both inputs

```
f♭> "skiing" regexp "sledding" regexp *
[ /(?=skiing)(?=sledding)/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L301">[src]</a></div>

- RegExp repeat (multiply)

Return a Regexp object that matches n repeats of the given pattern

```
f♭> "skiing" regexp 3 *
[ /(?:skiing){3}/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L313">[src]</a></div>

- repeat sequence

```
f♭> 'abc' 3 *
[ 'abcabcabc' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L323">[src]</a></div>

- arithmetic multiplication

```
f♭> 2 3 *
[ 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L335">[src]</a></div>

## `/` (forward slash)

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L345">[src]</a></div>

- logical material nonimplication or abjunction

p but not q

```
f♭> true true /
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L357">[src]</a></div>

- Split

Split a string into substrings using the specified a string or regexp seperator

```
f♭> 'a;b;c' ';' /
[ [ 'a' 'b' 'c' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L369">[src]</a></div>

- Array/string split at

```
f♭> 'abcdef' 3 /
[ 'abc' 'def' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L379">[src]</a></div>

- arithmetic division

```
f♭> 6 2 /
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L399">[src]</a></div>

## `\` (backslash)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L411">[src]</a></div>

- Floored division.

Largest integer less than or equal to x/y.

```
f♭> 7 2 \
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L423">[src]</a></div>

- Array/string head

Returns the head of string or array

```
f♭> 'abcdef' 3 \
[ 'abc' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L439">[src]</a></div>

- Split first

Split a string into substrings using the specified a string or regexp seperator
Returns the first

```
f♭> 'a;b;c' ';' /
[ 'a' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L452">[src]</a></div>

- logical converse non-implication, the negation of the converse of implication

```
f♭> true true \
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L462">[src]</a></div>

## `%` (modulo)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L469">[src]</a></div>

- remainder after division

```
f♭> 7 2 %
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L479">[src]</a></div>

- Array/string tail

Returns tail of a string or array

```
f♭> 'abcdef' 3 /
[ 'def' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L491">[src]</a></div>

- Split rest

Split a string into substrings using the specified a string or regexp seperator
Returns the rest

```
f♭> 'a;b;c' ';' %
[ [ 'b' 'c' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L504">[src]</a></div>

- RegExp inverse join (nand)

Return a Regexp object that is the inverse join of the given patterns.
That is the regexp does not match both inputs

```
f♭> "skiing" regexp "sledding" regexp /
[ /(?!(?=skiing)(?=sledding))/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L521">[src]</a></div>

- boolean nand

```
f♭> true false %
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L531">[src]</a></div>

## `>>`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L538">[src]</a></div>

- unshift/cons

```
f♭> 1 [ 2 3 ] >>
[ 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L548">[src]</a></div>

- concat

```
f♭> 'dead' 'beef' >>
'deadbeef'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L561">[src]</a></div>

- string right shift

```
f♭> 'abcdef' 3 >>
'abc'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L571">[src]</a></div>

- map merge

Deeply merge a lhs into the rhs

```
f♭> { first: 'Manfred' } { last: 'von Thun' } >>
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L583">[src]</a></div>

- Sign-propagating right shift

```
f♭> 64 2 >>
[ 16 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L593">[src]</a></div>

- logical material implication (P implies Q)

```
f♭> true true >>
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L603">[src]</a></div>

- RegExp right seq

Return a Regexp that sequentially matchs the input Regexps
And uses the right-hand-side flags

```
f♭> "/skiing/i" regexp "sledding" regexp >>
[ /skiingsledding/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L616">[src]</a></div>

## `<<`
Left shift

( x y -> z)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L625">[src]</a></div>

- push/snoc

```
f♭> [ 1 2 ] 3 <<
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L635">[src]</a></div>

- concat

```
f♭> 'dead' 'beef' <<
'deadbeef'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L646">[src]</a></div>

- string left shift

```
f♭> 'abcdef' 3 <<
'def'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L656">[src]</a></div>

- converse implication (p if q)

```
f♭> true true <<
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L666">[src]</a></div>

- object merge


Deeply merge a rhs into the lhs

```
f♭> { first: 'Manfred' } { last: 'von Thun' } <<
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L679">[src]</a></div>

- left shift

```
f♭> 64 2 <<
[ 256 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L689">[src]</a></div>

- RegExp right seq

Return a Regexp that sequentially matchs the input Regexps
And uses the left-hand-side flags

```
f♭> "/skiing/i" regexp "sledding" regexp <<
[ /skiingsledding/i ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L704">[src]</a></div>

## `^` (pow)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L711">[src]</a></div>

- pow function (base^exponent)

```
f♭> 7 2 %
[ 49 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L721">[src]</a></div>

- string pow
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L729">[src]</a></div>

- array pow
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L741">[src]</a></div>

- boolean xor

```
f♭> true false ^
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L758">[src]</a></div>

- RegExp xor

Return a Regexp object that is the exclsive or of the given patterns.
That is the regexp that matches one, but not both patterns

```
f♭> "skiing" regexp "sledding" regexp ^
[ /(?=skiing|sledding)(?=(?!(?=skiing)(?=sledding)))/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L771">[src]</a></div>

## `ln`

( x -> {number} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L778">[src]</a></div>

- natural log
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L783">[src]</a></div>

- length of the Array or string

```
> [ 1 2 3 ] length
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L797">[src]</a></div>

- number of keys in a map

```
> { x: 1, y: 2, z: 3 } length
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L807">[src]</a></div>

- "length" of a nan, null, and booleans are 0

```
> true length
[ 0 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L817">[src]</a></div>

## `~` (not)
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L823">[src]</a></div>

- number negate

```
f♭> 5 ~
[ -5 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L833">[src]</a></div>

- boolean (indeterminate) not

```
f♭> true ~
[ false ]
```

```
f♭> NaN ~
[ NaN ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L853">[src]</a></div>

- regex avoid
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L858">[src]</a></div>

- object/array invert

Returns a new object with the keys of the given object as values, and the values of the given object

```
f♭> { first: 'Manfred', last: 'von Thun' } ~
[ { Manfred: 'first' von Thun: 'last' } ]
```

```
f♭> [ 'a' 'b' 'c' ] ~
[ { a: '0' b: '1'  c: '2' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L875">[src]</a></div>

## `empty`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L884">[src]</a></div>

## `cmp`
Pushes a -1, 0, or 1 when x is logically 'less than', 'equal to', or 'greater than' y.
Push null if sort order is unknown

( x y -> z )

```
f♭> 1 2 cmp
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L904">[src]</a></div>

- number comparisons

give results of either 1, 0 or -1

```
f♭> 1 0 cmp
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L916">[src]</a></div>

- vector comparisons

the longer vector is always "greater" regardless of contents

```
f♭> [1 2 3 4] [4 5 6] cmp
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L936">[src]</a></div>

- string comparisons

compare strings in alphabetically



```
f♭> "abc" "def" cmp
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L954">[src]</a></div>

- boolean comparisons

```
f♭> false true cmp
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L966">[src]</a></div>

- date comparisons

```
f♭> now now cmp
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L978">[src]</a></div>

- object comparisons

compares number of keys, regardless of contents

```
f♭> { x: 123, z: 789 } { y: 456 } cmp
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L994">[src]</a></div>

## `=` equal
Pushes true if x is equal to y.

( x y -> z )

```
f♭> 1 2 =
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1029">[src]</a></div>
