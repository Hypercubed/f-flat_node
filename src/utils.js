import {typed, Action} from './types/index';

/* export function nAry (n, fn) {
  switch (n) {
    case 0: return function () { return fn.call(this); };
    case 1: return function (a0) { return fn.call(this, a0); };
    case 2: return function (a0, a1) { return fn.call(this, a0, a1); };
    case 3: return function (a0, a1, a2) { return fn.call(this, a0, a1, a2); };
    case 4: return function (a0, a1, a2, a3) { return fn.call(this, a0, a1, a2, a3); };
    case 5: return function (a0, a1, a2, a3, a4) { return fn.call(this, a0, a1, a2, a3, a4); };
    case 6: return function (a0, a1, a2, a3, a4, a5) { return fn.call(this, a0, a1, a2, a3, a4, a5); };
    case 7: return function (a0, a1, a2, a3, a4, a5, a6) { return fn.call(this, a0, a1, a2, a3, a4, a5, a6); };
    case 8: return function (a0, a1, a2, a3, a4, a5, a6, a7) { return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7); };
    case 9: return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8); };
    case 10: return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9); };
    default: throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
  }
}

export function unary (fn) {
  return nAry(1, fn);
} */

export const arrayRepeat = (a, b) => {
  b = +b | 0;
  if (b === 0) { return []; }
  var r = [];
  var len = a.length * b;
  while (r.length < len) { r = r.concat(a); }
  return r;
};

export function pluck (context, path) {
  // if (path === '.') return undefined;

  const pathParts = path.split('.');
  let ii = pathParts.length;

  for (let i = 0; i < ii; i++) {
    if (!context) { break; }
    context = context[pathParts[i]];
  }

  return context;
}

/* export function copy (src) {
  if (src instanceof Array) {
    return src.slice();
  }
  return src;
} */

export function noop () {}
export function throwError (e) { throw e; }

/* export function isLineTerminator (ch) {
  return (ch === '\n') || (ch === '\r') || (ch === 0x2028) || (ch === 0x2029);
}

export function isWhitespace (ch) {
  return (ch === ',') || // camma
        (ch === ' ') ||  // space
        (ch === '\t') || (ch === '\v') || // tab
        isLineTerminator(ch) || // newlines
        (ch === '\n') ||
        (ch === 0xB) ||
        (ch === 0xC) ||
        (ch === 0xA0) ||
        (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
} */

/* export function isWhitespace (ch) {
  return (ch === ' ' || ch === '\r' || ch === '\t' ||
          ch === '\n' || ch === '\v' || ch === '\u00A0' ||
          ch === ',');
} */

/* export function isQuote (ch) {
  return (ch === '"' || ch === '\'');
} */

/* export function isBracket (ch) {
  return (ch === '{' || ch === '}' ||
          ch === '[' || ch === ']' ||
          ch === '(' || ch === ')');
} */

/* export function isNumeric (num) {
  return !isNaN(num);
}

export function isBoolean (string) {
  var lc = string.toLowerCase();
  return lc === 'true' || lc === 'false';
} */

export function isPromise (val) {
  return val && typeof val.then === 'function';
}

export function isDefined (val) {
  return typeof val !== 'undefined';
}

const __eql = typed('eql', {
  'Array, Array': function (a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!eql(a[i], b[i])) { return false; }
    }
    return true;
  },
  'Action, Action': function (a, b) {
    return a.value === b.value;
  },
  'BigNumber, BigNumber | number': function (a, b) {
    return a.equals(b);
  },
  'any, any': function (a, b) {
    return a === b;
  }
});

export function eql (a, b) {
  if (a === b || a == b) { return true; } // eslint-disable-line eqeqeq
  return __eql(a, b);
}

/* export function eql (a, b) {
  if (a == b) { return true; }
  if (a instanceof Array && b instanceof Array) {
    if (a.length === b.length) {
      for (var i = 0; i < a.length; i++) {
        if (!eql(a[i], b[i])) { return false; }
      }
      return true;
    }
  }
  if (a instanceof Action && b instanceof Action) {
    return a.value === b.value;
  }
  if (a instanceof BigNumber && b instanceof BigNumber) {
    return a.equals(b);
  }
  return is.equal(a, b);
} */

/* export function toLiteral (d) {
  if (isNumeric(d)) {
    return Object.freeze(new BigNumber(d));
  }
  if (isBoolean(d)) {
    return d.toLowerCase() === 'true';
  }
  if (d === 'i') {
    return I;
  }
  return processIdentifier(d);
} */

export const asap = typeof setImmediate === 'function' ? setImmediate  // from https://github.com/folktale/data.task/blob/master/lib/task.js#L9
  : typeof process !== 'undefined' ? process.nextTick
  : function (fn) { setTimeout(fn, 0); };

const re0 = /\$\(.*\)/g;
const cap = '%-cap-%';
const caplen = cap.length;
const re = new RegExp(`(${cap}\\$\\(.*\\))`, 'g');

export function generateTemplate (template) {
  var r = [''];

  template
    .replace(re0, x => cap + x)
    .split(re).forEach(s => {
      if (s.slice(0, caplen) === cap) {
        r.push(s.slice(caplen + 1));
        r.push(Action.of('eval'));
        r.push(Action.of('string'));
        r.push(Action.of('+'));
      } else {
        r.push(String(s));
        r.push(Action.of('+'));
      }
    });
  return r;
}
