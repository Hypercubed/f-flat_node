# Todo list

_\( managed using [todo-md](https://github.com/Hypercubed/todo-md) \)_

# Bugs

- [ ] 1 acos = 0 (precision issue)
- [ ] precision in complex calculations
- [ ] ComplexInfinity, Indeterminate, Undefined (http://www.wolframalpha.com/input/?i=ComplexInfinity)
- [ ] @ for out of rang works differently on string and array
- [x] `{} {} =` returns false
- [x] `nan nan =` returns false
- [ ] should eb able sto store null

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
- [ ] BigNumber/Complex .fromJSON

# New Words

- [ ] fld, cld: https://docs.julialang.org/en/stable/stdlib/math/#Base.fld
- [ ] isfinite, isinf, isnan
- [ ] sign, ispos, isneg
- [ ]  >> and >>> ?
- [ ] sinpi, cospi?
- [x] conj
- [ ] `"1+2i" complex` -> Complex

# Docs

- [ ] REPL intro
- [ ] "complile"
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
  - [ ] shorthand for complex values? i.e. '1+2i'?
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
  - [ ] BigNumber, actions, Complex
- [ ] Dates
  - [ ] More date base operations
  - [ ] Add Duration type... example: https://github.com/moment/moment/blob/develop/src/lib/duration/constructor.js
- Improved `@`
  - [ ] [ ... ] [ x y z ] @ => [ ... ][x][y][z]
  - [ ] { ... } 'x.y.z' @ => [ ... ][x][y][z]
  - [ ] JS FFI?