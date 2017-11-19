import { setIn, freeze, thaw, merge } from 'icepick';
import cloneDeep from 'clone-deep';

import { typed, Action } from '../types/index';

export const arrayRepeat = (a, len) => {
  len = Number(len) | 0;
  let acc = [];
  if (len < 1) {
    return acc;
  }
  let i = -1;
  while (++i < len) {
    acc = acc.concat(a);
  }
  return acc;
};

export const arrayMul = (lhs, rhs) => {
  const len = lhs.length;
  let acc = [];
  if (len < 1) {
    return acc;
  }
  let i = -1;
  while (++i < len) {
    acc = acc.concat(lhs[i], rhs);
  }
  return acc;
};

/* export const listMul = (lhs, rhs) => {
  return lhs.flatMap(x => [x, ...rhs]);
}; */

function baseGet(coll, path) {
  return (path || []).reduce((curr, key) => {
    if (!curr) return;
    curr = Action.isAction(curr) ? curr.value : curr;
    return curr[key];
  }, coll);
}

export const pluck = (context, path) => {
  return baseGet(context, path.split('.'));
}

export const update = (context, path, value) => { // watch immutability
  path = path.split('.');
  if (path.length === 1) {
    return context[path] = value;
  }
  path.reduce((curr, key, currentIndex) => {
    if (currentIndex < path.length - 1) {
      return curr[key];
    }
    curr[key] = value;
  }, context);
}

/* istanbul ignore next */
export function noop() {}

/* istanbul ignore next */
export function throwError(e) {
  throw e;
}

export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function isPromise(val) {
  return val && typeof val.then === 'function';
}

export function isDefined(val) {
  return typeof val !== 'undefined';
}

const __eql = typed('eql', {
  'Array, Array': (a, b) => {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!eql(a[i], b[i])) {
        return false;
      }
    }
    return true;
  },
  'Action, Action': (a, b) => {
    return a.value === b.value;
  },
  'BigNumber | Complex, BigNumber | Complex | number': (a, b) => {
    return a.equals(b);
  },
  'Date, any': (a, b) => {
    return +a === +b;
  },
  'any, Date': (a, b) => {
    return +a === +b;
  },
  'any, any': (a, b) => {
    return a === b;
  }
});

export function eql(a, b) {
  if (a === b || a == b) {
    // eslint-disable-line eqeqeq
    return true;
  }
  return __eql(a, b);
}
