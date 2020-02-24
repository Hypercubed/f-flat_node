# Hello world

JavaScript  | F-Flat
---|---
`console.log("Hello World!")` | `"Hello World!" println`

# Literals

JavaScript             | F-Flat
-----------------------|-----
`3`                    | `3`
`3.1415`               | `3.1415`
`0x0F`                 | `0x0F`
*no complex numbers*   | `i`
`'Hello world!'`  | `'Hello world!'` (doesn't support unicode escapes)
`"\u0048\u0065\u006C\u006C\u006F\u0020\u0077\u006F\u0072\u006C\u0064"`  | `"\u0048\u0065\u006C\u006C\u006F\u0020\u0077\u006F\u0072\u006C\u0064"`  (supports unicode escapes)
``` `3 === ${1+2}` ``` | ``` `3 === $(1 2 +)` ```
`true`                 | `true`
`[1,2,3]`              | `[1 2 3]` (commas are options)

# Arrays / Lists

JavaScript | F-Flat
-----------|---
`[3,4]`    | `[ 3 4 ]`
`[3,4][0]` | `[ 3 4 ] 0 @`

# Objects / Records

JavaScript           | F-Flat
---------------------|---
`{ x: 3, y: 4 }`     | `{ x: 3, y: 4 }` (commas are options)
`({ x: 3, y: 4 }).x` | `{ x: 3, y: 4 } x: @`

# Functions

JavaScript                             | F-Flat
---------------------------------------|---
`1 + 2`                                | `1 2 +`
`() => true`                           | `[ true ]`
`(x,y) => x + y`                       | `[ + ]`
`function add(x,y) { return x + y; }`  | `add: [ + ] ;`
`Math.max(3, 4)`                       | `3 4 max`
`Math.min(1, Math.pow(2, 4))`          | `1 2 4 ^ min`
`[1,2,3].map(Math.sqrt)`               | `[1 2 3] [ sqrt ] map`
`[{ x: 3, y: 4 }, ... ].map(p => p.x)` | `[{ x: 3 y: 4 }  ... ] [ @x ] map`

# Control Flow

JavaScript            | F-Flat
----------------------|---
`3 > 2 ? '😺' : '🐶'` | `3 2 > '😺' '🐶' choose`

# Strings

JavaScript      | F-Flat
----------------|---
`'abc' + '123'` | `'abc' '123' +`
`'abc'.length`  | `'abc' length`
`'abc' + 123`   | `'abc' 123 +`

# Others

JavaScript   | F-Flat
-------------|---
`var n = 42` | N/A
