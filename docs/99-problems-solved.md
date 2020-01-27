# 99 Problems (solved) in F-Flat

[based on 99 Problems (solved) in OCaml](https://ocaml.org/learn/tutorials/99problems.html)

## Working with lists

1. Find the last element of a list.

```
f♭> [ 'a' 'b' 'c' 'd' ] -1 @
[ 'd' ]
```

2. Find the last but one (last and penultimate) elements of a list.

```
f♭> [ 'a' 'b' 'c' 'd' ] -2 %
[ [ 'c' 'd' ] ]
```

3. Find the k'th element of a list.

```
f♭> [ 'a' 'b' 'c' 'd' ] 2 @
[ 'c' ]
```

4. Find the number of elements of a list.

```
f♭> [ 'a' 'b' 'c' 'd' ] ln
[ 4 ]
```

5. Reverse a list.

```
f♭> [ 'a' 'b' 'c' 'd' ] reverse
[ [ 'd' 'c' 'b' 'a' ] ]
```

Definition of `reverse`:

```
xxs: [ [ first ] [ rest ] bi ] ;
reverse: [ dup ln 1 <= [  ] [ xxs reverse swap + ] branch ] ;
```

6. Find out whether a list is a palindrome.

```
f♭> [ 'r' 'a' 'c' 'e' 'c' 'a' 'r' ] dup reverse =
[ true ]
```

7. Flatten a nested list structure.

```
f♭> [ 'a' [ 'b' [ 'c' 'd' ] 'e' ] ] flatten
['a' 'b' 'c' 'd' 'e']
```

Definition of flatten:

```
flatten*: [
  dup array?
  [ [ flatten* ] each ]
  when
] ;
flatten: [ [ flatten* ] appl ] ;
```

8. Eliminate consecutive duplicates of list elements.

```
f♭> ['a' 'a' 'a' 'a' 'b' 'c' 'c' 'a' 'a' 'd' 'e' 'e' 'e' 'e'] compress
['a' 'b' 'c' 'a' 'd' 'e']
```

Definition of compress:

```
compress*: [
  dup ln 0 >
  [
    xxs
    [ 
      dup2 =
      [ drop ]
      when
    ]
    dip
    compress*
  ]
  [ drop ]
  branch
] ;
compress: [ [ xxs compress* ] appl ] ;
```

9. Pack consecutive duplicates of list elements into sublists.

10. Run-length encoding of a list.

11. Modified run-length encoding.

12. Decode a run-length encoded list.

```
f♭> [ [ 4 'a' ] 'b' [ 2 'c' ] [ 2 'a' ] 'd' [ 4 'e' ] ] decode
[ [ 'a' 'a' 'a' 'a' 'b' 'c' 'c' 'a' 'a' 'd' 'e' 'e' 'e' 'e' ] ]
```

Definition of decode:

```
decode: [
  dup array?
  [ xxs swap * eval ]
  when
] ;
decode: [ [ decode* ] map ] ;
```

13. Run-length encoding of a list (direct solution).

14. Duplicate the elements of a list.

```
f♭> [ 'a' 'b' 'c' 'c' 'd' ] [ dup ] map
[ [ 'd' 'c' 'b' 'a' ] ]
```

15. Replicate the elements of a list a given number of times.

```
f♭> [ 'a' 'b' 'c' 'c' 'd' ] 3 [ [ dup ] swap times ] >> map
[ [ 'a'
    'a'
    'a'
    'a'
    'b'
    'b'
    'b'
    'b'
    'c'
    'c'
    'c'
    'c'
    'c'
    'c'
    'c'
    'c'
    'd'
    'd'
    'd'
    'd' ] ]
```

16. Drop every N'th element from a list.

17. Split a list into two parts; the length of the first part is given.

```
f♭> ['a' 'b' 'c' 'd' 'e' 'f' 'g' 'h' 'i' 'j'] 3 /
[ [ 'a' 'b' 'c' ] [ 'd' 'e' 'f' 'g' 'h' 'i' 'j' ] ]
```

18. Extract a slice from a list.

```
f♭> ['a' 'b' 'c' 'd' 'e' 'f' 'g' 'h' 'i' 'j'] 2 6 slice
[ [ 'c' 'd' 'e' 'f' ] ]
```

19. Rotate a list N places to the left.

```
f♭> ['a' 'b' 'c' 'd' 'e' 'f' 'g' 'h' 'i' 'j'] 3 / swap +
[ [ 'd' 'e' 'f' 'g' 'h' 'i' 'j' 'a' 'b' 'c' ] ]
```

20. Remove the K'th element from a list.

```
f♭> ['a' 'b' 'c' 'd'] 1 / shift +
[ [ 'a' 'c' 'd' ] ]
```

21. Insert an element at a given position into a list.

```
f♭> ['a' 'b' 'c' 'd'] 1 'alfa' [ / ] dip swap >> +
[ [ 'a' 'alfa' 'b' 'c' 'd' ] ]
```

22. Create a list containing all integers within a given range.

```
f♭> 4 9 range
[ [ 4 5 6 7 8 9 ] ]
```

Defn:

```
range*: [ over over < [ countup ] [ countdown ] branch repn ] ;
range: [ [ range* ] >> appl ] ;
```

23. Extract a given number of randomly selected elements from a list. 

24. Lotto: Draw N different random numbers from the set 1..M.

25. Generate a random permutation of the elements of a list.

26. Generate the combinations of K distinct objects chosen from the N elements of a list.

27. Group the elements of a set into disjoint subsets. 

28. Sorting a list of lists according to length of sublists. 

## Arithmetic

31. Determine whether a given integer number is prime.

```
f♭> 7 prime*?
[ true ]
```

defn:

```
prime?*: [ 2 [ dup2 2 ^ > [ dup2 % 0 > ] dip swap * ] [ ++ ] while 2 ^ < ] ;
```

32. Determine the greatest common divisor of two positive integer numbers.

```
f♭> 20536 7826 gcd
[ 2 ]
```

Defn:

```
gcd: [ [ dup 0 > ] [ dup bury % ] while drop ] ;
```

33. Determine whether two positive integer numbers are coprime.

```
f♭> 20536 7826 gcd 1 =
[ false ]
```

34. Calculate Euler's totient function φ(m).

```
f♭> 10 totient
[ 4 ]
```

Defns:

```
coprime?: [ gcd 1 = ] ;
totient: [ dup integers swap [ coprime? ] >> filter length ] ;
```

35. Determine the prime factors of a given positive integer.

```
f♭> 315 factors
[ [ 3 3 5 7 ] ]
```

Defn:

```
factors: [ 
  [ 
    2
    [ dup2 2 ^ > ]
    [
      dup2 divisor?
      [ tuck / over ]
      [ next-odd ]
      branch 
    ] while drop
  ] appl 
] ;
```

36. Determine the prime factors of a given positive integer (2).

37. Calculate Euler's totient function φ(m) (improved).

38. Compare the two methods of calculating Euler's totient function.

```
f♭> [ 10090 phi ] timefn
'6.578947368421052 ops/sec'
f♭> [ 10090 phi-improved ] timefn
'8.771929824561404 ops/sec'
```

39. A list of prime numbers.

40. Goldbach's conjecture.

41. A list of Goldbach compositions.

## Logic and Codes

46. Truth tables for logical expressions (2 variables).

48. Truth tables for logical expressions.

49. Gray code.

50. Huffman code




