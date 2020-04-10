import { stringifyStrict } from '../utils/json';

import { Future, ReturnValues, StackValue, Decimal } from '../types';
import { StackEnv } from '../engine/env';

/**
 * # Internal Experimental Words
 */
export const experimental = {
  /**
   * ## `stringify`
   *
   * `a ⭢ str`
   */
  stringify(a: any) {
    return stringifyStrict(a);
  },

  /**
   * ## `spawn`
   *
   * evalues the quote in a child environment, returns a future
   *
   * `[A*] ⭢ future`
   */
  spawn(this: StackEnv, a: any): Future {
    return new Future(a, this.createChildPromise(a));
  },

  /**
   * ## `await`
   *
   * evalues the quote in a child environment, waits for result
   *
   * `[A*] ⭢ [a*]`
   */
  ['await'](this: StackEnv, a: StackValue): Promise<any> {
    // rollup complains on await
    if (a instanceof Future) {
      return a.promise;
    }
    return this.createChildPromise(a);
  },

  /**
   * ## `suspend`
   *
   * stops execution, push queue to stack, loses other state
   *
   * `⭢`
   *
   * ```
   * f♭> [ 1 2 * suspend 3 4 *  ] in
   * [ [ 2 3 4 * ] ]
   * ```
   */
  suspend(this: StackEnv): ReturnValues {
    return new ReturnValues(this.queue.splice(0) as StackValue[]); // rename stop?
  },

  /**
   * ## `all`
   *
   * executes each element in a child environment
   *
   * `[A*] ⭢ [a*]`
   */
  all(this: StackEnv, arr: StackValue[]): Promise<StackValue[]> {
    return Promise.all(arr.map(a => this.createChildPromise(a)));
  },

  /**
   * ## `race`
   *
   * executes each element in a child environment, returns first to finish
   *
   * [A*] ⭢ [a*]`
   */
  race(this: StackEnv, arr: StackValue[]): Promise<StackValue[]> {
    return Promise.race(arr.map(a => this.createChildPromise(a)));
  },

  /**
   * ## `js-raw`
   *
   * evalues a string as raw javascript
   *
   * `str ⭢ a*`
   */
  'js-raw'(this: StackEnv, s: string): any {
    return new Function(`return ${s}`).call(this);
  },

  'create-object'(obj: any): any {
    return Object.create(obj);
  },

  'case-of?'(obj: any, proto: any): any {
    while (true) {
      if (obj === null) return false;
      if (proto === obj) return true;
      obj = Object.getPrototypeOf(obj);
    }
  },

  put(obj: any, key: any, value: any): any {
    const proto = Object.getPrototypeOf(obj);
    const newObj = Object.create(proto);
    return Object.assign(newObj, { [key]: value });
  },

  digits(n: Decimal) {
    return (n as any).digits();
  }
};
