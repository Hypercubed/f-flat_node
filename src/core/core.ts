import { splice, pop, push, getIn } from 'icepick';
import { signature, Any } from '@hypercubed/dynamo';

import {
  dynamo,
  Seq,
  StackValue,
  Future,
  Sentence,
  Word,
  Just,
  Decimal
} from '../types';
import { template, templateParts, toObject } from '../utils';
import { patternMatch } from '../utils/pattern';
import { StackEnv } from '../env';

function dequoteStack(env: StackEnv, s: StackValue) {
  const r: StackValue[] = [];
  while (env.stack.length > 0 && s !== Symbol.for('(')) {
    r.unshift(s);
    s = env.stack[env.stack.length - 1];
    env.stack = pop(env.stack);
  }
  return r;
}

/**
 * # Internal Core Words
 */

/**
 * ## `choose`
 * conditional (ternary) operator
 *
 * ( {boolean} [A] [B] -> {A|B} )
 *
 * ```
 * f♭> true 1 2 choose
 * [ 1 ]
 * ```
 */
class Choose {
  name = 'choose';

  @signature([Boolean, null], Any, Any)
  booelan(b: boolean | null, t: any, f: any) {
    return new Just(b ? t : f);
  }

  @signature(Future, Any, Any)
  future(ff: Future, t: any, f: any) {
    return ff.map((b: any) => (b ? t : f));
  }
}

/**
 * ## `@` (at)
 *
 * returns the item at the specified index/key
 *
 * ( {seq} {index} -> {item} )
 *
 * ```
 * > [ 1 2 3 ] 1 @
 * [ 2 ]
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
  array(lhs: any[], rhs: number) {
    rhs = +rhs | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs[rhs];
    return r === undefined ? null : new Just(r);
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
  future(f: Future, rhs: any) {
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
  object(a: any, b: any) {
    const path = String(b).split('.');
    const r = getIn(a, path);
    return r === undefined ? null : r;
  }
}

/**
 * ## `unstack`
 * push items in a quote to the stack without evaluation
 *
 * ( [A B C] -> A B C )
 *
 * ```
 * f♭> [ 1 2 * ] unstack
 * [ 1 2 * ]
 * ```
 */
class Unstack {
  @signature(Array)
  array(a: StackValue[]) {
    return new Seq(a);
  }

  @signature()
  async future(f: Future) {
    const a = await f.promise;
    return new Seq(a);
  }

  @signature(Any)
  any(a: any) {
    return a;
  }
}

/**
 * ## `eval`
 * evaluate quote or string
 *
 * ( [A] -> a )
 *
 * ```
 * f♭> [ 1 2 * ] eval
 * [ 2 ]
 * ```
 */
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

  @signature([Word, Sentence])
  word(a: Word) {
    return a;
  }

  @signature(Any)
  any(a: any) {
    return new Just(a);
  }
}

/**
 * ## `zip`
 *
 * ```
 * f♭> [ 1 2 3 ] [ 4 5 6 ] zip
 * [ 1 4 2 5 3 6 ]
 * ```
 */
class Zip {
  @signature(Array, Array)
  array(a: StackValue[][], b: StackValue[][]): StackValue[][] {
    const l = a.length < b.length ? a.length : b.length;
    const r: StackValue[][] = [];
    for (let i = 0; i < l; i++) {
      r.push(a[i], b[i]);
    }
    return r;
  }
}

/**
 * ## `zipinto`
 *
 * ```
 * f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
 * [ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
 * ```
 */
class ZipInto {
  @signature(Array, Array, Array)
  array(a: StackValue[], b: StackValue[], c: StackValue[]): StackValue[] {
    const l = a.length < b.length ? a.length : b.length;
    const r: StackValue[] = [];
    for (let i = 0; i < l; i++) {
      r.push(a[i], b[i], ...c);
    }
    return r;
  }
}

/**
 * ## `match`
 *
 * Matches a string a regex and returns an array containing the results of that search.
 *
 * {string} {regexp | string} -> {boolean}
 *
 */
