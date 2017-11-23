import is from '@sindresorhus/is';

import { formatValue } from '../utils';
import { Action, Just, StackValue } from '../types';
import { USE_STRICT } from '../constants';
import { StackEnv } from '../env';

// For all deictionay actions, note:
// * The dictionary is mutable
// * Stack items are immutable

/**
 * # Internal Dictionary Words
 */
export const dict = {
  /**
   * ## `sto`
   * stores a value in the dictionary
   *
   * ( [A] {string|atom} -> )
   *
   * ```
   * f♭> [ dup * ] "sqr" sto
   * [ ]
   * ```
   */
  sto(this: StackEnv, lhs: StackValue, rhs: string) {
    this.dict.set(rhs, lhs);
  },

  /**
   * ## `rcl`
   * recalls a value in the dictionary
   *
   * ( {string|atom} -> [A] )
   *
   * ```
   * f♭> "sqr" rcl
   * [ [ dup * ] ]
   * ```
   */
  rcl(this: StackEnv, a) {
    const r = this.dict.get(a);
    if (typeof r === 'undefined') {
      return null;
    }
    if (USE_STRICT && is.function_(r)) { // carefull pushing functions to stack, watch immutability
      return new Action(r);
    }
    return r instanceof Action ? new Just(r) : r;
  },

  /**
   * ## `delete`
   * deletes a defined word
   *
   * ( {string|atom} -> )
   */
  delete(this: StackEnv, path: string) {
    this.dict.delete(path);
  },

  /**
   * ## `defineParent`
   * defines a word (or dict) in the parent
   *
   * ( {string|atom} -> )
   */
  defineParent(this: StackEnv, name: string, fn: StackValue) {
    if (this.parent) {
      this.parent.defineAction(name, fn);
    }
  },

  using(this: StackEnv, name: string) {
    const r = this.dict.get(name);
    Object.assign(this.dict.using, r);
  },

  /**
   * ## `define`
   * defines a set of words from an object
   *
   * ( {object} -> )
   *
   * ```
   * f♭> { sqr: "dup *" } define
   * [ ]
   * ```
   */
  define(this: StackEnv, x: StackValue) {
    this.defineAction(x);
  },

  /**
   * ## `expand`
   * expand a quote
   *
   * ( [A] -> [a b c])
   *
   * ```
   * f♭> [ sqr ] expand
   * [ [ dup * ] ]
   * ```
   */
  expand(this: StackEnv, x: Action) {
    return this.expandAction(x);
  },

  /**
   * ## `see`
   * recalls the definition of a word as a formatted string
   *
   * ( {string|atom} -> {string} )
   *
   * ```
   * f♭> "sqr" see
   * [ '[ dup * ]' ]
   * ```
   */
  see(this: StackEnv, a: string) {
    const r = this.dict.get(a);
    if (typeof r === 'undefined') {
      return null;
    }
    return formatValue((r as Action).value || r, 0, { colors: false, indent: false });
  },

  /**
   * ## `words`
   * returns a list of defined words
   *
   * ( -> {array} )
   */
  words(this: StackEnv): string[] {
    return this.dict.allKeys();
  },

  /**
   * ## `locals`
   * returns a list of locals words
   *
   * ( -> {array} )
   */
  locals(this: StackEnv): string[] {
    return this.dict.keys();
  },

  /**
   * ## `dict`
   * returns the local dictionary
   *
   * ( -> {array} )
   */
  dict(this: StackEnv): {} {
    return this.dict.toObject();
  }
};
