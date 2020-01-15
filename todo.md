# Todo list

_\( managed using [todo-md](https://github.com/Hypercubed/todo-md) \)_

# New TODOs
- [ ] Number subtypes: integer (BigInt), real (decimaljs), rational (tbd), complex (internal)
- [ ] Decimal shift/unshift
- [ ] More complexInfinity/indeterminate base operations (http://functions.wolfram.com/Constants/ComplexInfinity/introductions/Symbols/ShowAll.html)
- [ ] stack underflow is an error!!
- [ ] finish and use https://github.com/Hypercubed/real

# Improved scoping and namespaces
- [ ] global immutable store (ex. `slip%8df57134`)
- [ ] names are scoped (ex. `slip` -> `slip%8df57134`)
- [ ] ":" (`toAction`) converts names to unique ids (`[ dup slip ] :` -> `[ dup%0eb15022 slip%8df5713 ]`)
- [ ] uuid or hash?
- [ ] mutually recursive definitions? (https://www.unisonweb.org/docs/faq/#how-does-hashing-work-for-mutually-recursive-definitions)

# Improved module system
- [ ] `include` loads file (url) inline (`[ read eval ]`)
- [ ] `import` loads file in a sub env and "sends" the resolved dictionary
- [ ] `use` (ex. `'xyz' import use`, `xyz: use`)?
- [ ] `use-from` `[ pluck use ]`?

# Testing words
- [ ] assertions
- [ ] TDD words (`suite`, `test`)
- [ ] option to run tets on load?

# Improved user space
- [ ] `add` - adds a word to the user's persistant dictionary?
- [ ] `pull` - loads a into the users startup scripts?

# Bugs

- [?] .clear should reset everything, including flags
- [ ] Recursive private functions (disallow recursion or co-recursive functions?)
- [ ] Recursive name spaces words

# Decide
- [x] Decide on macros, `dupn!3`, `dup<5>`, `range<1, 100>`, `range:(1, 10).` ? Using `range:(1, 10).`
- [ ] `~` vs `!`, `!` vs `factorial`, `/=` or `!=`.
- [ ] `undef`, `null`, `nan`, `nil`, `ComplexInfinity`, `Indeterminate`, `unknown` (http://www.wolframalpha.com/input/?i=ComplexInfinity)
- [ ] Choose `regex` vs `regexp`
- [ ] Ranges?  Infinite ranges? generators?
- [ ] Symbols vs internal classes?
- [-] sto/rcl destructuring `1 2 3 [ x: y: z: ] sto` (replaces `=>`)? (should internal words have fixed arity?).
- [ ] Bitwise ops on decimals (`|` vs `bitwise-or`, etc).
- [ ] map over strings should return strings?
- [ ] Store using symbols as keys `#aword dup 123 sto rcl`, collision free?

# Todo:

- [ ] Finish JSON output
- [ ] Serialize to ff
- [ ] Tagged templates `fn'${A}-${B}'` -> `${A fn}-${B fn}`?
- [ ] Mixed numeric and string indecies for arrays and maps `[ 1 2 x: 3 ]` `{ x: 1 y: 2 3 4 5}`
- [ ] Combine lambdas and pattern matching?
- [ ] Online help?
- [ ] Undo flags
  - [x] `undoable` -> `autoundo`,
  - [ ] add `undoable` flag.
  - [ ] reset by `.clear`
- [ ] Fix API docs for base
    - [ ] Move docs from gitbook?
- [ ] Consistant and predictable display precision:
  - [ ] `1 acos` => `0` (precision issue)
  - [ ] precision in complex calculations (on print)
  - [ ] Pretty printing complex values: '5e-20+2i' -> '2i'?
- [ ] More literals in parser?
  - [ ] regex?
  - [ ] i
  - [ ] +/-Infinity
  - [ ] Symbols `(`, `_`
  - [x] true, false
  - [x] null
- [ ] More tests for stack object immutablity
- [ ] Better internal types
  - [ ] Just -> ReturnValue
  - [ ] Seq -> ReturnSequence
  - [x] Action -> Words / Sentence
  - [ ] Token type? `a:`
- [ ] Test all internal words
  - [ ] Basis
  - [ ] Core
  - [ ] Dictionary words
- [ ] JSON
  - [ ] to simplified JSON (Decimal -> number, regex, symbols, etc)
  - [ ] Decimal/Complex .fromJSON + Tests
- [ ] rewrite rules?  user-defined?
  - [ ] `dup drop` -> ``
  - [ ] `q> q< ` -> ``
- [ ] Ensure predictable cmp with `null` and `nan`

# Words

- [ ] `cld`: (Smallest integer larger than or equal to x/y)
- [ ] `isfinite?`, `isinf?`, `isnan?`
- [ ] `sign`, `ispos?`, `isneg?`
- [ ] `>>>` ?
- [ ] `sinpi`, `cospi` (more accurate than `cos(pi*x)`, especially for large `x`.)?
- [ ] Better complex inputs
  - [ ] `1+2i` (Literal)?
  - [x] `"1+2i" complex`
  - [x] `[1,2] complex`
  - [x] `complex:((1,2)).`
  - [x] `complex:("1+2i").`
- [ ] `clamp`, `scale`
- [ ] radians -> rads-per-degree, etc. ?
- [ ] rename expand to lift?
- [ ] `lesser-of`, `greater-of` vs `max`, `min`?
- [ ] `gte` vs `>=`
- [ ] `&` vs `bit-and`
- [ ] Derivatives:
  - [ ] `deriv = (f, h) => x => (f(x + h) - f(x)) / h`
  - [x] `nd = (f, x, h) => (f(x + h) - f(x)) / h`
- [ ] Move `prompt` into code?
- [ ] Radix from number: `radix = (n, radix) => n.toString(radix)`
  - [ ] Fix `bin` and `oct` floating point
  - [ ] fix `hex`, `bin`, ect with neg values
- [ ] Elvis operastor `?:` (replaces choose?)
- [x] Safe at `?@` performs @ if lhs is not null
- [ ] `..` creastes a range, possibly infinite
- [ ] Use standard words, `foldl`, etc
- [ ] `each*`, recursive each, no stack overflow?
- [ ] Use `y` vs. recursion?
- [x] `falsy?` null, 0, undefined, ""?
- [ ] `=>` vs `sto`

# Docs

- [ ] Standardize all stack effects in docs and code comments
- [ ] Detail boolean / Three valued logic
- [ ] Basis
- [ ] Regexp
- [ ] "compile" (expand)
- [ ] Module loader, expanding functions, circular references.
- [ ] Defined words
- [ ] Child stacks, forks, etc.
- [ ] Async
- [ ] Dictionary "scope"

# Todo:

- [ ] Matrices?
- [ ] composite truth values?
- [ ] Pattern matching substitution? `[_ _]` => `[a,b]`
- [ ] Improve errors (FF errors should not have a JS stack, FF stack)
- [ ] Trig functions on complex
  - [x] sin, cos, tan
  - [x] sinh, cosh, tanh
  - [x] asin, acos, atan
  - [x] asin, acos with real values > 1 are complex
  - [x] asin and acos of complex infinities
  - [ ] atan2?
  - [ ] other derived words: sec, cot, etc.
- [ ] Infinity and complex numbers
  - [ ] Infinity in a complex number is a ComplexInfinity
  - [x] Multiplications: https://locklessinc.com/articles/complex_multiplication/
  - [x] Divsion: https://arxiv.org/pdf/1210.4539.pdf
  - [ ] shorthand for complex values? i.e. 'C#1+2i'?
- [ ] Investigate alternatives to decimal.js? Rational Numbers?
- [ ] Pool children env?
- [ ] Use child process/web workers for children?
- [ ] Separate state from environment and engine?
- [ ] IO Class?
- [ ] Session saving
- [x] Undo history
  - [x] undo
  - [ ] redo?
- [ ] better stack printing
- [ ] Dates
  - [ ] More date base operations
  - [ ] Add Duration type... example: https://github.com/moment/moment/blob/develop/src/lib/duration/constructor.js
- [ ] Improved `@`
  - [ ] `[ ... ] [ x y z ] @` => `[ ... ][x][y][z]`
  - [ ] `{ ... } 'x.y.z' @` => `[ ... ][x][y][z]`
- [ ] Private/Protected words?  Globals/parent scoped?
- [ ] Preserved precision base on user input (2.50 vs 2.5)?
- [ ] Pattern matching ???
- [ ] Better JSON iterop
  - [ ] StackEnv.prototype.toJSON should serialize entire state?
  - [ ] FFlat Extended JSON, `{ value: i 2 * }`
  - [ ] Deserialize JSON
  - [ ] Simplified JSON
  - [ ] BSON?
  - [x] Nan, Infinity, etc.
  - [x] BigNumber, Complex
  - [x] actions, 
  - [x] Dates
- [ ] RegExp
  - [?] Rewrite strings lib to use regex
  - [ ] Regex literal?
  - [ ] Fix union of rexexp with flags
  - [x] match operator `=~` ?
  - [ ] {Array} {RegExp} match?
  - [x] OR {regexp} + {regexp} = {regexp} OR {regexp}
  - [x] AND {regexp} + {regexp} = {regexp} AND {regexp}
  - [x] NOT {regexp} ~ = NOT {regexp}
  - [x] JSON output
- [ ] Get strict on punctuation ??
- [ ] Integer -> Float -> Decimal -> Complex, predictable type promotion
- [ ] Parser / compiler output
- [ ] Infinite Ranges? 1..Infinity?
- [ ] Pattern matching?
  - [x] place holder `_`
  - [x] rest pattern in arrays `[ 1 ... ]`
  - [-] OR patterns `1 | 2` (now using regex)
  - [-] ranges `1...4` (now using regex)
  - [ ] guards `3 >`
- [ ] Classes/inheritance?
