import { freeze, splice, push } from 'icepick';
import { writeFileSync } from 'fs';
import { stringifyStrict } from '../utils/json';

import {
  typed,
  Word,
  Sentence,
  Future,
  Just,
  Seq,
  StackValue,
  StackArray
} from '../types';
import { StackEnv } from '../env';
import { log } from '../utils';

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
  stringify: a => stringifyStrict(a),

  /**
   * ## `parse-json`
   */
  'parse-json': (a: string) => JSON.parse(a), // global.JSON.parse

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
    'string, RegExp, string': (str: string, reg: RegExp, rep: string) =>
      str.replace(reg, rep)
  }),

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
   * ## `\`
   * push the top of the queue to the stack
   *
   * ( -> {any} )
   */
  '\\': function(this: StackEnv): any {
    return new Just(this.queue.shift()); // danger?
  }
};
