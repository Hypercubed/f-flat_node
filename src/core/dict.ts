import is from '@sindresorhus/is';
import { thaw, freeze } from 'icepick';

import { formatValue } from '../utils';
import { Action, Just } from '../types';
import { USE_STRICT } from '../constants';
import { StackEnv } from '../env';

const cloneDeep = require('clone-deep');

// For all deictionay actions, note:
// * The dictionary is mutable
// * Stack items are immutable

export const dict = {
  /**
    ## `sto`
    stores a value in the dictionary

    ( [A] {string|atom} -> )

    ```
    f♭> [ dup * ] "sqr" sto
    [ ]
    ```
  **/
  sto(this: StackEnv, lhs, rhs) {
    this.dict.set(rhs, cloneDeep(lhs));
  },

  /**
    ## `rcl`
    recalls a value in the dictionary

    ( {string|atom} -> [A] )

    ```
    f♭> "sqr" rcl
    [ [ dup * ] ]
    ```
  **/
  rcl(this: StackEnv, a) {
    const r = this.dict.get(a);
    if (typeof r === 'undefined') {
      return null;
    }
    if (USE_STRICT && is.function_(r)) { // carefull pushing functions to stack, watch immutability
      return new Action(r);
    }
    return Action.isAction(r) ? new Just(r) : freeze(cloneDeep(r));
  },

  /**
    ## `delete`
    deletes a defined word

    ( {string|atom} -> )
  **/
  delete(this: StackEnv, path) {
    this.dict.delete(path);
  },

  /**
    ## `defineParent`
    defines a word (or dict) in the parent

    ( {string|atom} -> )
  **/
  defineParent(this: StackEnv, name, fn) {
    fn = thaw(fn);
    if (this.parent) {
      this.parent.defineAction(name, fn);
    }
  },

  /**
      ## `define`
      defines a set of words from an object

      ( {object} -> )

      ```
      f♭> { sqr: "dup *" } define
      [ ]
      ```
    **/
  define(this: StackEnv, x) {
    this.defineAction(cloneDeep(thaw(x)));
  },

  /**
      ## `expand`
      expand a quote

      ( [A] -> [a b c])

      ```
      f♭> [ sqr ] expand
      [ [ dup * ] ]
      ```
    **/
  expand(this: StackEnv, x) {
    return this.expandAction(x);
  },

  /**
      ## `see`
      recalls the definition of a word as a formatted string

      ( {string|atom} -> {string} )

      ```
      f♭> "sqr" see
      [ '[ dup * ]' ]
      ```
    **/
  see(this: StackEnv, a) {
    const r = this.dict.get(a);
    if (typeof r === 'undefined') {
      return null;
    }
    return formatValue(r.value || r, 0, { colors: false, indent: false });
  },

  /**
          ## `words`
          returns a list of defined words
          ( -> {array} )
        **/
  words(this: StackEnv) {
    return this.dict.allKeys();
  },

  /**
        ## `locals`
        returns a list of locals words
        ( -> {array} )
      **/
  locals(this: StackEnv) {
    return this.dict.keys();
  },

  /**
        ## `dict`
        returns the local dictionary
        ( -> {array} )
      **/
  dict(this: StackEnv) {
    return freeze(this.dict.toObject());
  }
};
