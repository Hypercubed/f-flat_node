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
   *
   * convert a quotation to an object
   *
   */
  object: toObject,

  /**
   * ## `object?`
   *
   * retruns true of the item is an object
   */
  'object?': dynamo.function(IsObject),

  /**
   * ## `contains?`
   *
   * returns true if an item contains a key
   *
   */
  'contains?': (a: {}, b: any) => b in a, // object by keys, array by values (move to indexof?)

  /**
   * ## `keys`
   *
   * returns an array of keys
   *
   */
  keys: (o: {}) => Object.keys(o),

  /**
   * ## `vals`
   *
   * returns an array of values
   *
   */
  vals: (o: {}) => Object.values(o)
};
