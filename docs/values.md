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
* Percentages \(`10%`, `0xDEAD.BEEF%`\)
* Underscores as separators (`10_001`, `0xDEAD_BEEF`) 

## Complex numbers

F♭ supports complex values. Complex values are not input directly but created through expressions:

```
f♭> 3 i 2 * +
[ 3+2i ]

f♭> -1 sqrt
[ 3+2i 0+1i ]
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

F♭ supports `true`, `false` and `null` values.

## Strings

String literals in F♭ use single, double, and backtick quotes where double quoted strings supports unicode escapes and backticks are string templates.

    f♭> 'Hello world!'
    [ 'Hello world!' ]

    f♭> "\u0048\u0065\u006C\u006C\u006F\u0020\u0077\u006F\u0072\u006C\u0064"
    [ 'Hello world!' 'Hello world' ]

    f♭> clr `3 === $(1 2 +)`
    [ '3 === 3' ]

## Dates

Dates are input as strings and convered to date values uning teh `date` word.

```
f♭> '1/1/1990'
[ '1/1/1990' ]

f♭> date
[ Mon Jan 01 1990 00:00:00 GMT-0700 (MST) ]
```

## Words

A word \(aka symbols or keys\) can be added to the stack without execution by either postfixing the word with a colon \(`:`\) or converting a string to a word using a colon \(`:`\).

```
f♭> x:
[ x ]

f♭> 'y' :
[ x y ]
```



