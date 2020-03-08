# Todo list

## Roadmap
- [ ] https://github.com/Hypercubed/real
  - [ ] Finish needed methods (`sin`, `cos`)
  - [ ] `Complex` module
- [ ] Classes
  - [ ] Prototypes (https://vimeo.com/74314050), 
  - [ ] go style interfaces (https://medium.com/@vtereshkov/how-i-implemented-go-style-interfaces-in-my-own-pascal-compiler-a0f8d37cd297)
  - [ ] Magic (Dunder) methods (https://rszalski.github.io/magicmethods/)
- [ ] Errors
  - [ ] Known error types
  - [ ] Continuations
  - [ ] switch on error type
- [ ] Running in browser

## TODO Now
- [ ] contracts/guards
  - [ ] guard
  - [ ] stack case guard
- [ ] Replace `.x` syntax
- [?] Allow GC of defintions
- [?] Move undo to repl (`.undo`)
  - [?] move undo stack to repl
  - [ ] docs
  - [ ] redo
  - [ ] Interactive errors
  - [?] Prompt to undo?
- [ ] doc `.reset` and `.clear`

## Bugs
- [x] Uppercase leters in object keys
- [ ] `_ 3 =~`?
- [ ] blessed gui broken
- [ ] `print` gets swallowed by stack
- [?] `'math' see` -> `[module]`?

## Testing
- [ ] `base` (`Deciaml.toBinary`) precision.
- [ ] Test unbound defs (macro-like expansion)
- [?] test for invalid word definitions
- [ ] Test for `%top`
- [?] Tests for `vocab`, `use`, etc.
- [ ] Test all internal words
  - [ ] Basis
  - [x] Core
  - [ ] Dictionary words
- [ ] Move `silent` flag to system properties
  - [?] Progress bar flag?
- [ ] move repl and gui to src
- [ ] Test all errors
  - [ ] MAXSTACK
  - [ ] MAXRUN
- [ ] circular imports?
- [ ] test pprint?
- [ ] test `read` and `resolve`

## TODOs
- [?] User defined sigils?
- [ ] `resolve` to allow missing file extension?
- [ ] `undef`, `null`, `nan`, `nil`, `ComplexInfinity`, `Indeterminate`, `unknown` (http://www.wolframalpha.com/input/?i=ComplexInfinity)
- [ ] `@` from complex value?
- [ ] pprint `Infinity`, `ComplexInfinity`, `NaN` etc.
- [ ] Move vscode extension
- [ ] pattern + lambdas `[ 1 2 a: ] ~> [ .a .a * ]`
- [ ] stack matcher `[ 1 2 3 [ _ 3 ] stack-case ]` -> `[ 1 2 3 true ]`
- [ ] fried defintions `[ .x 2 ^ .y 2 ^ + .y abs - ] fry` -> `[[ x: y: ] => [ .x 2 ^ .y 2 ^ + .y abs - ]] lambda`
- [ ] should undo always be immdiate?
  - [ ] Interactive errors
  - [ ] Prompt to undo?
- [ ] ability to define words as immediate (without prefix)?
- [?] ensure defining a module (`x: 'xx.ff' import ;`) doesn't create extra globals
- [?] all pprint values should be copy-pasteable?
  - [?] regex
  - [?] dates
  - [?] special numbers (`complexinfinity`, etc)
  - [ ] symbols?
- [ ] More stats on trace (max stack size, max queue size, time, etc)
- [?] Decimal shift/unshift
- [ ] More complexInfinity/indeterminate base operations (http://functions.wolfram.com/Constants/ComplexInfinity/introductions/Symbols/ShowAll.html)
- [?] immutable imports (https://github.com/moonad/Formality/blob/master/DOCUMENTATION.md#import)
- [ ] flags for pprinting (*maxDepth*, etc)
- [ ] pick for module? `math [ '!' ] pick use`
- [?] Store using symbols as keys `#aword [ dup 123 ] ;`? always global and collision free?
- [ ] os/platform specific bootloading?
- [ ] all internal words are loaded at untime (`js-import`?)
- [ ] different pprint for bound words?
- [ ] `stack` and `unstack`
  - [ ] `stack` and `unstack` are reverse of common defs
  - [ ] should `unstack` replace the stack?  If not then is `unstack: [ eval ] ;`?
  - [ ] `unstack` allows pushing words to stack `[ 1 2 * ] unstack`!!
  - [ ] `unstack` vs `eval`.

## Parser
- [ ] unicode words: `f\u266D`
- [ ] Regex literal
- [ ] `undefined`?
- [ ] complex, `i`
- [?] `+/-infinity`
- [-] Dates (local dates, times, timestaps...) (could dates be user defined classes?)
- [ ] Symbols `(`, `_`
  - [?] Use `#:`? as symbol prefix?  Symbols with whitespace (`#:'foo'`)?
  - [ ] well known symbols?

## Testing words
- [?] `try` `[ T ] [ C ] [ F ]`
- [x] assertions
- [?] TDD words (`suite`, `test`)
- [ ] option skip tests on load?

## Improved user space
- [ ] Start in user directory
- [ ] `add` - adds a word/vacabulary to the user's persistant dictionary/bootstrap? `math: add`

## Safer?
- [x] redefine action `:` ( string -> Key )?
- [?] more restrictions types on stack, queue and dictionary
- [?] Safer module loading (module class?)
- [?] defining objects? `z: { x: [ y ] } ;`?

## Internal Type cleaning
- [ ] `:xyz` -> `ImmediateWord`?
- [ ] `Action` vs `Word`?
- [?] `Alias` type?
- [?] `ResolvedWord`?

## Decide
- [-] Better macro system, `dupn!3`, `dup<5>`, `range<1, 100>`, `range:(1, 10).` ?
  - Using sap, prefer post-fix "macros" `1 10 :range`
- [ ] `~` vs `!`, `!` vs `factorial`, `/=` or `!=`
- [ ] Choose `regex` vs `regexp`
- [ ] Ranges?  Infinite ranges? generators?
- [ ] map over strings should return strings?

## Older Todos:
- [ ] Finish JSON output
- [ ] Serialize to `.ff` file?
- [?] Tagged templates `fn'${A}-${B}'` -> `${A fn}-${B fn}`?
- [?] Mixed numeric and string indecies for arrays and maps `[ 1 2 x: 3 ]` `{ x: 1 y: 2 3 4 5}`?
- [?] Combine lambdas and pattern matching?
- [?] Online help?
- [ ] Fix/improve API docs
    - [x] Move docs from gitbook?
- [ ] Consistant and predictable display precision:
  - [ ] `1 acos` => `0` (precision issue)
  - [ ] precision in complex calculations (on print)
  - [ ] Pretty printing complex values: `5e-20+2i` -> `2i`?
- [ ] JSON
  - [ ] to simplified JSON (Decimal -> number, regex, symbols, etc)
  - [ ] Decimal/Complex .fromJSON + Tests
- [ ] rewrite reduction rules?  user-defined?
  - [ ] `dup drop` -> ``
  - [ ] `q> q< ` -> ``
- [ ] Ensure predictable `<=>` with `null` and `nan`

## Words
- [ ] `%top` vs `root`?  add `parent`, `local`?
- [ ] `linrec` - 
- [?] `publish` add a word to a dict? `math: my-math-func: publish`, `math.my-func: [ ] ;`?
- [ ] `exists?` file exists?  `fstat`?
- [-] `->` vs `case`, `~>` vs `p-case`
- [?] `alias` `x: y: alias`
- [ ] More bitwise words:
  - [ ] `bit-set`, `bit-flip`, `bit-clr`, `bit-get`
- [ ] `cld`: (Smallest integer larger than or equal to x/y)
- [ ] `isfinite?`, `isinf?`, `isnan?`
- [ ] `sign`, `ispos?`, `isneg?`
- [ ] `>>>` ?
- [ ] `sinpi`, `cospi` (more accurate than `cos(pi*x)`, especially for large `x`)?
- [ ] Better complex inputs
  - [ ] `1+2i` (Literal)?
  - [x] `"1+2i" :complex`
  - [x] `[1,2] :complex`
- [ ] `clamp`, `scale`
- [ ] radians -> rads-per-degree, etc. ?
- [ ] `lesser-of`, `greater-of` vs `max`, `min`?
- [ ] `gte` vs `>=`
- [ ] Derivatives:
  - [ ] `deriv = (f, h) => x => (f(x + h) - f(x)) / h`
  - [x] `nd = (f, x, h) => (f(x + h) - f(x)) / h`
- [ ] Move `prompt` into code?
- [ ] Radix from number: `radix = (n, radix) => n.toString(radix)`
  - [ ] Fix `bin` and `oct` floating point
  - [ ] fix `hex`, `bin`, ect with neg values
- [ ] Lazy ranges
- [ ] Use standard words, `foldl`, etc
- [ ] `each*`, recursive each, no stack overflow?
- [ ] Use `y` vs. recursion?

## Docs

- [?] Standardize all stack effects in docs and code comments
- [ ] Detail boolean / Three valued logic
- [ ] Basis
- [ ] Regexp
- [ ] `defer`
- [ ] Module loader, expanding functions, circular references.
- [ ] Defined words
- [ ] Child stacks, forks, etc.
- [ ] Async
- [ ] Dictionary "scope"

## More Todo:

- [ ] Matrices?
- [ ] composite truth values?
- [?] Improve errors (FF errors should not have a JS stack, FF stack)
- [ ] Trig functions on complex
  - [x] sin, cos, tan
  - [x] sinh, cosh, tanh
  - [x] asin, acos, atan
  - [x] asin, acos with real values > 1 are complex
  - [x] asin and acos of complex infinities
  - [ ] atan2?
  - [ ] other derived words: `sec`, `cot`, etc.
- [ ] Infinity and complex numbers
  - [?] Infinity in a complex number is a ComplexInfinity
  - [x] Multiplications: https://locklessinc.com/articles/complex_multiplication/
  - [x] Divsion: https://arxiv.org/pdf/1210.4539.pdf
- [-] Pool children env?
- [ ] Use child process/web workers for children?
- [ ] Separate state from environment and engine?
- [ ] IO Class?
- [ ] Session saving
- [ ] Dates & Time
  - [ ] More date base operations
  - [ ] Add Duration type... example: https://github.com/moment/moment/blob/develop/src/lib/duration/constructor.js
- [ ] Path to `@`
  - [ ] `[ ... ] [ x y z ] @` => `[ ... ][x][y][z]`
  - [?] `{ ... } 'x.y.z' @` => `[ ... ][x][y][z]`
- [?] Private/Protected words?
- [ ] Preserved precision base on user input (2.50 vs 2.5)?
  - [ ] explicit reational/irrational `2.50M`?
- [ ] Better JSON iterop
  - [ ] `StackEnv.prototype.toJSON` should serialize entire state?
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
  - [ ] Fix union of rexexp with flags
  - [x] match operator `=~` ?
  - [ ] {Array} {RegExp} match?
  - [x] OR {regexp} + {regexp} = {regexp} OR {regexp}
  - [x] AND {regexp} + {regexp} = {regexp} AND {regexp}
  - [x] NOT {regexp} ~ = NOT {regexp}
  - [x] JSON output
- [ ] Parser / compiler output
- [ ] Infinite Ranges? 1..Infinity?
- [ ] Pattern matching?
  - [ ] Pattern matching substitution? `[_ _]` => `[a,b]` (lambdas?)
  - [x] place holder `_`
  - [x] rest pattern in arrays `[ 1 ... ]`
  - [-] OR patterns `1 | 2` (now using regex)
  - [-] ranges `1...4` (now using regex)
  - [?] guards `3 >` (`case when`)?
- [-] Classes/inheritance?


