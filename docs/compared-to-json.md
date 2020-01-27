# F♭ is a superset of JSON

By definition of the following words, F♭ is able to parse a superset of JSON.

* `{`      - start a quote
* `}`      - end a quote, convert to hash assuming a list of key value pairs `[ key: value key: value ]`
* `[`      - start a lazy quote
* `]`      - end a lazy quote
* `:`      - convert a string to an key
* `{word}:` - key literal, same as `"{word}" :`

The following

```json
{
  "key": 10,
  "key2": "20"
}
```

is interpreted by F♭ as:

```
{ "key" : 10 "key2" : "20" }
```

in other words:

1. Start a quote
2. Push a string
3. Convert string to a key
4. Push a number
5. Push another string
6. Convert string to a key
7. push a string
8. end the quote and convert to an map assuming a list of key values pairs

resulting in the equivalent of a JavaScript object:

```js
{ key: 10, key2: '20' }
```

However, because this is actually F♭ the syntax is relaxed.

## Both block and line comments are supported

```
/* This is JSON.
   JSON?
   This is F♭! */
{
  "key": 10,     // This is a number
  "key2": "20"   // This is a string
}
```

## Both double, single, and backtick quotes are supported.

```
{
  "key": 10,
  'key2': `20`
}
```

## Commas are whitespace and optional.

```
{
  "key": 10
  'key2': `20`
}
```

## Keys can be strings or words.

Quotes around keys are optional if the key is an word \(no whitespace between the key and colon\)

```
{
  key: 10
  'key2' : `20`
}
```

Colon is optional between key and value if the key is a string.

```
{
  "key" 10
  'key2' `20`
}
```

## Both keys and values can be computed:

```
{
  key: 5 2 *
  "key" 2 + : 10 10 + string
}
```

Including template strings

```
{
  key: 5 2 *
  `key$(1 1 +)` : `$(10 10 +)`
}
```

Including infinity, null, complex and date values:

```
{
  pi: 4 1 atan *
  complex: '2+4i' :complex
  date: '1/1/1990' :date
  nothing: null
  everything: 1 0 /
}
```

results in:

```
{ pi: 3.1415926535897932385
  complex: 2+4i
  date: Mon Jan 01 1990 00:00:00 GMT-0700 (Mountain Standard Time)
  nothing: Null
  everything: ComplexInfinity }
```

## Square brackets are lazy, round brackets are not.

```
{
  a: [ 1 2 + ]
  b: ( 1 2 + )
}
```

results in the object:

```
{
  a: [ 1 2 + ]
  b: [ 3 ]
}
```



