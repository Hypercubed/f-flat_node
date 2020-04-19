import { splice, pop, push, getIn } from 'icepick';
import { signature, Any } from '@hypercubed/dynamo';

import {
  dynamo,
  ReturnValues,
  StackValue,
  Future,
  Sentence,
  Word,
  Key,
  Decimal
} from '../types';
import {
  deepEquals,
  template,
  toObject,
  FFlatError
} from '../utils';
import { patternMatch } from '../utils/pattern';
import { StackEnv } from '../engine/env';

const IMMEDIATE_QUOTE = Symbol.for('(');
const LAZY_QUOTE = Symbol.for('[');
const OBJECT_QUOTE = Symbol.for('{');

const QUOTES = [IMMEDIATE_QUOTE, LAZY_QUOTE, OBJECT_QUOTE];

function dequoteStack(env: StackEnv, s: StackValue, sym: Symbol) {
  const r: StackValue[] = [];
  while (env.stack.length > 0 && !QUOTES.includes(s as any)) {
    r.unshift(s);
    s = env.stack[env.stack.length - 1];
    env.stack = pop(env.stack);
  }
  if (s !== sym) {
    throw new Error('Unbalanced or unexpected parenthesis or bracket');
  }
  return r;
}

/**
 * # Internal Core Words
 */

class Choose {
  name = 'choose';

  @signature(Boolean, Any, Any)
  boolean(b: boolean, t: StackValue, f: StackValue) {
    return new ReturnValues([b ? t : f]);
  }

  @signature(null, Any, Any)
  n(_b: null, _t: StackValue, _f: StackValue) {
    return null;
  }

  @signature(Future, Any, Any)
  future(ff: Future, t: StackValue, f: StackValue) {
    return ff.map((b: any) => (b ? t : f));
  }
}

class IndexOf {
  name = 'indexof';

  @signature()
  string(a: string, b: string) {
    return a.indexOf(b);
  }

  @signature(Array, Any)
  array(a: StackValue[], b: string) {
    return a.findIndex(v => deepEquals(v, b));
  }

  @signature(Object, Any)
  object(a: {}, b: string) {
    const index = Object.values(a).findIndex(v => deepEquals(v, b));
    return Object.keys(a)[index];
  }
}

/**
 * ## `@` (at)
 *
 * returns the item at the specified index/key
 *
 * `[a*] n ⭢ a`
 *
 * ```
 * f♭> [ 1 2 3 ] 1 @
 * [ 2 ]
 *
 * f♭> [ 1 2 3 ] -1 @
 * [ 3 ]
 * ```
 */
class At {
  /**
   * - string char at, zero based index
   *
   * ```
   * f♭> 'abc' 2 @
   * [ 'c' ]
   * ```
   */
  @signature(String, [Number, Decimal])
  string(lhs: string, rhs: number) {
    rhs = +rhs | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs.charAt(rhs);
    return r === '' ? null : r;
  }

  /**
   * - array at, zero based index
   *
   * ```
   * f♭> [ 1 2 3 ] 1 @
   * [ 2 ]
   * ```
   */
  @signature(Array, [Number, Decimal])
  array(lhs: StackValue[], rhs: number) {
    rhs = +rhs | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs[rhs];
    return r === undefined ? null : new ReturnValues([r]);
  }

  /**
   * - digit at, zero based index
   *
   * ```
   * f♭> 3.14159 2 @
   * [ 4 ]
   * ```
   */
  @signature(Decimal, [Number, Decimal])
  number(lhs: Decimal, rhs: number) {
    const digits = (lhs as any).digits();
    const r = At.prototype.string(digits, rhs);
    return r === null ? null : +r;
  }

  @signature(Future, Any)
  future(f: Future, rhs: StackValue) {
    return f.map((lhs: any) => core['@'](lhs, rhs));
  }

  /**
   * - map get by key
   *
   * ```
   * f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
   * [ 'Manfred' ]
   * ```
   */
  @signature(Object, Any) // 'map | Object, Word | Sentence | string | null'
  object(a: Object, b: StackValue) {
    const path = String(b).split('.');
    const r = getIn(a, path);
    return r === undefined ? null : r;
  }

  @signature(Any, null)
  @signature(null, Any)
  n(_f: any, _rhs: any) {
    return null;
  }
}

class Unstack {
  @signature(Array)
  array(a: StackValue[]) {
    return new ReturnValues(a);
  }

  @signature()
  async future(f: Future) {
    const a = await f.promise;
    return new ReturnValues(a);
  }

  @signature(Any)
  any(a: any) {
    return a;
  }
}

class Eval {
  @signature()
  async future(f: Future) {
    const a = await f.promise;
    return new Sentence(a);
  }

  @signature(Array)
  array(a: StackValue[]) {
    return new Sentence(a);
  }

  @signature()
  string(a: string) {
    return new Word(a);
  }

  @signature([Key])
  key(a: Key) {
    return new Word(a.value);
  }

  @signature([Word, Key, Sentence])
  word(a: Word) {
    return a;
  }

