import * as fetch from 'isomorphic-fetch';
import { slice, splice, pop, push } from 'icepick';

import { typed, Seq, StackValue, StackArray, Future, Sentence, Word, Just, Complex, Decimal } from '../types';
import { log, generateTemplate, toObject } from '../utils';
import { quoteSymbol } from '../constants';
import { StackEnv } from '../env';

const _slice = typed('slice', {
  'Array | string, number | null, number | null': (lhs, b, c) =>
    slice(lhs, b, c === null ? undefined : c),
  'Future, any, any': (f, b, c) => f.map(lhs => slice(lhs, b, c)),
  'any, number | null, number | null': (lhs, b, c) =>
    slice(lhs, [b, c === null ? undefined : c])
});

const splitat = typed('splitat', {
  'Array, number | null': (arr, a) =>
    new Seq([
      // use head and tail?
      slice(arr, 0, a),
      slice(arr, a)
    ]),
  'Future, any': (f, a) => f.map(arr => splitat(arr, a))
});

function dequoteStack(env: StackEnv, s: StackValue) {
  const r: StackArray = [];
  while (env.stack.length > 0 && s !== quoteSymbol) {
    r.unshift(s);
    s = env.stack[env.stack.length - 1];
    env.stack = pop(env.stack);
  }
  return r;
}

/**
 * # Internal Core Words
 */
export const core = {
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
  stack (this: StackEnv): StackArray {
    const s = this.stack.slice();
    this.stack = splice(this.stack, 0);
    return s;
  },

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
  unstack: typed('unstack', {
    Array: (a: StackArray) => new Seq(a),
    Future: (f: Future) => f.promise.then(a => new Seq(a))
  }),

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
  depth (this: StackEnv): number {
    return this.stack.length; // ,  or "stack [ unstack ] [ length ] bi", `"this.stack.length" js-raw`
  },

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
  eval: typed('_eval', {
    Future: (f: Future) => f.promise.then(a => new Sentence(a)),
    Array: a => new Sentence(a),
    string: a => new Word(a),
    Word: a => a,
    Sentence: a => a,
    any: a => new Just(a)
  }),

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
  fork(this: StackEnv, a: StackValue): StackArray {
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
   * ## `ln`
   *
   * Natural logarithm / item length
   *
   * ( x -> {number} )
   */
  ln: typed('ln', {
    'Complex': a => a.ln(),
    'Decimal | number': a => {
      if (a <= 0) return new Complex(a).ln();
      return new Decimal(a).ln();
    },

    /**
     * - length of the Array or string
     *
     * ```
     * > [ 1 2 3 ] length
     * [ 3 ]
     * ```
     */
    'Array | string': a => a.length,

    /**
     * - length of the Object (number of keys)
     *
     * ```
     * > { x: 1, y: 2, z: 3 } length
     * [ 3 ]
     * ```
     */
    Object: (a: {}) => Object.keys(a).length,

    /**
     * - "length" of a nan, null, and booleans are 0
     *
     * ```
     * > true length
     * [ 0 ]
     * ```
     */
    null: (a: null) => 0, // eslint-disable-line
    any: a => 0
  }),

  /**
   * ## `slice`
   * a shallow copy of a portion of an array or string
   *
   * ( seq from to -> seq )
   */
  slice: _slice,

  /**
   * ## `splitat`
   * splits a array or string
   *
   * ( seq at -> seq )
   *
   * ```
   * f♭> [ 1 2 3 4 ] 2 4 slice
   * [ [ 3 4 ] ]
   * ```
   */
  splitat,

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
  indexof: (a: StackArray, b: number | string) => a.indexOf(b), // doesn't work with Decimal!!!

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
  zip: typed('zip', {
    'Array, Array': (a: StackArray[], b: StackArray[]): StackArray[] => {
      const l = a.length < b.length ? a.length : b.length;
      const r: StackArray[] = [];
      for (let i = 0; i < l; i++) {
        r.push(a[i], b[i]);
      }
      return r;
    }
  }),

  /**
   * ## `zipinto`
   *
   * ```
   * f♭> [ 1 2 3 ] [ 4 5 6 ] [ 7 8 9 ] zipinto
   * [ [ 1 4 7 8 9 2 5 7 8 9 3 6 7 8 9 ] ]
   * ```
   */
  zipinto: typed('zipinto', {
    'Array, Array, Array': (a: StackArray[], b: StackArray[], c: StackArray[]): StackArray[] => {
      const l = a.length < b.length ? a.length : b.length;
      const r: StackArray[] = [];
      for (let i = 0; i < l; i++) {
        r.push(a[i], b[i], ...c);
      }
      return r;
    }
  }),

  /**
   * ## `(` (immediate quote)
   * pushes a quotation maker onto the stack
   *
   * ( -> #( )
   */
  '(': () => quoteSymbol,

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
   * ( -> #( )
   */
  '[': function(this: StackEnv) {
    this.depth++;
    return quoteSymbol;
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
  '{': () => quoteSymbol, // object

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
  template: generateTemplate,

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
   * ## `get-log-level`
   * gets the current logging level
   *
   * ( -> {string} )
   */
  'get-log-level': () => log.level,

  /**
   * ## `set-log-level`
   * sets the current logging level
   *
   * ( {string} -> )
   */
  'set-log-level': (a: string): void => {
    log.level = a;
  },

  /**
   * ## `undo`
   * restores the stack to state before previous eval
   */
  undo(this: StackEnv): void {
    this.undo().undo();
  },

  /**
   * ## `auto-undo`
   * set flag to auto-undo on error
   *
   * ( {boolean} -> )
   */
  'auto-undo': function(this: StackEnv, a: boolean): void {
    this.undoable = a;
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
};
