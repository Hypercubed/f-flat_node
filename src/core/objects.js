import is from 'fantasy-helpers/src/is';
import {typed} from '../types/index';

export default {
  'object': typed('object', {
    'Array': a => {  // hash-map
      const r = {};
      a = a.slice();  // destructive copy, source array is immutable
      while (a.length > 1) {
        Object.assign(r, { [a.shift()]: a.shift() });
      }
      return r;
    },
    'any': Object
  }),
  'object?': a => is.isObject(a) && !is.isArray(a),
  'contains?': (a, b) => b in a,  // object by keys, array by values
  'keys': Object.keys,
  'vals': Object.values,
  ':': 'atom',
  '{': '[',
  '}': '] in object',
  'assign': '{} [ + ] reduce'
};

// todo: zip-map
// use maps by default?
