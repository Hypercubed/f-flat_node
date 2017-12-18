import { typed } from '../types';
import { toObject } from '../utils';

/**
 * # Internal Object Words
 */
export const objects = {
  /* 'group': typed('group', {  // move
    Array: a => {
      const r = [];
      const l = a.length;
      for (let i = 0; l - i > 1; i++) {
        r.push([a[i++], a[i]]);
      }
      return r;
    }
  }), */

  /**
   * ## `object`
   */
  object: toObject,

  /**
   * ## `object?`
   */
  'object?': typed('object_', {
    'Array | null | number | Complex': a => false, // eslint-disable-line no-unused-vars
    Object: a => true, // eslint-disable-line no-unused-vars
    any: a => false // eslint-disable-line no-unused-vars
  }),

  /**
   * ## `contains?`
   */
  'contains?': (a: {}, b: any) => b in a, // object by keys, array by values

  /**
   * ## `keys`
   */
  keys: (o: {}) => Object.keys(o), // v: `o => Object.values(o)` js-raw ;

  /**
   * ## `vals`
   */
  vals: (o: {}) => Object.values(o), // v: `o => Object.values(o)` js-raw ;
};
