# Dictionary / Locals

Unlike many other languages, f♭ does not have a concept of variables or lambdas.  Like most stack based languages the primary location for value storage is the stack.  f♭ has a write once dictionary for storage of word definitions.  Values within a dictionary cannot be overwritten or deleted. However, using child stacks \(discussed later\) dictionary words can be shadowed. \(similar to JS scoping rules\).

```
f♭> x: [ 123 ] ;
[ ]

f♭> x
[ 123 ]

f♭> x: [ 456 ] ;
Error: Cannot overwrite definition: x
[  ]

f♭> clr [ x: [ 456 ] ; x ] fork x
[ [ 456 ] 123 ]
```

## Word requirements

* Cannot contain a colon \(`:`\) \(special meaning\)
* Cannot start with a period `.`
* Cannot contain white space \(space, new lines, tabs, or comma `,`\).
* Cannot contain brackets \( `(){}[]` \).
* Cannot contain quotes \( '"\` \)
* Cannot be numeric \(starting with a numeric value is ok\)
* Cannot begin with a hash \(`#`\)
* Cannot be a reserved word \(`null`, `true` or `false`\)



