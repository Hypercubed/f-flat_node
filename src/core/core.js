import fetch from 'isomorphic-fetch';

import {typed, Seq, Action} from '../types/index';
import {generateTemplate} from '../utils';
import {freeze, slice} from 'icepick';

export default {
  'id': x => x,  // same as nop
  'nop': () => {},
  'eval': typed('_eval', {
    'any': a => Action.of(a)
  }),
  'drop': a => {},  // eslint-disable-line
  'swap': (a, b) => Seq.of([b, a]),
  'dup': a => Seq.of([a, a]),
  'unstack': a => new Seq(a),
  'length': typed('length', { // count/size
    'Array | string': a => a.length,
    'Object': a => Object.keys(a).length,
    'null': a => 0  // eslint-disable-line
  }),
  'slice': typed('slice', {
    'Array | string, number | null, number | null': (lhs, b, c) => slice(lhs, b, c === null ? undefined : c),
    'any, number | null, number | null': (lhs, b, c) => slice(lhs, [b, c === null ? undefined : c])
  }),
  'splitat': typed('splitat', {
    'Array, number | null': (arr, a) => Seq.of([  // use head and tail?
      slice(arr, 0, a),
      slice(arr, a)
    ])
  }),
  'indexof': (a, b) => a.indexOf(b),
  /* 'repeat': (a, b) => {
    return Action.of(arrayRepeat(a, b));
  }, */
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
  'zipwith': 'zipinto in',
  'dot': '[ * ] zipwith sum',
  ':': 'atom',
  '(': ':quote',        // list
  ')': ':dequote',
  '[': ':quote :d++',   // quote
  ']': ':d-- :dequote',
  '{': ':quote',        // object
  '}': ':dequote :object',
  'template': generateTemplate,
  'yield': 'return suspend',
  'delay': '[ sleep ] >> slip eval',
  'sleep': ms => {  // todo: make cancelable?
    // let timerId;
    const promise = new Promise(resolve => {
      // timerId =
      setTimeout(resolve, ms);
    });
    // promise.__cancel__ = () => clearTimeout(timerId);
    return promise;
  },
  'next': 'fork',
  'fetch': url => fetch(url)
    .then(res => {
      return res.text();
    })
};
