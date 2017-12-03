import { freeze, assocIn, getIn } from 'icepick';

import { formatValue, FFlatError } from '../utils';
import { Sentence, Word, Just, StackValue, typed, Seq, Dictionary } from '../types';
import { USE_STRICT, IIF } from '../constants';
import { StackEnv } from '../env';

const is = require('@sindresorhus/is');

const rewrite = typed({
  'Object, Array': (dict: Object, arr: any[]) => {
    return arr
      .reduce((p, i) => {
        const n = rewrite(dict, i);
        n instanceof Seq ?
          p.push(...n.value) :
          p.push(n);
        return p;
      }, []);
  },
  'Object, Decimal': (x, y) => y,
  'Object, null': () => null,
  'Object, Sentence': (dict, action) => {
    const expandedValue = rewrite(dict, action.value);
    const newAction = new Sentence(expandedValue, action.displayString);
    return new Seq([newAction]);
  },
  'Object, Word': (dict, action) => {
    const path = Dictionary.makePath(action.value);
    const value = <StackValue>getIn(dict, path);
    if (is.undefined(value) && (action.value as string)[0] !== IIF) {
      return action;
    }
    if (is.function(value)) {
      return new Seq([action]);
    }
    return rewrite(dict, value);
  },
  'Object, Object': (dict: Object, obj: Object) => {
    return Object.keys(obj)
      .reduce((p, key) => {
        const n = rewrite(dict, obj[key]);
        n instanceof Seq ?
          p[key] = n.value.length === 1 ? n.value[0] : n.value :
          p[key] = n;
        return p;
      }, {});
  },
  'Object, any': (x, y) => y
});

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
    try {
      this.dict.set(rhs, lhs);
    } catch (e) {
      throw new FFlatError(e, this);
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
   * Move teh contents of a dictionary into scope
   *
   * ( {string|atom} -> )
   *
   * ```
   * f♭> core: rcl use
   * [ ]
   * ```
   */
  use(this: StackEnv, dict: {}) {
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

