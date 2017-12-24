# Internal Dictionary Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L17">[src]</a></div>

## `sto`
stores a value in the dictionary

( [A] {string|atom} -> )

```
f♭> [ dup * ] "sqr" sto
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L30">[src]</a></div>

## `rcl`
recalls a value in the dictionary

( {string|atom} -> [A] )

```
f♭> "sqr" rcl
[ [ dup * ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L52">[src]</a></div>

## `delete`
deletes a defined word

( {string|atom} -> )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L69">[src]</a></div>

## `use`

Move the contents of a map into scope

( {string|atom} -> )

```
f♭> core: use
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L88">[src]</a></div>

## `define`
defines a set of words from an object

( {object} -> )

```
f♭> { sqr: "dup *" } define
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L110">[src]</a></div>

## `expand`
expand a quote

( [A] -> [a b c])

```
f♭> [ sqr ] expand
[ [ dup * ] ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L125">[src]</a></div>

## `see`
recalls the definition of a word as a formatted string

( {string|atom} -> {string} )

```
f♭> "sqr" see
[ '[ dup * ]' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L140">[src]</a></div>

## `words`
returns a list of defined words

( -> {array} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L157">[src]</a></div>

## `locals`
returns a list of locals words

( -> {array} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L167">[src]</a></div>

## `locals`
returns a list of local scoped words

( -> {array} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L177">[src]</a></div>

## `rewrite`
rewrites an expression using a set of rewrite rules

( {object} {express} -> {expression} )
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/dict.ts#L187">[src]</a></div>
