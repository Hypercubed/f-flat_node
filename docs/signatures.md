Type signatures are written in documentation with the input and output types to the left and right, respectively, of an ASCII rightwards arrow ⭢.  

`x, y` - a numeric value

`z` - a complex value

`n` - an integer

`a, b, c` - any primitive value 

`A, B, C` - any value including words to be evaluated (if `A` and `a` are used together, `a` signifies the evaluated version of `A` such that `A ⭢ a`)

`a:, b:, c:` - a key (often may be substitued for a string)

`{A}` or `{ a: b ... }` - an object of key value pairs

`bool` - a boolean value

`str`  - a string

`seq`  - a seqence (string or list)

`Date`, `Regexp`, `Future` - a date, regexp, and future value

`*` - Zero or more. (i.e. `a*` indicates zero or more of any value)

`'` - Value after evaluation (i.e. if `x` and `x'` are used together, `x'` signifies the value of `x` after some operation)

`[]` - When brackets are used they denote a array of values.  The zero or more signature (`*`) may or may not be used.  (i.e. `[A*]`, `[A ... ]`, and `[A]` may be the same)





