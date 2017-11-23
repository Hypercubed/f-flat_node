import { freeze, splice, push } from 'icepick';

import { typed, Future, Seq, StackValue, StackArray, Action } from '../types';
import { StackEnv } from '../env';

typed.addConversion({
  from: 'string',
  to: 'RegExp',
  convert: (str: string) => {
    const match = str.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return match ? new RegExp(match[1], match[2]) : new RegExp(str);
  }
});

/**
 * # Internal Experimental Words
 */
export default {
  /*
  'set-module': function(this: StackEnv, a) {
    this.module = a;
    this.dict[a] = {}; // maybe should be root?
  },

  'get-module': function() {
    return this.module;
  },

  /**
  'unset-module': function() {
    Reflect.deleteProperty(this, 'module');
  }, */

  // 'throw': this.throw,

  /**
   * ## `clock`
   */
  clock: (): number => new Date().getTime(),

  // 'js': () => Object.assign({}, (typeof window === 'undefined') ? global : window),
  // 'console': console,
  // 'alert', function alert (a) { window.alert(a); });
  // 'this': function () { return this; },  // eslint-disable-line
  // '$', function $ (a) { return global.$(a); });

  /**
   * ## `stringify`
   */
  stringify: JSON.stringify, // global.JSON.stringify

  /**
   * ## `parse-json`
   */
  'parse-json': (a: string) => JSON.parse(a), // global.JSON.parse

  /* 'call': function call (a, b) {
    return Reflect.apply(a, null, [b]);
  },
  'apply': function apply (a, b) {
    return Reflect.apply(a, null, b);
  },
  '|>': function call (a, b) {
    return Reflect.apply(b, null, [a]);
  },  // danger */

  /**
   * ## `regexp`
   * convert string to RegExp
   */
  regexp: typed('regexp', {
    RegExp: x => x // typed will convert string to RegExp
  }),

  /**
   * ## `match`
   */
  match: typed('match', {
    'string, RegExp': (lhs: string, rhs: RegExp) => lhs.match(rhs)
  }),

  /**
   * ## `test?`
   */
  'test?': typed('test', {
    'string, RegExp': (lhs: string, rhs: RegExp) => rhs.test(lhs)
  }),

  /**
   * ## `replace`
   */
  replace: typed('replace', {
    'string, RegExp, string': (str: string, reg: RegExp, rep: string) => str.replace(reg, rep)
  }),

  /**
   * ## `||>` (apply)
   */
  '||>': typed('ap', {
    'Array, Function': (a: any[], b: Function) => Reflect.apply(b, null, a)
  }),

  /**
   * ## `fork`
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
    // like in with child scope
    return this.createChild().eval(a).stack;
  },

  /**
   * ## `spawn`
   * evalues the quote in a child environment, returns a future
   *
   * ( [A] -> {future} )
   */
  spawn(this: StackEnv, a: Action): Future {
    return new Future(a, this.createChildPromise(a));
  },

  /**
   * ## `await`
   * evalues the quote in a child environment, waits for result
   *
   * ( [A] -> [a] )
   */
  ['await']: function(this: StackEnv, a: StackValue): Promise<any> {
    // rollup complains on await
    if (Future.isFuture(a)) {
      return (a as Future).promise;
    }
    return this.createChildPromise(a);
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
   * ## `return`
   * pushes current stack to parent
   *
   * ( ... -> )
   *
   * ```
   * f♭> [ 1 2 3 return 4 ] fork
   * [ 1 2 3 [ 4 ] ]
   * ```
   */
  'return': function(this: StackEnv): void {
    // 'stack send'?
    if (this.parent) {
      this.parent.stack = [...this.parent.stack, ...this.stack];
      this.stack = splice(this.stack, 0);
      // this.parent.stack.push(...this.stack.splice(0));
    }
  },

  /**
   * ## `suspend`
   * stops execution, push queue to stack, loses other state
   *
   * ( ... -> )
   *
   * ```
   * f♭> [ 1 2 * suspend 3 4 *  ] fork
   * [ [ 2 3 4 * ] ]
   * ```
   */
  suspend(this: StackEnv): Seq {
    return new Seq(this.queue.splice(0)); // rename stop?
  },

  /**
   * ## `all`
   * executes each element in a child environment
   *
   * ( [ A B C ]-> [ [a] [b] [c] ])
   */
  all(this: StackEnv, arr: StackArray): Promise<StackArray> {
    return Promise.all(arr.map(a => this.createChildPromise(a)));
  },

  /**
   * ## `race`
   * executes each element in a child environment, returns first to finish
   *
   * ( [ A B C ]-> [x])
   */
  race(this: StackEnv, arr: StackArray): Promise<StackArray> {
    return Promise.race(arr.map(a => this.createChildPromise(a)));
  }
};
