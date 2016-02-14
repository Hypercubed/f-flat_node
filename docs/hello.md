


```
f♭> "Hello, world!" println
Hello, world!
[]
```

```
f♭> ["Hello, world!" println] eval
Hello, world!
[]
```

```
f♭> ["Hello, world!" println] "hi" def
[]

f♭> hi
Hello, world!
[]
```

```
f♭> [ "Hello, " swap + "!" + println ] "hito" def
[]

f♭> "world" hi2
Hello, world!
[]
```

```
f♭> [ [ hito ] * eval ] "hiall" def
[]

f♭> ["world" "everyone"] hiall
Hello, world!
Hello, everyone!
```
