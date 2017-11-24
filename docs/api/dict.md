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

## `defineParent`
defines a word (or dict) in the parent

( {string|atom} -> )

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

## `dict`
returns the local dictionary

( -> {array} )
