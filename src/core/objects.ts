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
  'contains?': (a: {}, b: any) => b in a, // object by keys, array by values

  /**
   * ## `keys`
   */
  keys: (o: {}) => Object.keys(o),

  /**
   * ## `vals`
   */
  vals: (o: {}) => Object.values(o)
};
