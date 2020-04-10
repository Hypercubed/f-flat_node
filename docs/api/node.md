# Internal Words for Node Environment
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L58">[src]</a></div>

## `args`

`-> [str*]`

Returns an array containing of command line arguments passed when the process was launched
<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L67">[src]</a></div>

## `println`

`a ->`

Prints the value followed by (newline)

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L77">[src]</a></div>

## `print`

`a ->`

Prints the value

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L89">[src]</a></div>

## `exit`

`->`

terminate the process synchronously with an a status code

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L114">[src]</a></div>

## `rand-u32`

`-> x`

Generates cryptographically strong pseudo-random with a givennumber of bytes to generate

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L126">[src]</a></div>

## `dirname`

`str₁ -> str₂`

returns the directory name of a path, similar to the Unix dirname command.
See https://nodejs.org/api/path.html#path_path_dirname_path

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L137">[src]</a></div>

## `path-join`

`[ str* ] -> str`

joins all given path segments together using the platform specific separator as a delimiter
See https://nodejs.org/api/path.html#path_path_join_paths

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L148">[src]</a></div>

## `resolve`

`str₁ -> str₂`

returns a URL href releative to the current base

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L158">[src]</a></div>

## `exists`

`str -> bool`

Returns true if the file exists, false otherwise.

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L168">[src]</a></div>

## `read`

`str₁ -> str₂`

Pushes the content of a file as a utf8 string

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L178">[src]</a></div>

## `cwd`

`-> str`

Pushes the current working directory

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L194">[src]</a></div>

## `get-env`

`str₁ -> str₂`

Gets a environment variable

<div style="text-align: right"><a href="https:/github.com/Hypercubed/f-flat_node/blob/master/src/core/node.ts#L216">[src]</a></div>
