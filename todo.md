# Todo list

## Roadmap
- [ ] https://github.com/Hypercubed/real
  - [ ] Finish needed methods (`sin`, `cos`)
  - [ ] `Complex` module
- [ ] Records/Classes
  - [ ] Prototypes (https://vimeo.com/74314050), 
  - [ ] go style interfaces (https://medium.com/@vtereshkov/how-i-implemented-go-style-interfaces-in-my-own-pascal-compiler-a0f8d37cd297)
  - [ ] Magic (Dunder) methods (https://rszalski.github.io/magicmethods/)
- [ ] Errors
  - [ ] Known error types
  - [ ] Continuations
  - [ ] switch on error type
- [ ] Running in browser
  - [ ] Move node specific code to repl
  - [ ] Online UI
  - [ ] move `show` and others to repl
  - [ ] timing to repl?
  - [ ] logging in browser?

## TODO Now
- [!] map over strings should return strings? (same sequence type)
- [ ] `show` to repl?
- [ ] `switch, case` vs `case, ->`, `case, when`?
- [ ] reintroduce
  - [x] `bind`
  - [x] `inline`
  - [?] `def`? `;` -> `q< [ dup defer ] q> bind def`
  - [?] `def`? `;;` -> `q< [ dup defer ] q> inline def`
- [ ] Standard words (haskell-ish):
  - [?] `fst`, `snd`, `head`, `tail`, `take`, `drop`
  - [x] `zip`, `zipwith`, `zipinto`
  - [?] `***`, `[x y] [x->a] [y->b] ***` ==> `[ a b ]` (bimap)
  - [ ] `&&&`, `x [x->a] [x->b] &&&` ==> `[ a b ]` (bi?)
  - [?] `>>`, `[a] [a -> [b]]` ==> `[b]` (flatmap?)
  - [ ] `>>=`, `<*>`, `<$>`, `<&>`, `<-`, `<=<`?
- [x] Move trace to repl?
- [ ] contracts/guards
  - [?] guard
  - [ ] stack case guard
- [ ] Replace `.x` syntax?  `/x`, `:x:`, `::x`, `/x/`, `~x`, `$x`
  - [ ] repl commands vs force local
- [ ] repl
  - [x] move repl to `src`...  use TS
  - [x] `.editor` in repl
  - [x] move undo to repl
  - [x] docs
  - [x] redo
  - [x] max redo/undo
  - [ ] Interactive errors
  - [x] Prompt to undo on error?
- [ ] Better unicode (lugaru.com/man/Character.Constants.html)
  - [x] unescape without eval? (https://github.com/iamakulov/unescape-js#readme)
  - [ ] `\flat`? (https://docs.julialang.org/en/v1/manual/unicode-input/) (https://github.com/coq/coq/blob/master/ide/default_bindings_src.ml)
  - [ ] `\u[flat]`? (https://github.com/wooorm/character-entities) 
  - [-] `&flat;`?
  - [x] `\u266D`  (same as `"\u266D" :`)
  - [ ] regex unicode property aliases?  (https://github.com/tc39/proposal-regexp-unicode-property-escapes)

## Bugs
- [x] error on `.reset` crashes
- [x] `"123\"456"` parse error
- [?] `'x' exit` should be type error?
- [ ] `_ 3 =~`?
- [x] `print` gets swallowed by stack printing

## Testing
- [ ] force matching quotes, `( 1 2 ]` is an error
  - [ ] force matching quotes
  - [ ] mismatch error
  - [ ] underflow error
- [ ] test tokenizer/parser
- [ ] Nested lambdas
- [ ] test the repl
- [ ] `base` (`Deciaml.toBinary`) precision.
- [ ] Test unbound defs (macro-like expansion)
- [?] test for invalid word definitions
- [ ] Test for `_top`
- [?] Tests for `vocab`, `use`, etc.
- [ ] Test all internal words
  - [ ] Basis
  - [ ] Core
  - [ ] Dictionary words
- [ ] Test all errors
  - [ ] MAXSTACK
  - [ ] MAXRUN
- [ ] circular imports?
- [ ] test pprint?
- [ ] test `read` and `resolve`
- [?] pick for module? `math [ '!' ] pluck use`

## TODOs
- [ ] Bash-like brace expansion (https://github.com/micromatch/braces) `'{0..5}' :braces` -> `['1', '2', '3', '4', '5']`
- [?] highlight as you type? (would need to parse as you type!)
- [ ] shell commands
- [-] sigils (`+x`, `~x`, `@x`, `^x`, `#x`, `%x`, `?x`, `!x`, `=x`)
  - [?] User defined sigils?  (https://medium.com/blackode/write-your-own-sigils-elixir-ce648f531211)
    - [ ] `~regex/abc/u`, `/abc/u :regex` -> `'/.../u' :regex`
    - [ ] `~complex/3+2i/`, `/3+2i/ :complex`
  - [ ] get (`.x`, `@x`)?
  - [ ] lazy word (`.x`, `?x`, `#x`)?
  - [ ] repl commands (`.x`)?
- [ ] `resolve` to allow missing file extension?
- [ ] `undef`, `null`, `nan`, `nil`, `ComplexInfinity`, `Indeterminate`, `unknown` (http://www.wolframalpha.com/input/?i=ComplexInfinity)
- [?] `@` from complex value?
- [ ] pprint `Infinity`, `ComplexInfinity`, `NaN` etc.
- [ ] Move vscode extension?
- [ ] pattern + lambdas `[ 1 2 a: ] ~> [ .a .a * ]`
- [ ] stack matcher `[ 1 2 3 [ _ 3 ] stack-case ]` -> `[ 1 2 3 true ]`
- [?] fried defintions `[ .x 2 ^ .y 2 ^ + .y abs - ] fry` -> `[[ x: y: ] => [ .x 2 ^ .y 2 ^ + .y abs - ]] lambda`
- [ ] ability to define words as immediate (without prefix)?
- [?] ensure defining a module (`x: 'xx.ff' import ;`) doesn't create extra globals
- [?] all pprint values should be copy-pastable in literal?
  - [?] regex
  - [?] dates
  - [?] special numbers (`complexinfinity`, etc)
  - [-] symbols?
- [ ] More stats on trace (max stack size, max queue size, time, etc)
- [?] Decimal shift/unshift
- [ ] More complexInfinity/indeterminate base operations (http://functions.wolfram.com/Constants/ComplexInfinity/introductions/Symbols/ShowAll.html)
- [?] immutable imports (https://github.com/moonad/Formality/blob/master/DOCUMENTATION.md#import)
- [?] flags for pprinting (*maxDepth*, etc)
- [ ] os/platform specific bootloading?
- [?] all internal words are loaded at runtime (`js-import`?)
- [x] different pprint for bound words?
- [ ] `stack` and `unstack`
  - [ ] `stack` and `unstack` are reverse of common defs
  - [-] should `unstack` replace the stack?  If not then is `unstack: [ eval ] ;`?
  - [ ] `unstack` allows pushing words to stack `[ 1 2 * ] unstack`!!
  - [-] `unstack` vs `eval`.

## Parser
- [x] unicode words and keys: `f\u266D:`
- [?] Regex literal
- [?] `undefined` literal?
- [-] complex, `i`
- [?] `+/-infinity`
- [-] Dates (local dates, times, timestaps...) (could dates be user defined classes?)

## Testing words
- [?] `try` `[ T ] [ C ] [ F ]`
- [x] assertions
- [?] TDD words (`suite`, `test`)
- [ ] option skip tests on load?
undefined
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

## Older Todos:
- [ ] Finish JSON output
- [ ] Serialize to `.ff` file?
- [?] Tagged templates `fn'${A}-${B}'` -> `${A fn}-${B fn}`?
- [?] Mixed numeric and string indecies for arrays and maps `[ 1 2 x: 3 ]` `{ x: 1 y: 2 3 4 5}`?
- [?] Combine lambdas and pattern matching?
- [-] Online help?
- [ ] Consistant and predictable display precision:
  - [ ] `1 acos` => `0` (precision issue)
  - [ ] precision in complex calculations (on print)
  - [ ] Pretty printing complex values: `5e-20+2i` -> `2i`?
- [ ] JSON
  - [ ] to simplified JSON (Decimal -> number, regex, etc)
  - [ ] Decimal/Complex .fromJSON + Tests
- [ ] reduction rules?
  - [ ] `dup drop` -> ``
  - [ ] `q> q< ` -> ``
- [ ] Ensure predictable `<=>` with `null` and `nan`

## Words
- [ ] `_top` vs `root`?  add `parent`, `local`?
- [ ] `linrec` - 
- [?] `publish` add a word to a dict? `math: my-math-func: publish`, `math.my-func: [ ] ;`?
- [ ] `exists?` file exists?  `fstat`?
- [-] `->` vs `case`, `~>` vs `p-case`
- [?] `alias` `x: y: alias`
- [ ] More bitwise words:
  - [ ] `bit-set`, `bit-flip`, `bit-clr`, `bit-get`
- [ ] `cld`: (Smallest integer larger than or equal to x/y)
- [ ] `finite?`, `inf?`, `undefined?`
- [x] `sign` (same as `0 <=>`?)
- [?] `>>>` ?
- [ ] `sinpi`, `cospi` (more accurate than `cos(pi*x)`, especially for large `x`)?
- [ ] Better complex inputs
  - [ ] `1+2i` (Literal)?
  - [x] `"1+2i" :complex`
  - [x] `[1,2] :complex`
- [ ] `clamp`, `scale`
- [ ] radians -> rads-per-degree, etc. ?
- [ ] `lesser-of`, `greater-of` vs `max`, `min`?
- [-] `gte` vs `>=`
- [ ] Derivatives:
  - [ ] `deriv = (f, h) => x => (f(x + h) - f(x)) / h`
  - [x] `nd = (f, x, h) => (f(x + h) - f(x)) / h`
- [?] Move `prompt` into code?
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
- [?] composite truth values?
- [?] Improve errors (FF errors should not have a JS stack, FF stack)
- [ ] Trig functions on complex
  - [x] sin, cos, tan
  - [x] sinh, cosh, tanh
  - [x] asin, acos, atan
  - [x] asin, acos with real values > 1 are complex
  - [x] asin and acos of complex infinities
  - [?] atan2?
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
  - [?] rest pattern in arrays `[ 1 ... ]`
  - [-] OR patterns `1 | 2` (now using regex)
  - [-] ranges `1...4` (now using regex)
  - [?] guards `3 >` (`case when`)?
- [-] Classes/inheritance?


