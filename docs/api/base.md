# Internal Base Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L63">[src]</a></div>

## `+` (plus, or, concat)

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L70">[src]</a></div>

- list concatenation/function composition

```
f♭> [ 1 2 ] [ 3 ] +
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L80">[src]</a></div>

- boolean or

```
f♭> true false +
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L103">[src]</a></div>

- RegExp union

Return a Regexp object that is the union of the given patterns.
That is the regexp matches either input regex

```
f♭> "skiing" regexp "sledding" regexp +
[ /(?:skiing)|(?:sledding)/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L117">[src]</a></div>

- arithmetic addition

```
f♭> 0.1 0.2 +
[ 0.3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L128">[src]</a></div>

- map assign/assoc

Shallow merges two maps

```
f♭> { first: 'Manfred' } { last: 'von Thun' } +
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L153">[src]</a></div>

- date addition

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Mon Mar 17 2003 00:00:01 GMT-0700 (MST) ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L165">[src]</a></div>

- string concatenation

```
f♭> "abc" "xyz" +
[ "abcxyz" ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L193">[src]</a></div>

## `-` (minus, nor)

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L204">[src]</a></div>

- boolean nor

```
f♭> true true -
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L224">[src]</a></div>

- RegExp joint denial (nor)

Return a Regexp object that is the joint denial of the given patterns.
That is the regexp matches neither

```
f♭> "skiing" regexp "sledding" regexp -
[ /(?!skiing|sledding)/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L238">[src]</a></div>

- arithmetic subtraction

```
f♭> 2 1 -
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L249">[src]</a></div>

- date subtraction

```
f♭> '3/17/2003' date dup 1000 +
[ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
  Sun Mar 16 2003 23:59:59 GMT-0700 (MST) ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L274">[src]</a></div>

## `*` (times, and, join)

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L300">[src]</a></div>

- array/string intersparse

```
f♭> [ 'a' ] [ 'b' ] *
[ [ 'a' 'b' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L310">[src]</a></div>

- Array join

```
f♭> [ 'a' 'b' ] ';' *
[ 'a;b' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L331">[src]</a></div>

- string join

```
f♭> 'xyz' ';'
[ [ 'x;y;z' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L344">[src]</a></div>

- boolean and

```
f♭> true true *
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L358">[src]</a></div>

- object and

Returns a new object containing keys contained in both objects with values from the rhs

```
f♭> { first: 'James' } { first: 'Manfred', last: 'von Thun' } *
[ { first: 'Manfred' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L371">[src]</a></div>

- RegExp join (and)

Return a Regexp object that is the join of the given patterns.
That is the regexp matches both inputs

```
f♭> "skiing" regexp "sledding" regexp *
[ /(?=skiing)(?=sledding)/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L387">[src]</a></div>

- RegExp repeat (multiply)

Return a Regexp object that matches n repeats of the given pattern

```
f♭> "skiing" regexp 3 *
[ /(?:skiing){3}/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L400">[src]</a></div>

- repeat sequence

```
f♭> 'abc' 3 *
[ 'abcabcabc' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L411">[src]</a></div>

- arithmetic multiplication

```
f♭> 2 3 *
[ 6 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L430">[src]</a></div>

## `/` (forward slash, div)

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L462">[src]</a></div>

- array/string inverse intersparse

```
f♭> [ 'a' ] [ 'b' ] /
[ [ 'a' 'b' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L472">[src]</a></div>

- logical material nonimplication or abjunction

p but not q

```
f♭> true true /
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L490">[src]</a></div>

- Split

Split a string into substrings using the specified a string or regexp seperator

```
f♭> 'a;b;c' ';' /
[ [ 'a' 'b' 'c' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L503">[src]</a></div>

- Array/string split at

```
f♭> 'abcdef' 3 /
[ 'abc' 'def' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L516">[src]</a></div>

- arithmetic division

```
f♭> 6 2 /
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L541">[src]</a></div>

## `\` (backslash)

`a b ⭢ n`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L570">[src]</a></div>

- Floored division.

Largest integer less than or equal to x/y.

```
f♭> 7 2 \
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L591">[src]</a></div>

- Array/string head

Returns the head of string or array

```
f♭> 'abcdef' 3 \
[ 'abc' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L612">[src]</a></div>

- Split first

Split a string into substrings using the specified a string or regexp seperator
Returns the first

```
f♭> 'a;b;c' ';' \
[ 'a' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L628">[src]</a></div>

- logical converse non-implication, the negation of the converse of implication

```
f♭> true true \
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L641">[src]</a></div>

## `%` (modulo)

`a b ⭢ n`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L650">[src]</a></div>

- remainder after division

```
f♭> 7 2 %
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L660">[src]</a></div>

- Array/string tail

Returns tail of a string or array

```
f♭> 'abcdef' 3 /
[ 'def' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L680">[src]</a></div>

- Split rest

Split a string into substrings using the specified a string or regexp seperator
Returns the rest

```
f♭> 'a;b;c' ';' %
[ [ 'b' 'c' ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L696">[src]</a></div>

- RegExp inverse join (nand)

Return a Regexp object that is the inverse join of the given patterns.
That is the regexp does not match both inputs

```
f♭> "skiing" regexp "sledding" regexp /
[ /(?!(?=skiing)(?=sledding))/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L714">[src]</a></div>

- boolean nand

```
f♭> true false %
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L725">[src]</a></div>

## `>>`

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L734">[src]</a></div>

- unshift/cons

```
f♭> 1 [ 2 3 ] >>
[ 1 2 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L744">[src]</a></div>

- concat

```
f♭> 'dead' 'beef' >>
'deadbeef'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L770">[src]</a></div>

- string right shift

```
f♭> 'abcdef' 3 >>
'abc'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L783">[src]</a></div>

- map merge

Deeply merge a lhs into the rhs

```
f♭> { first: 'Manfred' } { last: 'von Thun' } >>
[ { last: 'von Thun', first: 'Manfred' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L798">[src]</a></div>

- Sign-propagating right shift

```
f♭> 64 2 >>
[ 16 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L811">[src]</a></div>

- logical material implication (P implies Q)

```
f♭> true true >>
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L824">[src]</a></div>

- RegExp right seq

Return a Regexp that sequentially matchs the input Regexps
And uses the right-hand-side flags

```
f♭> "/skiing/i" regexp "sledding" regexp >>
[ /skiingsledding/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L838">[src]</a></div>

## `<<`
Left shift

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L849">[src]</a></div>

- push/snoc

```
f♭> [ 1 2 ] 3 <<
[ [ 1 2 3 ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L859">[src]</a></div>

- concat

```
f♭> 'dead' 'beef' <<
'deadbeef'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L877">[src]</a></div>

- string left shift

```
f♭> 'abcdef' 3 <<
'def'
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L890">[src]</a></div>

- converse implication (p if q)

```
f♭> true true <<
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L903">[src]</a></div>

- object merge

Deeply merge a rhs into the lhs

```
f♭> { first: 'Manfred' } { last: 'von Thun' } <<
[ { first: 'Manfred' last: 'von Thun' } ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L916">[src]</a></div>

- left shift

```
f♭> 64 2 <<
[ 256 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L929">[src]</a></div>

- RegExp right seq

Return a Regexp that sequentially matchs the input Regexps
And uses the left-hand-side flags

```
f♭> "/skiing/i" regexp "sledding" regexp <<
[ /skiingsledding/i ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L950">[src]</a></div>

## `^` (pow)

`a b ⭢ c`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L960">[src]</a></div>

- pow function (base^exponent)

```
f♭> 7 2 %
[ 49 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L970">[src]</a></div>

- string pow
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L984">[src]</a></div>

- array pow
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L997">[src]</a></div>

- boolean xor

```
f♭> true false ^
[ true ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1015">[src]</a></div>

- RegExp xor

Return a Regexp object that is the exclsive or of the given patterns.
That is the regexp that matches one, but not both patterns

```
f♭> "skiing" regexp "sledding" regexp ^
[ /(?=skiing|sledding)(?=(?!(?=skiing)(?=sledding)))/ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1029">[src]</a></div>

## `ln`

`a b ⭢ n`
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1037">[src]</a></div>

- natural log
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1042">[src]</a></div>

- length of the Array or string

```
> [ 1 2 3 ] length
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1066">[src]</a></div>

- number of keys in a map

```
> { x: 1, y: 2, z: 3 } length
[ 3 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1079">[src]</a></div>

- "length" of a nan, null, and booleans are 0

```
> true length
[ 0 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1092">[src]</a></div>

## `~` (not)

`a ⭢ b`

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1103">[src]</a></div>

- number negate

```
f♭> 5 ~
[ -5 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1113">[src]</a></div>

- boolean (indeterminate) not

```
f♭> true ~
[ false ]
```

```
f♭> NaN ~
[ NaN ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1138">[src]</a></div>

- regex avoid
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1144">[src]</a></div>

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
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1162">[src]</a></div>

## `empty`

`a b ⭢ c`

Returns an empty value of the same type

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1182">[src]</a></div>

## `cmp`

Pushes a -1, 0, or 1 when x is logically 'less than', 'equal to', or 'greater than' y.
Push null if sort order is unknown

`a b ⭢ n`

```
f♭> 1 2 <=>
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1221">[src]</a></div>

- number comparisons

give results of either 1, 0 or -1

```
f♭> 1 0 <=>
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1233">[src]</a></div>

- vector comparisons

the longer vector is always "greater" regardless of contents

```
f♭> [1 2 3 4] [4 5 6] <=>
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1262">[src]</a></div>

- string comparisons

compare strings in alphabetically



```
f♭> "abc" "def" <=>
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1279">[src]</a></div>

- boolean comparisons

```
f♭> false true <=>
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1292">[src]</a></div>

- date comparisons

```
f♭> now now <=>
[ -1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1305">[src]</a></div>

- object comparisons

compares number of keys, regardless of contents

```
f♭> { x: 123, z: 789 } { y: 456 } <=>
[ 1 ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1322">[src]</a></div>

## `=` equal

Pushes true if x is equal to y.

`a b ⭢ bool`

```
f♭> 1 2 =
[ false ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/base.ts#L1362">[src]</a></div>
