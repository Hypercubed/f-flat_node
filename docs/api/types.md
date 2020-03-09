# Internal Type Words
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L113">[src]</a></div>

## `type`

`a -> str`

retruns the type of an item

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L123">[src]</a></div>

## `number`

`a -> x`

converts to a number

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L133">[src]</a></div>

## `complex`

`a -> z`

converts to a complex number

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L143">[src]</a></div>

## `string`

converts to a string

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L153">[src]</a></div>

## `itoa`

`x -> str`

returns a string created from UTF-16 character code

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L163">[src]</a></div>

## `atoi`

`str -> x`

returns an integer between 0 and 65535 representing the UTF-16 code of the first character of a string

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L173">[src]</a></div>

## `atob`

`str -> str`

decodes a string of data which has been encoded using base-64 encoding

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L183">[src]</a></div>

## `btoa`

`str -> str`

creates a base-64 encoded ASCII string from a String

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L193">[src]</a></div>

## `hash`

`a -> x`

creates a numeric hash from a String

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L203">[src]</a></div>

## `hex-hash`

`a -> str`

creates a hexidecimal hash from a String

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L213">[src]</a></div>

## `base`

`x -> str`

Convert an integer to a string in the given base

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L223">[src]</a></div>

## `boolean`

`a -> bool`

converts a value to a boolean

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L233">[src]</a></div>

## `:` (key)

`a -> a:`

converts a string to a key

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L246">[src]</a></div>

## `array`

`a -> [A]`

converts a value to an array

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L274">[src]</a></div>

## `of`

`a b -> c`

converts the rhs value to the type of the lhs

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L284">[src]</a></div>

## `is?`

`a b -> bool`

returns true if to values are the same value

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L306">[src]</a></div>

## `nothing?`

`a -> bool`

returns true if the value is null or undefined

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L316">[src]</a></div>

## `date`

`a -> date`

convert a value to a date/time

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L326">[src]</a></div>

## `now`

`-> date`

returns the current date/time

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L336">[src]</a></div>

## `clock`

`-> x`

returns a high resoltion time elapsed

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L346">[src]</a></div>

## `regexp`

`a -> regexp`

convert string to regular expresion

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/types.ts#L356">[src]</a></div>
