# Introduction

## Get F♭

F♭ code can be found at https://github.com/Hypercubed/f-flat_node.  Currently, it can be only be used by cloning the github repo.

```bash
git clone https://github.com/Hypercubed/f-flat_node.git
cd f-flat_node
npm install
npm start
```

## Guiding principles

- interactive first
  - minimal hidden state
  - easy to type and read
  - reads left to right, top to bottom
  - whitespace not significant syntax
  - no lambdas/parameters
  - interactive development
- flat concatenative language
  - name code not values
  - multiple return values
  - concatenation is composition/pipeline style
  - no unnecessary parentheses.
- no surprises (Principle of "least astonishment")
  - immutable data
  - decimal and complex numbers
  - percent values
  - both double and single quotes
  - no order of operations (RPN)
- state is serializable
- Use common work-flow in Forth-like languages: <sup>[Read-Eval-Print-λove]</sup>
  - Write some code to perform a task
  - Identify some fragment that might be generally useful
  - Extract it and give it a name
  - Replace the relevant bits with the new word
  - Factor when:
    - complexity tickles your conscious limits
    - you’re able to elucidate a name for something
    - at the point when you feel that you need a comment
    - the moment you start repeating yourself
    - when you need to hide detail
    - when your command set (API) grows too large
    - Don’t factor idioms

