import is from 'is';

import {typed, Command} from '../src/types/';

module.exports = {
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
  'object?': is.object,
  'contains?': (a, b) => b in a,  // object by keys, array by values
  'keys': Object.keys,
  'vals': Object.values,
  ':': a => new Command(a),  // object constructon
  '{': '[',
  '}': '] in object'
};

// todo: zip-map
// use maps by default?
