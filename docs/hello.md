


```
f♭> "Hello, world!" println
Hello, world!
[  ]

f♭> ["Hello, world!" println] eval
Hello, world!
[  ]

f♭> hi: ["Hello, world!" println] ;
[  ]

f♭> hi
Hello, world!
[  ]

f♭> hi2: [ "Hello, " swap + "!" + println ] ;
[  ]

f♭> "world" hi2
Hello, world!
[  ]

f♭> hiall: [ hi2: * eval ] ;
[  ]

f♭> ["world" "everyone"] hiall
Hello, world!
Hello, everyone!
```
