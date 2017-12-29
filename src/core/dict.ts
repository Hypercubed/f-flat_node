import { assocIn, getIn } from 'icepick';
import is from '@sindresorhus/is';

import { formatValue, FFlatError } from '../utils';
import { Sentence, Word, Just, StackValue } from '../types';
import { USE_STRICT } from '../constants';
import { StackEnv } from '../env';
import { rewrite } from '../utils/rewrite';

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
    if (['true', 'false', 'null', 'nan'].includes(rhs)) {
      throw new FFlatError('Cannot overwrite reserved words', this);
    }
    try {
      this.dict.set(rhs, lhs);
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
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
    if (!USE_STRICT && is.function_(r)) { // carefull pushing functions to stack, watch immutability
      return new Just(new Word(<any>r)); // hack
    }
    return (r instanceof Word || r instanceof Sentence) ? new Just(r) : r;
  },

  /**
   * ## `delete`
   * deletes a defined word
   *
   * ( {string|atom} -> )
   */
  delete(this: StackEnv, path: string) {
    try {
      this.dict.delete(path);
    } catch (e) {
      throw new FFlatError(e, this);
    }
  },

  /**
   * ## `use`
   *
   * Move the contents of a map into scope
   *
   * ( {string|atom} -> )
   *
   * ```
   * f♭> core: use
   * [ ]
   * ```
   */
  use(this: StackEnv, dict: any) {
    /* if (dict instanceof Word) {
      dict = this.dict.get(dict.value);
    }
    if (typeof dict === 'string') {
      dict = this.dict.get(dict);
    } */
    Object.assign(this.dict.scope, dict);
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
  expand(this: StackEnv, x: Word | Sentence) {
    return rewrite(this.dict.locals, x);
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
    if (r instanceof Word || r instanceof Sentence) {
      return r.displayString;
    }
    return formatValue(r, 0, { colors: false, indent: false });
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
   * ## `locals`
   * returns a list of local scoped words
   *
   * ( -> {array} )
   */
  scoped(this: StackEnv): string[] {
    return Object.keys(this.dict.scope);
  },

  /**
   * ## `rewrite`
   * rewrites an expression using a set of rewrite rules
   *
   * ( {object} {express} -> {expression} )
   */
  rewrite
};

