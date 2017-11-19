import { typed, Action } from '../types/index';

export const arrayRepeat = (a: any[], len: any) => {
  len = Number(len) | 0;
  let acc: any[] = [];
  if (len < 1) {
    return acc;
  }
  let i = -1;
  while (++i < len) {
    acc = acc.concat(a);
  }
  return acc;
};

export const arrayMul = (lhs: any[], rhs: any) => {
  const len = lhs.length;
  let acc: any[] = [];
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

function baseGet(coll: Object, path: string[]) {
  return (path || []).reduce((curr: any, key: string) => {
    if (!curr) return;
    curr = Action.isAction(curr) ? curr.value : curr;
    return curr[key];
  }, coll);
}

export const pluck = (context: Object, path: string) => {
  return baseGet(context, path.split('.'));
};

export const update = (context: Object, path: string, value: any) => { // watch immutability
  const pathArr = path.split('.');
  if (pathArr.length === 1) {
    return context[path] = value;
  }
  pathArr.reduce((curr, key, currentIndex) => {
    if (currentIndex < pathArr.length - 1) {
      return curr[key];
    }
    curr[key] = value;
  }, context);
};

export const remove = (context: Object, path: string, value: any) => { // watch immutability
  const pathArr = path.split('.');
  if (pathArr.length === 1) {
    return context[path] = value;
  }
  pathArr.reduce((curr, key, currentIndex) => {
    if (currentIndex < pathArr.length - 1) {
      return curr[key];
    }
    try {
      delete curr[key];
    } catch (e) {
      curr[key] = undefined;
    }
  }, context);
};

/* istanbul ignore next */
export function noop() {}

/* istanbul ignore next */
export function throwError(e: Error) {
  throw e;
}

/* export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
} */

const __eql = typed('eql', {
  'Array, Array': (a: any[], b: any[]) => {
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
  'Action, Action': (a: Action, b: Action) => {
    return a.value === b.value;
  },
  'BigNumber | Complex, BigNumber | Complex | number': (a: any, b: any) => {
    return a.equals(b);
  },
  'Date, any': (a: Date, b: any) => {
    return +a === +b;
  },
  'any, Date': (a: any, b: Date) => {
    return +a === +b;
  },
  'any, any': (a: any, b: any) => {
    return a === b;
  }
});

export function eql(a: any, b: any) {
  if (a === b || a == b) { // tslint:disable-line
    // eslint-disable-line eqeqeq
    return true;
  }
  return __eql(a, b);
}
