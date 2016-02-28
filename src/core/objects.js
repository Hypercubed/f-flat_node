import is from 'fantasy-helpers/src/is';
import {typed} from '../types/index';

export default {
  'group': typed('group', {  // move
    'Array': a => {
      const r = [];
      const l = a.length;
      for (var i = 0; l - i > 1; i++) {
        r.push([a[i++], a[i]]);
      }
      return r;
    }
  }),
  'object': typed('object', {
    'Array': a => {  // hash-map
      const r = {};
      const l = a.length;
      for (var i = 0; l - i > 1; i++) {
        Object.assign(r, { [a[i++]]: a[i] });
      }
      return r;
    },
    'any': Object
  }),
  'object?': a => is.isObject(a) && !is.isArray(a),
  'contains?': (a, b) => b in a,  // object by keys, array by values
  'keys': Object.keys,
  'vals': Object.values,
  '{': '(',
  '}': ') object',
  'assign': '{} [ + ] reduce'
};

// todo: zip-map
// use maps by default?
