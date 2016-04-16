import fetch from 'isomorphic-fetch';
import {freeze, slice} from 'icepick';

import {log} from '../logger';
import {typed, Seq, Action} from '../types/index';
import {generateTemplate} from '../utils';

/**
   # Core Internal Words
**/

export default {
  /**
     ## `nop`
     no op

     ( -> )
  **/
  'nop': () => {},

  /**
    ## `eval`
    evaluate quote or string

    ( [A] -> a )

    ```
    f♭> [ 1 2 * ] eval
    [ 2 ]
    ```
  **/
  'eval': typed('_eval', {
    any: a => Action.of(a)
  }),

  /**
     ## `drop`
     drops the item on the bottom of the stack

     ( x -> )

     ```
     > 1 2 3 drop
     [ 1 2 ]
     ```
  **/
  'drop': a => {},  // eslint-disable-line

  /**
     ## `swap`
     swaps the items on the bottom of the stack

     ( x y -- y x )

     ```
     > 1 2 3 swap
     [ 1 3 2 ]
     ```
  **/
  'swap': (a, b) => Seq.of([b, a]),

  /**
     ## `dup`
     duplicates the item on the bottom of the stack

     ( x -- x x )

     ```
     > 1 2 3 dup
     [ 1 2 3 3 ]
     ```
  **/
  'dup': a => Seq.of([a, a]),

  /**
    ## `unstack`
    push items in a quote to the stack without evaluation

    ( [A B C] -> A B C)

    ```
    f♭> [ 1 2 * ] unstack
    [ 1 2 * ]
    ```
  **/
  'unstack': a => new Seq(a),

  /**
     ## `length`
     Outputs the length of the Array, string, or object.

     ( {seq} -> {number} )

     ```
     > [ 1 2 3 ] length
     3
     ```
  **/
  'length': typed('length', {
    'Array | string': a => a.length,
    'Object': a => Object.keys(a).length,
    'null': a => 0  // eslint-disable-line
  }),

  /**
     ## `slice`
     a shallow copy of a portion of an array or string

     ( seq from to -> seq )
  **/
  'slice': typed('slice', {
    'Array | string, number | null, number | null': (lhs, b, c) => slice(lhs, b, c === null ? undefined : c),
    'any, number | null, number | null': (lhs, b, c) => slice(lhs, [b, c === null ? undefined : c])
  }),

  /**
     ## `splitat`
     splits a array or string

     ( seq at -> seq )
  **/
  'splitat': typed('splitat', {
    'Array, number | null': (arr, a) => Seq.of([  // use head and tail?
      slice(arr, 0, a),
      slice(arr, a)
    ])
  }),

  /**
     ## `indexof`
     returns the position of the first occurrence of a specified value in a sequence

     ( seq item -> number )
  **/
  'indexof': (a, b) => a.indexOf(b),
  /* 'repeat': (a, b) => {
    return Action.of(arrayRepeat(a, b));
  }, */

  /**
     ## `zip`

     ```
     f♭> [ 1 2 3 ] [ 4 5 6 ] zip
     [ 1 4 2 5 3 6 ]
     ```
  **/
  'zip': typed('zip', {
    'Array, Array': (a, b) => {
      const l = a.length < b.length ? a.length : b.length;
      const r = [];
      for (let i = 0; i < l; i++) {
        r.push(a[i], b[i]);
      }
      return freeze(r);
    }
  }),

  /**
     ## `zipinto`
  **/
  'zipinto': typed('zipinto', {
    'Array, Array, Array': (a, b, c) => {
      const l = a.length < b.length ? a.length : b.length;
      const r = [];
      for (let i = 0; i < l; i++) {
        r.push(a[i], b[i], ...c);
      }
      return freeze(r);
    }
  }),

  /**
     ## `(`
     pushes a quotation maker onto the stack
  **/
  '(': ':quote',        // list

  /**
     ## `)`
     collects stack items upto the last quote marker
  **/
  ')': ':dequote',

  /**
     ## `[`
     pushes a quotation maker onto the stack, increments depth
  **/
  '[': ':quote :d++',   // quote

  /**
     ## `]`
     decrements depth, collects stack items upto the last quote marker
  **/
  ']': ':d-- :dequote',

  /**
     ## `{`
     pushes a quotation maker onto the stack
  **/
  '{': ':quote',        // object

  /**
     ## `}`
     collects stack items upto the last quote marker, converts to an object
  **/
  '}': ':dequote :object',

  /**
     ## `template`
     converts a string to a string template
  **/
  'template': generateTemplate,

  /**
     ## `sleep`
     wait x milliseconds

     ( x -> )
  **/
  'sleep': ms => {  // todo: make cancelable?
    // let timerId;
    const promise = new Promise(resolve => {
      // timerId =
      setTimeout(resolve, ms);
    });
    // promise.__cancel__ = () => clearTimeout(timerId);
    return promise;
  },

  /**
     ## `fetch`
     fetch a url as a string

     ( {url} -> {string} )
  **/
  'fetch': url => fetch(url)
    .then(res => {
      return res.text();
    }),

  /**
     ## `get-log-level`
     gets the current logging level

     ( -> {string} )
  **/
  'get-log-level': () => log.level,

  /**
    ## `set-log-level`
    sets the current logging level

    ( {string} -> )
  **/
  'set-log-level': a => {
    log.level = a;
  }
};
