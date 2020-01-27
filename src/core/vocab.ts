import { signature, Any } from '@hypercubed/dynamo';

import { ffPrettyPrint, FFlatError } from '../utils';
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

// For all deictionay actions, note:
// * The dictionary is mutable
// * Stack items are immutable

/**
 * # Internal Dictionary Words
 */
export const dict = {

  /**
   * ## `defer`
   *
   * Stores a value in the dictionary that simply raises an error when executed.
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
   * stores a value in the dictionary
   *
   * ( [A] {string|atom} -> )
   *
   * ```
   * f♭> [ dup * ] "sqr" sto
   * [ ]
   * ```
   */
  def(this: StackEnv, lhs: string, rhs: StackValue) {
    if (['true', 'false', 'null', 'nan'].includes(lhs)) {
      throw new FFlatError('Cannot overwrite reserved words', this);
    }
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
   *
   * ( { } -> )
   *
   * ```
   * f♭> { ... } use
   * [ ]
   * ```
   */
  use(this: StackEnv, dict: { [key: string]: StackValue }) {
    this.dict.use(createAction(dict));
  },

  /**
   * ## `vocab`
   *
   * Write teh current local vocabulary to the stack
   *
   * ( -> { ... })
   *
   * ```
   * f♭> vocab
   * [ { ... } ]
   * ```
   */
  vocab(this: StackEnv) {
    return this.dict.compiledLocals();
  },

  /**
   * ## `inline`
   * inline a quote,
   * recursively expands defined words to core words
   *
   * ( [A B C] -> [a b c])
   *
   * ```
   * f♭> [ 2 sqr ] inline
   * [ [ 2 dup * ] ]
   * ```
   */
  inline(this: StackEnv, x: Word | Sentence | Key) {
    return this.dict.rewrite(x);
  },

  /**
   * ## `bind`
   * binds a quote,
   * recursively expands defined words to globals
   *
   * ( [A B C] -> [a b c])
   *
   * ```
   * f♭> [ 2 sqr ] bind
   * [ [ 2 sqr ] ]
   * ```
   */
  bind(this: StackEnv, x: Word | Sentence | Key) {
    return this.dict.compile(x);
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
    const r = this.dict.get(a);
    return typeof r !== 'undefined';
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
    if (r instanceof Word || r instanceof Sentence || r instanceof Key) {
      return r.displayString;
    }
    return ffPrettyPrint.formatValue(r, 0);
  },

  /**
   * ## `words`
   * returns a list of defined words
   *
   * ( -> {array} )
   */
  words(this: StackEnv): string[] {
    return this.dict.words();
  },

  /**
   * ## `locals`
   * returns a list of locals words
   *
   * ( -> {array} )
   */
  locals(this: StackEnv): string[] {
    return this.dict.localWords();
  },

  /**
   * ## `locals`
   * returns a list of local scoped words
   *
   * ( -> {array} )
   */
  scoped(this: StackEnv): string[] {
    return this.dict.scopedWords();
  }
};
