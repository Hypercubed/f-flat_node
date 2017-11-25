# Todo list

_\( managed using [todo-md](https://github.com/Hypercubed/todo-md) \)_

# Bugs

- Zero math, ComplexInfinity, Indeterminate, Undefined (http://www.wolframalpha.com/input/?i=ComplexInfinity)
  - [x] 1 0 / = -1 0 / --> ComplexInfinity
  - [ ] ComplexInfinity 2 + --> ComplexInfinity
  - [ ] \ComplexInfinity / ComplexInfinity --> Indeterminate
  - [ ] ComplexInfinity sin --> Indeterminate
  - [ ] ComplexInfinity asin --> pi / 2
  - [ ] 1 ComplexInfinity / --> 0
  - [x] 1 infinity / --> 0
  - [ ] infinity / 0 --> ComplexInfinity
  - [ ] infinity / infinity --> undefined
  - [ ] 0 0 / --> undefined
  - [ ] 0 0 ^ --> undefined

# Todo next:

- [ ] More tests for stack object immutablity
- [ ] Use URLs as module id
- [ ] Better types
  - [ ] Just -> ReturnValue
  - [ ] Seq -> ReturnSequence
  - [ ] Action -> Words / Sentence
- [ ] Test all internal words
- [ ] Test `usr.ff` and cwd

# Todo:

- [ ] Trig functions on complex
  - [x] sin, cos, tan
  - [x] sinh, cosh, tanh
  - [x] asin, acos, atan
  - [x] asin, acos with real values > 1 are complex
  - [ ] asin and acos of complex infinities
- [ ] Replace decimal.js?
- [ ] Ratios
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