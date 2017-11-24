# Todo list

_\( managed using [todo-md](https://github.com/Hypercubed/todo-md) \)_

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

- [ ] Replace decimal.js?
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
- [ ] Serialize Nan, Infinity, etc.
- [ ] Dates
  - [ ] More date base operations
  - [ ] Add Duration type... example: https://github.com/moment/moment/blob/develop/src/lib/duration/constructor.js
- Improved `@`
  - [ ] [ ... ] [ x y z ] @ => [ ... ][x][y][z]
  - [ ] { ... } 'x.y.z' @ => [ ... ][x][y][z]