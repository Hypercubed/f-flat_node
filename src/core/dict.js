import { isFunction } from 'fantasy-helpers/src/is';
import { thaw, freeze } from 'icepick';
import cloneDeep from 'clone-deep';

import { update, pluck, formatValue, eql, arrayRepeat, arrayMul } from '../utils';
import { Seq, Action, typed, I, Just } from '../types';
import { USE_STRICT } from '../constants';

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
  sto(lhs, rhs) {
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
  rcl(a) {
    const r = this.dict.get(a);
    if (typeof r === 'undefined') {
      return null;
    }
    if (USE_STRICT && isFunction(r)) { // carefull pushing functions to stack, watch immutability
      return new Action(r);
    }
    return Action.isAction(r) ? new Just(r) : freeze(cloneDeep(r));
  },

  /**
    ## `delete`
    deletes a defined word

    ( {string|atom} -> )
  **/
  delete(path) {
    this.dict.deleted(path);
  },

  /**
    ## `delete`
    deletes a defined word

    ( {string|atom} -> )
  **/
  defineParent(name, fn) {
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
  define(x) {
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
  expand(x) {
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
  see(a) {
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
  words() {
    return this.dict.allKeys();
  },

  /**
        ## `locals`
        returns a list of locals words
    
        ( -> {array} )
      **/
  locals() {
    return this.dict.keys();
  },

  /**
        ## `dict`
        returns the local dictionary
    
        ( -> {array} )
      **/
  dict() {
    return freeze(this.dict.toObject());
  }
};
