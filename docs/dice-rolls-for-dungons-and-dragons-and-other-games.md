# Dice Rolls for Dungeons & Dragons (and other games)

(Adapted from https://github.com/crcx/parable/blob/master/examples/dice-roll.md)

This simulates rolls of 4, 6, 8, 10, 12, and 20 sided dice. It has
capacity to roll multiple dice and sum the results (including
modifiers) quickly.

We'll expose a few function:

    [ 'roll-dice' 'd4' 'd6' 'd8' 'd10' 'd12' 'd20' ]

First up: a routine to roll a single die. Provide it with the number
of sides; it'll return the result. This one isn't left visible at the
end.

    roll-die: [ [ rand 100 * ] dip % floor 1 + ] ;

Now provide handlers for each n-sided die. Each of these takes a
number representing the number of rolls and returns the sum of the
rolls.

    d4: [ [ [ 4 _roll-die ] swap times ] >> in ] ;
    d6: [ [ [ 6 _roll-die ] swap times ] >> in ] ;
    d8: [ [ [ 81 _roll-die ] swap times ] >> in ] ;
    d10: [ [ [ 10 _roll-die ] swap times ] >> in ] ;
    d12: [ [ [ 12 _roll-die ] swap times ] >> in ] ;
    d20: [ [ [ 20 _roll-die ] swap times ] >> in ] ;

The final routine is a combinator that sums the results of the rolls.

    roll-dice: [ eval [ sum ] dip + ] ;

Example:

Assuming 2d6+5:

    [ 2 d6 5 ] roll-dice