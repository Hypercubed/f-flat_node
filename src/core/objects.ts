import { signature, Any } from '@hypercubed/dynamo';

import { dynamo } from '../types';
import { toObject } from '../utils';

// TODO: use dynamo to get the guard
class IsObject {
  @signature()
  map(a: object) {
    return true;
  }
  @signature()
  any(a: Any) {
    return false;
  }
}

/**
 * # Internal Object Words
 */
export const objects = {
  /* 'group': ('group', {  // move
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
  'object?': dynamo.function(IsObject),

  /**
   * ## `contains?`
   */
  'contains?'(a: {}, b: any) {
    return b in a;
  }, // object by keys, array by values

  /**
   * ## `keys`
   */
  keys(o: {}) {
    return Object.keys(o);
  }, // v: `o => Object.values(o)` js-raw ;

  /**
   * ## `vals`
   */
  vals(o: {}) {
    return Object.values(o);
  } // v: `o => Object.values(o)` js-raw ;
};
