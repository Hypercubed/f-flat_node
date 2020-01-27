# Values

## Numbers

Numeric literals in F♭ are arbitary precision decimals.  The values may be input as integer or floats in binary, hexadecimal or octal form.

* Unsigned integer or floats \(`3`, `3.1415` ,`.14`\)
* Signed integer or float \(`-3`, `+3`, `+3.1415`, `-3.1415`, `+.14`, `-.14`\)
* Zero and negative zero \(`0`, `-0`\)
* Exponential \(power-of-ten exponent\) notation \(`8e5`, `-123e-2`\)
* Signed and unsigned binary, hexadecimal or octal integer \(`0xDEAD`, `-0xBEEF`\)
* Signed and unsigned binary, hexadecimal or octal float \(`0xDEAD.BEEF`, `-0xDEAD.BEEF`\)
* Signed and unsigned binary, hexadecimal or octal in power-of-two exponent notation \(`0x1.1p5`, `-0x1.1p-2`, `0x1.921FB4D12D84Ap+1`\)
* Percentages \(`10%`\)
* Underscores as separators \(`10_001`, `0xDEAD_BEEF`\) 

## Complex numbers

F♭ supports complex values. Complex values are not input directly but created through expressions:

```
f♭> 3 i 2 * +
[ 3+2i ]

f♭> -1 sqrt
[ 3+2i 0+1i ]
```

The word `complex` can be used to convert a string or array to a complex value.

```
f♭> '3+2i' complex
[ 3+2i ]

f♭> [0,1] complex
[ 3+2i 0+1i ]
```

Later we will learn that words prefixed with a colon \(`:`\) are immediate words.  That is they work inside lazy arrays.

```
f♭> [ '3+2i' complex ]
[ [ '3+2i' complex ] ]

f♭> ln
[ 2 ]

f♭> clr
[  ]

f♭> [ '3+2i':complex ]
[ [ 3+2i ] ]

f♭> ln
[ 1 ]
```

## Number-Like

F♭ supports infinity and nan literals.  In addtion to -infinity as the result of a calculation.

```
f♭> infinity
[ Infinity ]

f♭> -1 *
[ -Infinity ]

f♭> nan
[ -Infinity NaN ]
```

## Booleans and null

F♭ supports `true`, `false` and `null` values.  A null is considered an unknown.  When comparing boolean values the values are considered sorted in this order: `false`, `null`, `true`. 

## Strings

String literals in F♭ use single \(`'`\), double \(`"`\), and backtick quotes \(\`\) where double quoted strings supports unicode escapes and backticks are string templates.

    f♭> 'Hello world!'
    [ 'Hello world!' ]

    f♭> "\u0048\u0065\u006C\u006C\u006F\u0020\u0077\u006F\u0072\u006C\u0064"
    [ 'Hello world!' 'Hello world' ]

    f♭> clr `3 === $(1 2 +)`
    [ '3 === 3' ]

## Dates

Dates are input as strings and convered to date values usingthe`date` word.

```
f♭> '1/1/1990' date
[ Mon Jan 01 1990 00:00:00 GMT-0700 (MST) ]
```

As with complex values, strings can be converted to dates using the immediate version `:date`

```
f♭> [ '1/1/1990':date ]
[ [ Mon Jan 01 1990 00:00:00 GMT-0700 (Mountain Standard Time) ] ]
```

## Words

A word \(aka keys\) can be added to the stack without execution by either post-fixing the word with a colon \(`:`\) or converting a string to a word using a colon \(`:`\).

```
f♭> x:
[ x ]

f♭> 'y' :
[ x y ]
```



