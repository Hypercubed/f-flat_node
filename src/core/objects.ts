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
   * `[ a: b ... ] -> { a: b ... }`
   *
   * convert a quotation to an object
   *
   */
  object: toObject,

  /**
   * ## `object?`
   *
   * `a -> bool`
   *
   * retruns true of the item is an object
   */
  'object?': dynamo.function(IsObject),

  /**
   * ## `has?`
   *
   * `{A} a: -> bool`
   *
   * returns true if an item contains a key
   *
   */
  'has?': (a: {}, b: any) => b in a, // object by keys, array by values (move to indexof?)

  /**
   * ## `keys`
   *
   * `{A} -> [str*]`
   *
   * returns an array of keys
   *
   */
  keys: (o: {}) => Object.keys(o),

  /**
   * ## `vals`
   *
   * `{A} -> [b*]`
   *
   * returns an array of values
   *
   */
  vals: (o: {}) => Object.values(o)
};
