import is from 'fantasy-helpers/src/is';
import {typed} from '../types/index';
import {freeze} from 'icepick';

const toObject = typed('object', {
  'Array': a => {  // hash-map
    const r = {};
    const l = a.length;
    for (let i = 0; l - i > 1; i++) {
      Object.assign(r, {[a[i++]]: a[i]});
    }
    return r;
  },
  any: Object
});

export default {
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
  'object': toObject,
  'object?': typed('object_', {
    'Array | null | number | Complex': a => false,
    'Object': a => true,
    'any': a => false,
  }),
  'contains?': (a, b) => b in a,  // object by keys, array by values
  'keys': o => freeze(Object.keys(o)),
  'vals': o => freeze(Object.values(o)),
  'assign': '{} [ + ] reduce'
};
