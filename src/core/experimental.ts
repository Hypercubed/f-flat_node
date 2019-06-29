import memoize from 'memoizee';
import { writeFileSync } from 'fs';

import { stringifyStrict } from '../utils/json';
import { FFlatError } from '../utils/fflat-error';

import {
  typed,
  Word,
  Sentence,
  Future,
  Seq,
  StackValue,
  StackArray
} from '../types';
import { StackEnv } from '../env';
import { log } from '../utils';

/**
 * # Internal Experimental Words
 */
export const experimental = {
  /**
   * ## `throw`
   */
  throw: function(this: StackEnv, e: string) {
    throw new FFlatError(e, this);
  },

  /**
   * ## `stringify`
   */
  stringify: (a: any) => stringifyStrict(a),

  /**
   * ## `parse-json`
   */
  'parse-json': (a: string) => JSON.parse(a), // global.JSON.parse

  /**
   * ## `||>` (apply)
   */
  '||>': typed('ap', {
    'Array, Function': (a: any[], b: Function) => Reflect.apply(b, null, a)
  }),

  /**
   * ## `spawn`
   * evalues the quote in a child environment, returns a future
   *
   * ( [A] -> {future} )
   */
  spawn(this: StackEnv, a: Word | Sentence): Future {
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
    if (a instanceof Future) {
      return a.promise;
    }
    return this.createChildPromise(a);
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
  },

  /**
   * ## `sesssave`
   */
  sesssave(this: StackEnv) {
    log.debug('saving session');
    writeFileSync(
      'session',
      JSON.stringify(
        {
          dict: this.dict,
          stack: this.stack
        },
        null,
        2
      ),
      'utf8'
    );
  },

  /**
   * ## `js-raw`
   * evalues a string as raw javascript
   *
   * ( {string} -> {any} )
   */
  'js-raw': function(this: StackEnv, s: string): any {
    return new Function(`return ${s}`).call(this);
  },

  /**
   * ### `memoize`
   *
   * memoize a defined word
   *
   * ( {string|atom} -> )
   */
  memoize(this: StackEnv, name: string, n: number): void {
    const cmd = this.dict.get(name);
    if (cmd) {
      const fn = (...a) => {
        const s = this.createChild()
          .eval([...a])
          .eval(cmd).stack;
        return new Seq(s);
      };
      this.defineAction(name, memoize(fn, { length: n, primitive: true }));
    }
  },

  'create-object': function(obj: any): any {
    return Object.create(obj);
  },

  'case-of?': function(obj: any, proto: any): any {
    while (true) {
      if (obj === null) return false;
      if (proto === obj) return true;
      obj = Object.getPrototypeOf(obj);
    }
  },

  put: function(obj: any, key: any, value: any): any {
    const proto = Object.getPrototypeOf(obj);
    const newObj = Object.create(proto);
    return Object.assign(newObj, { [key]: value });
  },

  /* assert(this: StackEnv, value: boolean, message: string) {
    throw new FFlatError(`Asserion error: ${message}`, this);
  } */
};
