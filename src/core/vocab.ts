import { signature, Any } from '@hypercubed/dynamo';

import { ffPrettyPrint, FFlatError, rewrite } from '../utils';
import { dynamo, Sentence, Word, Key, StackValue } from '../types';
import { StackEnv } from '../env';

// todo: convert dictionary of stack values to dictinary of actions
class CreateAction {
  @signature([Word, Key, Sentence])
  words(x: Word | Sentence): Word | Sentence {
    return x;
  }

  @signature()
  array(x: any[]): Sentence {
    return new Sentence(x);
  }

  @signature()
  plainObject(obj: Object) {
    return Object.keys(obj).reduce((p, key) => {
      const n = createAction(obj[key]);
      p[key] = n;
      return p;
    }, {});
  }

  @signature()
  string(x: string): Word {
    return new Word(x);
  }

  // TODO: map
  @signature(Any)
  any(x: any): any {
    return x;
  }
}

const createAction = dynamo.function(CreateAction);

// For all dictionary actions, note:
// * The dictionary is mutable
// * Stack items are immutable

/**
 * # Internal Vocabulary Words
 */
export const dict = {
  /**
   * ## `defer`
   *
   * Stores a value in the dictionary that raises an error when executed.
   * Used to allocate a word before it is used, for example in mutually-recursive
   *
   * ( a: -> )
   *
   * ```
   * f♭> a: defer
   * [ ]
   * ```
   */
  defer(this: StackEnv, lhs: string) {
    try {
      this.dict.set(lhs, undefined);
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
  },

  /**
   * ## `def`
   *
   * stores a definition in the current dictionary
   *
   * ( {string|atom} [A] -> )
   *
   * ```
   * f♭> [ dup * ] "sqr" sto
   * [ ]
   * ```
   */
  def(this: StackEnv, lhs: string, rhs: StackValue) {
    try {
      this.dict.set(lhs, createAction(rhs));
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
  },

  /**
   * ## `use`
   *
   * Move the contents of a map into scope
   * - The map must be a map of strings to global symbols generated by `vocab`
   *
   * ( { ... } -> )
   *
   * ```
   * f♭> { ... } use
   * [ ]
   * ```
   */
  use(this: StackEnv, dict: { [key: string]: StackValue }) {
    try {
      this.dict.useVocab(createAction(dict));
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
  },

  /**
   * ## `vocab`
   *
   * Write the current local vocabulary to the stack
   * - The mreturned value is a map of strings to global symbols generated
   *
   * ( -> { ... })
   *
   * ```
   * f♭> vocab
   * [ { ... } ]
   * ```
   */
  vocab(this: StackEnv) {
    return this.dict.getVocab();
  },

  /**
   * ## `inline`
   *
   * inline a quote, recursively expands defined words to core words
   *
   * ( [A B C] -> [a b c])
   *
   * ```
   * f♭> [ 2 sqr ] inline
   * [ [ 2 dup * ] ]
   * ```
   */
  inline(this: StackEnv, x: Word | Sentence | Key) {
    return this.dict.inline(x);
  },

  /**
   * ## `bind`
   *
   * binds a quote, recursively expands defined words to global symbols
   *
   * ( [A B C] -> [a b c])
   *
   * ```
   * f♭> [ 2 sqr ] bind
   * [ [ 2 sqr ] ]
   * ```
   */
  bind(this: StackEnv, x: Word | Sentence | Key) {
    return this.dict.bind(x);
  },

  /**
   * ## `defined?`
   * returns true if the word is defined in the current vocabulary
   *
   * ( 'a' -> bool )
   *
   * ```
   * f♭> 'sqr' defined?
   * [ true ]
   * ```
   */
  'defined?'(this: StackEnv, a: string) {
    try {
      const r = this.dict.get(a);
      return typeof r !== 'undefined';
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
  },

  /**
   * ## `see`
   *
   * recalls the definition of a word as a string
   *
   * ( {string|atom} -> {string} )
   *
   * ```
   * f♭> 'sqr' see
   * [ '[ dup * ]' ]
   * ```
   */
  see(this: StackEnv, a: string) {
    try {
      const r = this.dict.get(a);
      if (typeof r === 'undefined') {
        return null;
      }
      return ffPrettyPrint.stringify(r);
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
  },

  /**
   * ## `show`
   *
   * prints the definition of a word as a formatted string
   *
   * ( {string|atom} -> {string} )
   *
   * ```
   * f♭> "sqr" show
   * [ '[ dup * ]' ]
   * ```
   */
  show(this: StackEnv, a: string) {
    try {
      const r = this.dict.get(a);
      return console.log(ffPrettyPrint.color(r));
    } catch (e) {
      throw new FFlatError(e.message, this);
    }
  },

  /**
   * ## `words`
   *
   * returns a list of defined words
   *
   * ( -> {array} )
   */
  words(this: StackEnv): string[] {
    return this.dict.words();
  },

  /**
   * ## `locals`
   *
   * returns a list of locals words
   *
   * ( -> {array} )
   */
  locals(this: StackEnv): string[] {
    return this.dict.localWords();
  },

  /**
   * ## `scoped`
   *
   * returns a list of local scoped words
   *
   * ( -> {array} )
   */
  scoped(this: StackEnv): string[] {
    return this.dict.scopedWords();
  },

  /**
   * ## `rewrite`
   *
   * rewrites an expression using a set of rewrite rules
   *
   * ( {expression} {object} -> {expression} )
   *
   */
  rewrite(this: StackEnv, rules: Object, a: string) {
    return rewrite(a, rules);
  }
};
