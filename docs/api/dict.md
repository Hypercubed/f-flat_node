# Internal Dictionary Words

## `sto`
stores a value in the dictionary

( [A] {string|atom} -> )

```
f♭> [ dup * ] "sqr" sto
[ ]
```

## `rcl`
recalls a value in the dictionary

( {string|atom} -> [A] )

```
f♭> "sqr" rcl
[ [ dup * ] ]
```

## `delete`
deletes a defined word

( {string|atom} -> )

## `use`

Move teh contents of a dictionary into scope

( {string|atom} -> )

```
f♭> core: rcl use
[ ]
```

## `define`
defines a set of words from an object

( {object} -> )

```
f♭> { sqr: "dup *" } define
[ ]
```

## `expand`
expand a quote

( [A] -> [a b c])

```
f♭> [ sqr ] expand
[ [ dup * ] ]
```

## `see`
recalls the definition of a word as a formatted string

( {string|atom} -> {string} )

```
f♭> "sqr" see
[ '[ dup * ]' ]
```

## `words`
returns a list of defined words

( -> {array} )

## `locals`
returns a list of locals words

( -> {array} )

## `locals`
returns a list of local scoped words

( -> {array} )

## `rewrite`
rewrites an expression using a set of rewrite rules

( {object} {express} -> {expression} )
