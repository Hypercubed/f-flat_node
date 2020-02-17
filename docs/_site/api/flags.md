# Internal Flags
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/flags.ts#L8">[src]</a></div>

## `set-system-property`

sets a system level flag
- flags: `'auto-undo'`, `'log-level'`, `'decimal-precision'`

( x y -> )


```
f♭> 'log-level' 'trace' set-system-property
[ ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/flags.ts#L25">[src]</a></div>

## `get-system-property`

gets a system level flag
- flags: `'auto-undo'`, `'log-level'`, `'decimal-precision'`

( x -> y )

```
f♭> 'log-level' get-system-property
[ 'warn' ]
```
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/flags.ts#L54">[src]</a></div>
