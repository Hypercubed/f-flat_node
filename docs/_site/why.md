# Why F♭

## Why Concatenative Programming Matters

For a great explaination please see Jon Purdy's [Why Concatenative Programming Matters](http://evincarofautumn.blogspot.com/2012/02/why-concatenative-programming-matters.html).

In summary \(all derived from the above\):

* function composition instead of function application
* data flows in the order the functions are written in
* return multiple values from a function, not just tuples
* a parallel compiler is a plain old map-reduce \(like Unix pipes\)
* It’s a stack
* most language VMs are essentially concatenative

## Why stack-based

The primary use case for F♭ at this time is in an interactive REPL. RPN \(and post-fix\) based calculators were \(are?\) popular among engineers and scientists because they are simpler to understand the effects of each action.  If you are simply trying to calculate the value of of an equations \(for example `(-b + sqrt(b^2 - 4*a*c)) / 2a` this can be done on any modern calculator \(or computer\) without  any understanding of the order of operations.  However, I would argue, if you are doing complex calculations it is better to perform the calculation step by step with with feedback verifying your intent.

## Why F♭ is interesting

### Post-fix... really!

One of the best things \(or worse things if you're so inclined\) about stack based languages is post fix notation over the mixed bag of infix, prefix, and postfix you see in may languages.  For example, is this infix or postfix?

```js
[1 2 3].map((x) => sin(2 * x * PI));
```

I count all three!  In a post-fix language we write:

```forth
[1 2 3] [ 2 * pi * sin ] map
```

Not only is it shorter but it is all postfix... in fact it is consistently Subject-Verb \(or Subject-Object-Verb\).  Also notice we didn't need to choose a name for the temperary variable `x`.

But look at how definitions are defined in [Joy](https://hypercubed.github.io/joy/joy.html) (the grand father of concatenative languages):

```
DEFINE tps == 2 * PI * sin .
```

This deviates from the Subject\(s\)-Verb paradigm.  In F♭ we could define words like:

```
tps: [ pi * sin ] def
```

Again we are postfix following Subject-Object-Verb.

### Flat...

F♭ is, well, flat.  Except for possibly the various brackets \(for example \(`(` and `)`\) F♭ has no block structures. In fact, under the hood, the bracket themselves work like any other word.  The `(` pushes a "quote" symbol onto the stack, then '\)' collects all elements up to the last "quote" and places the results onto the stack as a list.

### Hierarchical Write once, read many dictionary

No concatinative language is complete without a dictionary of words.  This dictionary, however, could be abused.  Storing values inside the dictionary has the very real drawback of causing side effects.  One way around this is that in F♭ the dictionary is write once.  Definitions cannot be overwritten in the locals dictionary.  This may seam to cause issues with name collisions, however, the F♭ dictionaries are hierarchical \(or scoped\) that allow for shadowing, much like scoping rules in JavaScript.

### Immutability

All items on the stack or in the dictionary are immutable using [structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2) at the object and array level.  This avoids unwanted side effects, makes object stores memory efficient, and enables easy back tracings (calculations can be undone).

### Arbitrary-precision decimal and complex number types

Internally, numeric values in are stored as arbitrary-precision integers, floats, and complex values.  This allows for some interesting numerical capabilities.

### JSON format is a valid f-flat programs

Using a few internal and defined words JSON file are valid f-flat programs.  F♭ is able to parse a superset of JSON.  The following is valid input to F♭:

```
{
  foo: 'bar',
  while: true,
  nothing: null,
  here: "is another",
  half: 0.5,
  to: Infinity,
  finally: 'a trailing comma',
  oh: [
   "we shouldn't forget",
   'arrays can have',
   'trailing commas too', ],
}
```



