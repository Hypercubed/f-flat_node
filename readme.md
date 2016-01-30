# F♭

F♭ (pronounced F-flat) is a toy language. F♭ is a dynamically typed array-oriented concatenative language like Forth and Joy. F♭ is meant to be used interactively, for example in a CLI REPL or in a stack based calculator, like R or the command shell.  This constraint dictates many of the language features.

## Project Goals

* interactive first
  * minimal hidden state
  * easy to type and read
  * reads left to right, top to bottom
  * no lambdas/parameters
* flat language
* no surprises
  * decimal and complex numbers
  * both double and single quotes
  * returns error objects
* pure functions
* immutable data
* host foreign function interface
* Session saving (TBD)
  * undo/redo
  * state is serializable

## Influences

* Forth
* HP RPL
* Joy
* XY
* Haskell
* JavaScript

## License

MIT
