# Todo list

_\( managed using [todo-md](https://github.com/Hypercubed/todo-md) \)_

# Bugs

- [ ] 1 acos = 0 (precision issue)
- [ ] precision in complex calculations (on print)
- [ ] ComplexInfinity, Indeterminate, Undefined (http://www.wolframalpha.com/input/?i=ComplexInfinity)
- [ ] @ for out of range works differently on string and array
- [x] `{} {} =` returns false
- [x] `nan nan =` returns false
- [x] should be able sto store null
- [x] Should support prefix positive numbers (`+10`).
- [x] Should support using underscore as a sperator: `10_000_000`.
- [ ] Don't allow `+-` values (i.e. `+-1000`)

# Todo next:

- [ ] More tests for stack object immutablity
- [x] Use URLs as module id
- [ ] Better types
  - [ ] Just -> ReturnValue
  - [ ] Seq -> ReturnSequence
  - [ ] Action -> Words / Sentence
- [ ] Test all internal words
  - [ ] Dictionary words
- [ ] Test `usr.ff` and cwd
- [ ] JSON
  - [ ] .toJSON6() ?
  - [ ] to approx JSON (Decimal -> number, etc)
  - [ ] Decimal/Complex .fromJSON + Tests
- [ ] rewrite should also rewrite sequences `dup drop` -> ``

# New Words

- [ ] `fld`, `cld`: https://docs.julialang.org/en/stable/stdlib/math/#Base.fld
- [ ] `isfinite?`, `isinf?`, `isnan?`
- [ ] `sign`, `ispos?`, `isneg?`
- [ ] `>>` and `>>>` ?
- [ ] `sinpi`, `cospi`?
- [x] `conj`
- [ ] `"1+2i" complex` -> Complex
- [ ] `clamp`, `scale`
- [ ] radians -> rads-per-degree, etc. ?
- [ ] rename expand to lift?

# Docs

- [x] REPL intro
- [ ] "compile" (expand)
- [ ] Module loader, expanding functions, circular references.
- [ ] Defined words
- [ ] Child stacks, forks, etc.
- [ ] Async
- [ ] Dictionary "scope"

# Todo:

- [ ] Improve errors (FF errors should not have a JS stack)
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
  - [ ] Pretty printing complex values: '5e-20+2i' -> '2i'
- [ ] Investigate alternatives to decimal.js? Rational Numbers?
- [ ] Pool children env?
- [ ] Use child process/web workers for children?
- [ ] Separate state from environment and engine?
- [ ] IO Class?
- [ ] Session saving
- [x] modules/name spaces/named imports
- [x] Undo history
  - [x] undo
  - [ ] redo?
- [ ] better stack printing
- [x] better trace
- [-] bubble errors up from children (currently in: swallows errors)
- [ ] JSON Serialize
  - [ ] Nan, Infinity, etc.
  - [x] BigNumber, Complex
  - [ ] actions, 
  - [ ] Dates
- [ ] Dates
  - [ ] More date base operations
  - [ ] Add Duration type... example: https://github.com/moment/moment/blob/develop/src/lib/duration/constructor.js
- Improved `@`
  - [ ] [ ... ] [ x y z ] @ => [ ... ][x][y][z]
  - [ ] { ... } 'x.y.z' @ => [ ... ][x][y][z]
  - [ ] JS FFI?
- [ ] Private/Protected words?  Globals/parent scoped?
- [ ] Preserved presision (2.50 vs 2.5)?
- [ ] Pattern matching ???