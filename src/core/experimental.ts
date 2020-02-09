import memoize from 'memoizee';
import { writeFileSync } from 'fs';
import { signature } from '@hypercubed/dynamo';

import { stringifyStrict } from '../utils/json';
import { FFlatError } from '../utils/fflat-error';

import {
  dynamo,
  Word,
  Sentence,
  Future,
  ReturnValues,
  StackValue,
  Decimal
} from '../types';
import { StackEnv } from '../env';

class Apply {
  @signature()
  app(a: any[], b: Function) {
    return Reflect.apply(b, null, a);
  }
}

/**
 * # Internal Experimental Words
 */
export const experimental = {
  /**
   * ## `throw`
   *
   * Throws an error
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
   * ## `throws?`
   *
   * Evaluates the quotation in a child, returns true if the evaluation errors
   *
   * ```
   * f♭> [ 1 + ] throws?
   * [ true ]
   * ```
   */
  'throws?'(this: StackEnv, a: StackValue) {
    try {
      this.createChild().eval(a);
      return false;
    } catch (err) {
      return true;
    }
  },

  /**
   * ## `stringify`
   */
  stringify(a: any) {
    return stringifyStrict(a);
  },

  /**
   * ## `parse-json`
   */
  'parse-json'(a: string) {
    return JSON.parse(a);
  },

  /**
   * ## `||>` (apply)
   */
  '||>': dynamo.function(Apply),

  /**
   * ## `spawn`
   *
   * evalues the quote in a child environment, returns a future
   *
   * ( [A] -> {future} )
   */
  spawn(this: StackEnv, a: Word | Sentence): Future {
    return new Future(a, this.createChildPromise(a));
  },

  /**
   * ## `await`
   *
   * evalues the quote in a child environment, waits for result
   *
   * ( [A] -> [a] )
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
   * ( ... -> )
   *
   * ```
   * f♭> [ 1 2 * suspend 3 4 *  ] fork
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
   * ( [ A B C ]-> [ [a] [b] [c] ])
   */
  all(this: StackEnv, arr: StackValue[]): Promise<StackValue[]> {
    return Promise.all(arr.map(a => this.createChildPromise(a)));
  },

  /**
   * ## `race`
   *
   * executes each element in a child environment, returns first to finish
   *
   * ( [ A B C ]-> [x])
   */
  race(this: StackEnv, arr: StackValue[]): Promise<StackValue[]> {
    return Promise.race(arr.map(a => this.createChildPromise(a)));
  },

  /**
   * ## `js-raw`
   *
   * evalues a string as raw javascript
   *
   * ( {string} -> {any} )
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