class Match {
  @signature(String, [RegExp, String])
  stringRegex(lhs: string, rhs: RegExp) {
    return lhs.match(rhs) || [];
  }
}

export const core = {
  choose: dynamo.function(Choose),
  '@': dynamo.function(At),

  /**
   * ## `q<`
   * moves the top of the stack to the tail of the queue
   *
   * ( {any} -> )
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
   * moves the tail of the queue to the top of the stack
   *
   * ( -> {any} )
   *
   * ```
   * f♭> 1 2 q> 4 3
   * [ 1 2 3 4 ]
   * ```
   */
  'q>': function(this: StackEnv): any {
    return new Just(this.queue.pop());
  },

  /**
   * ## `q@`
   * moves a copy of the tail of the queue onto the stack
   *
   * ( -> {any} )
   *
   * ```
   * f♭> 1 2 q> 4 3
   * [ 1 2 3 4 ]
   * ```
   */
  'q@': function(this: StackEnv): any {
    return new Just(this.queue[this.queue.length - 1]);
  },

  /**
   * ## `stack`
   * replaces the stack with a quote containing the current stack
   *
   * ( ... -> [ ... ] )
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

  unstack: dynamo.function(Unstack),

  /**
   * ## `<->` (s-q swap)
   * swaps the last item on the stack and the first item on the queue
   */
  '<->': function(this: StackEnv, s: any): Just {
    const q = this.queue.shift();
    this.queue.unshift(s);
    return new Just(q);
  },

  /**
   * ## `<-` (stack)
   * replaces the stack with the item found at the top of the stack
   *
   * ( [A] -> A )
   *
   * ```
   * f♭> 1 2 [ 3 4 ] <-
   * [ 3 4 ]
   * ```
   */
  '<-': function(this: StackEnv, s: any): Seq {
    this.clear();
    return new Seq(s);
  },

  /**
   * ## `->` (queue)
   * replaces the queue with the item found at the top of the stack
   *
   * ( [A] -> )
   *
   * ```
   * f♭> 1 2 [ 3 4 ] -> 5 6
   * [ 1 2 3 4 ]
   * ```
   */
  '->': function(this: StackEnv, s: any): void {
    this.queue.splice(0);
    this.queue.push(...s);
  },

  /**
   * ## `clr`
   *
   * clears the stack
   *
   * ( ... -> )
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
   * pushes the size of the current stack (number of items on the stack)
   *
   * ( -> {number} )
   *
   * ```
   * f♭> 0 1 2 depth
   * [ 0 1 2 3 ]
   * ```
   */
  depth(this: StackEnv): number {
    return this.stack.length; // ,  or "stack [ unstack ] [ length ] bi", `"this.stack.length" js-raw`
  },

  eval: dynamo.function(Eval),

  /**
   * ## `fork`
   *
   * evalues the quote in a child environment
   *
   * ( [A] -> [a] )
   *
   * ```
   * f♭> [ 1 2 * ] fork
   * [ [ 2 ] ]
   * ```
   */
  fork(this: StackEnv, a: StackValue): StackValue[] {
    return this.createChild().eval(a).stack;
  },

  /**
   * ## `send`
   * pushes one element from stack to parent.
   *
   * ( A -> )
   *
   * ```
   * f♭> [ 1 2 3 send 4 ] fork
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
   * drops the item on the bottom of the stack
   *
   * ( x -> )
   *
   * ```
   * > 1 2 3 drop
   * [ 1 2 ]
   * ```
   */
  drop: (a: StackValue) => {}, // eslint-disable-line

  /**
   * ## `swap`
   * swaps the items on the bottom of the stack
   *
   * ( x y -- y x )
   *
   * ```
   * > 1 2 3 swap
   * [ 1 3 2 ]
   * ```
   */
  swap: (a: StackValue, b: StackValue) => new Seq([b, a]),

  /**
   * ## `dup`
   * duplicates the item on the bottom of the stack
   *
   * ( x -- x x )
   *
   * ```
   * > 1 2 3 dup
   * [ 1 2 3 3 ]
   * ```
   */
  dup: (a: StackValue) => new Seq([a, a]), //  q< q@ q>

  /**
   * ## `indexof`
   * returns the position of the first occurrence of a specified value in a sequence
   *
   * ( seq item -> number )
   *
   * ```
   * f♭> [ '1' '2' '3' '4' ] '2' indexof
   * [ 1 ]
   * ```
   */
  indexof: (a: StackValue[], b: number | string) => a.indexOf(b), // doesn't work with Decimal!!!

  /* 'repeat': (a, b) => {
    return new Action(arrayRepeat(a, b));
  }, */

  /**
   * ## `zip`
   *
   * ```
   * f♭> [ 1 2 3 ] [ 4 5 6 ] zip
   * [ 1 4 2 5 3 6 ]
   * ```
   */
  zip: dynamo.function(Zip),

  /**
   * ## `zipinto`
   *
   * ```
   * f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
   * [ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
   * ```
   */
  zipinto: dynamo.function(ZipInto),

  /**
   * ## `(` (immediate quote)
   * pushes a quotation maker onto the stack
   *
   * ( -> ( )
   */
  '(': () => Symbol.for('('),

  /**
   * ## `)` (immediate dequote)
   * collects stack items upto the last quote marker
   *
   * ( #( ... -> [ ... ] )
   */
  ')': function(this: StackEnv, s: StackValue) {
    return dequoteStack(this, s);
  },

  /**
   * ## `[` (lazy quote)
   * pushes a quotation maker onto the stack, increments depth
   *
   * ( -> ( )
   */
  '[': function(this: StackEnv) {
    this.depth++;
    return Symbol.for('(');
  },

  /**
   * ## `]` (lazy dequote)
   * decrements depth, collects stack items upto the last quote marker
   *
   * ( #( ... -> [ ... ] )
   */
  ']': function(this: StackEnv, s: StackValue) {
    this.depth--;
    return dequoteStack(this, s);
  },

  /**
   * ## `{` (immediate object quote)
   * pushes a quotation maker onto the stack
   *
   * ( -> #( )
   */
  '{': () => Symbol.for('('),

  /**
   * ## `}` (immediate object dequote)
   * collects stack items upto the last quote marker, converts to an object
   *
   * ( #( ... -> [ ... ] )
   */
  '}': function(this: StackEnv, s: StackValue) {
    const r = dequoteStack(this, s);
    return toObject(r);
  },

  // 'self': () => Symbol.for('self'),

  /**
   * ## `template`
   * converts a string to a string template
   *
   * ( {string} -> {quote} )
   *
   * ```
   * f♭> 'hello $(world)' template
   * [ [ '' 'hello ' + '(world)' eval string + '' + ] ]
   * ```
   */
  template: function(this: StackEnv, str: string): string {
    return template(this, str);
  },

  'template-with': function(this: StackEnv, str: string, action: any): string {
    return template(this, str, action);
  },

  'template-parts': function(this: StackEnv, str: string): string {
    return templateParts(this, str);
  },

  /**
   * ## `sleep`
   * wait x milliseconds
   *
   * ( x -> )
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
   * ## `undo`
   * restores the stack to state before previous eval
   */
  undo(this: StackEnv): void {
    this.undo().undo();
  },

  /*
   * ## `<q`
   * push the top of the queue to the stack
   *
   * ( -> {any} )
   */
  '<q': function(this: StackEnv): any {
    return new Just(this.queue.shift()); // danger?
  },

  /**
   * ## `match`
   *
   * Matches a string a regex and returns an array containing the results of that search.
   *
   * {string} [regexp} -> {boolean}
   *
   */
  match: dynamo.function(Match),

  /**
   * ## `=~`
   *
   * Returns a Boolean value that indicates whether or not the lhs matches the rhs.
   *
   * {any} {any} -> {boolean}
   *
   */
  '=~': patternMatch,

  /**
   * ## `_`
   *
   * Match symbol
   *
   */
  _: () => Symbol.for('_'), // Match symbol

  /**
   * ## `infinity`
   * pushes the value Infinity
   *
   * ( -> Infinity )
   */
  infinity: () => new Decimal(Infinity),
  '-infinity': () => new Decimal(-Infinity)
};