  @signature(Any)
  any(a: StackValue) {
    return new ReturnValues([a]);
  }
}

class Zip {
  @signature(Array, Array)
  array(a: StackValue[][], b: StackValue[][]): StackValue[][] {
    const l = a.length < b.length ? a.length : b.length;
    const r: StackValue[][] = [];
    for (let i = 0; i < l; i++) {
      r.push([a[i], b[i]]);
    }
    return r;
  }
}

class Match {
  @signature(String, [RegExp, String])
  stringRegex(lhs: string, rhs: RegExp) {
    return lhs.match(rhs) || [];
  }
}

export const core = {
  '@': dynamo.function(At),

  /**
   * ## `choose`
   *
   * conditional (ternary) operator
   *
   * `bool a b ⭢ a||b`
   *
   * ```
   * f♭> true 1 2 choose
   * [ 1 ]
   * ```
   */
  choose: dynamo.function(Choose),

  /**
   * ## `q<`
   *
   * moves the top of the stack to the tail of the queue
   *
   * `a ⭢`
   *
   * ```
   * f♭> 1 2 4 q< 3
   * [ 1 2 3 4 ]
   * ```
   */
  'q<': function(this: StackEnv, a: StackValue): void {
    this.queue.push(a);
  },

  /**
   * ## `q>`
   *
   * moves the tail of the queue to the top of the stack
   *
   * `⭢ a`
   *
   * ```
   * f♭> 1 2 q> 4 3
   * [ 1 2 3 4 ]
   * ```
   */
  'q>': function(this: StackEnv) {
    return new ReturnValues([this.queue.pop()]); // danger
  },

  /**
   * ## `stack`
   *
   * replaces the stack with a quote containing the current stack
   *
   * `a* ⭢ [a*] )
   *
   * ```
   * f♭> 1 2 3 stack
   * [ [ 1 2 3 ] ]
   * ```
   */
  stack(this: StackEnv): StackValue[] {
    const s = this.stack.slice();
    this.stack = splice(this.stack, 0, this.stack.length);
    return s;
  },

  /**
   * ## `unstack`
   *
   * push items in a quote to the stack without evaluation
   *
   * `[A*] ⭢ A*`
   *
   * ```
   * f♭> [ 1 2 * ] unstack
   * [ 1 2 * ]
   * ```
   */
  unstack: dynamo.function(Unstack),

  /**
   * ## `clr`
   *
   * clears the stack
   *
   * `a* ⭢`
   *
   * ```
   * f♭> 1 2 3 clr
   * [  ]
   * ```
   */
  clr: function(this: StackEnv): void {
    this.clear();
  },

  /**
   * ## `depth`
   *
   * pushes the size of the current stack (number of items on the stack)
   *
   * `⭢ n`
   *
   * ```
   * f♭> 0 1 2 depth
   * [ 0 1 2 3 ]
   * ```
   */
  depth(this: StackEnv): number {
    return this.stack.length;
  },

  /**
   * ## `eval`
   *
   * evaluate quote or string
   *
   * `[A*] ⭢ a*`
   *
   * ```
   * f♭> [ 1 2 * ] eval
   * [ 2 ]
   * ```
   */
  eval: dynamo.function(Eval),

  /**
   * ## `in`
   *
   * evalues the quote in a child environment
   *
   * `[A*] ⭢ [a*]`
   *
   * ```
   * f♭> [ 1 2 * ] in
   * [ [ 2 ] ]
   * ```
   */
  in(this: StackEnv, a: StackValue): StackValue[] {
    return this.createChild().eval(a).stack;
  },

  /**
   * ## `in-catch`
   *
   * Evaluates the first quotation in a child environment
   * calls the second quotation in a child if the frist throws an error
   *
   * `[A*] [B*] ⭢ [ a*||b* ]`
   *
   */
  'in-catch'(this: StackEnv, t: StackValue, c: StackValue) {
    try {
      return this.createChild().eval(t).stack;
    } catch (err) {
      return this.createChild().eval(c).stack;
    }
  },

  /**
   * ## `throw`
   *
   * Throws an error
   *
   * `str ⭢`
   *
   * ```
   * f♭> 'PC LOAD LETTER' throw
   * [ ]
   * ```
   */
  throw(this: StackEnv, e: string) {
    throw new FFlatError(e, this);
  },

  /**
   * ## `send`
   *
   * pushes one element from stack to parent.
   *
   * `a ⭢`
   *
   * ```
   * f♭> [ 1 2 3 send 4 ] in
   * [ 3 [ 1 2 4 ] ]
   * ```
   */
  send(this: StackEnv, a: StackValue): void {
    if (this.parent) {
      this.parent.stack = push(this.parent.stack, a);
    }
  },

  /**
   * ## `drop`
   *
   * drops the item on the bottom of the stack
   *
   * `a ⭢`
   *
   * ```
   * > 1 2 3 drop
   * [ 1 2 ]
   * ```
   */
  drop: (a: StackValue) => {
    // nop
  },

  /**
   * ## `swap`
   *
   * swaps the items on the bottom of the stack
   *
   * `a b ⭢ b c`
   *
   * ```
   * > 1 2 3 swap
   * [ 1 3 2 ]
   * ```
   */
  swap: (a: StackValue, b: StackValue) => new ReturnValues([b, a]),

  /**
   * ## `dup`
   *
   * duplicates the item on the bottom of the stack
   *
   * `a ⭢ a a`
   *
   * ```
   * > 1 2 3 dup
   * [ 1 2 3 3 ]
   * ```
   */
  dup: (a: StackValue) => new ReturnValues([a, a]),

  /**
   * ## `indexof`
   *
   * returns the position of the first occurrence of a specified value in a sequence
   *
   * `[a*] b ⭢ n`
   *
   * ```
   * f♭> [ '1' '2' '3' '4' ] '2' indexof
   * [ 1 ]
   * ```
   */
  indexof: dynamo.function(IndexOf),
  // (a: StackValue[], b: number | string) => a.indexOf(b), // doesn't work with Decimal!!!

  /**
   * ## `zip`
   *
   * `[A*] [B*] ⭢ [[A B]*]`
   *
   * ```
   * f♭> [ 1 2 3 ] [ 4 5 6 ] zip
   * [ [ [ 1 4 ] [ 2 5 ] [ 3 6 ] ] ]
   * ```
   *
   * ```
   * f♭> [ 1 2 3 ] [ * + / ] zip
   * [ [ [ 1 * ] [ 2 + ] [ 3 / ] ] ]
   * ```
   *
   * ```
   * f♭> [ 1 2 3 ] [ 4 5 6 7 8 ] zip
   * [ [ [ 1 4 ] [ 2 5 ] [ 3 6 ] ] ]
   * ```
   */
  zip: dynamo.function(Zip),

  /**
   * ## `(` (immediate quote)
   *
   * pushes a quotation maker onto the stack
   *
   * `⭢ #(`
   */
  '(': () => IMMEDIATE_QUOTE,

  /**
   * ## `)` (immediate dequote)
   *
   * collects stack items upto the last quote marker
   *
   * `#( a* ⭢ [ a* ]`
   */
  ')': function(this: StackEnv, s: StackValue) {
    try {
      return dequoteStack(this, s, IMMEDIATE_QUOTE);
    } catch (e) {
      throw new FFlatError(e, this);
    }
  },

  /**
   * ## `[` (lazy quote)
   * pushes a quotation maker onto the stack, increments depth
   *
   * `⭢ #[`
   */
  '[': function(this: StackEnv) {
    this.depth++;
    return LAZY_QUOTE;
  },

  /**
   * ## `]` (lazy dequote)
   *
   * decrements depth, collects stack items upto the last quote marker
   *
   * `#( A* ⭢ [ A* ]`
   */
  ']': function(this: StackEnv, s: StackValue) {
    this.depth--;
    try {
      return dequoteStack(this, s, LAZY_QUOTE);
    } catch (e) {
      throw new FFlatError(e, this);
    }
  },

  /**
   * ## `{` (immediate object quote)
   *
   * pushes a quotation marker onto the stack
   *
   * `⭢ #{`
   */
  '{': () => OBJECT_QUOTE,

  /**
   * ## `}` (immediate object dequote)
   *
   * collects stack items upto the last quote marker, converts to an object
   *
   * `#( a b ... ⭢ { a: b ... }`
   */
  '}': function(this: StackEnv, s: StackValue) {
    let r: any;
    try {
      r = dequoteStack(this, s, OBJECT_QUOTE);

    } catch (e) {
      throw new FFlatError(e, this);
    }
    return toObject(r);
  },

  /**
   * ## `template`
   *
   * converts a string to a string template
   *
   * `str ⭢ [A*]`
   *
   * ```
   * f♭> 'hello $(world)' template
   * [ [ '' 'hello ' + '(world)' eval string + '' + ] ]
   * ```
   */
  template(this: StackEnv, str: string): string {
    return template(this, str);
  },

  /**
   * ## `sleep`
   *
   * wait x milliseconds
   *
   * `n ⭢`
   *
   */
  sleep(ms: number): Promise<void> {
    // todo: make cancelable?
    // let timerId;
    const promise = new Promise<void>(resolve => {
      // timerId =
      global.setTimeout(resolve, ms);
    });
    // promise.__cancel__ = () => clearTimeout(timerId);
    return promise;
  },

  /**
   * ## `match
   *
   * `str a ⭢ bool`
   *
   * Matches a string a regex and returns an array containing the results of that search.
   *
   */
  match: dynamo.function(Match),

  /**
   * ## `=~`
   *
   * `a b ⭢ bool`
   *
   * Returns a Boolean value that indicates whether or not the lhs matches the rhs.
   *
   */
  '=~': patternMatch,

  /**
   * ## `_`
   *
   * `⭢ #_`
   *
   * Match symbol
   *
   */
  _: () => Symbol.for('_') // Match symbol
};
