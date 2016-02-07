import {typed, Atom, BigNumber, I} from './types/index';

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

export function isWhitespace (ch) {
  return (ch === ' ' || ch === '\r' || ch === '\t' ||
          ch === '\n' || ch === '\v' || ch === '\u00A0' ||
          ch === ',');
}

export function isQuote (ch) {
  return (ch === '"' || ch === '\'' || ch === '\`');
}

export function isBracket (ch) {
  return (ch === '{' || ch === '}' ||
          ch === '[' || ch === ']' ||
          ch === '(' || ch === ')');
}

export function isNumeric (num) {
  return !isNaN(num);
}

export function isBoolean (string) {
  var lc = string.toLowerCase();
  return lc === 'true' || lc === 'false';
}

const __eql = typed('eql', {
  'Array, Array': function (a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!eql(a[i], b[i])) { return false; }
    }
    return true;
  },
  'Atom, Atom': function (a, b) {
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
  if (a instanceof Atom && b instanceof Atom) {
    return a.value === b.value;
  }
  if (a instanceof BigNumber && b instanceof BigNumber) {
    return a.equals(b);
  }
  return is.equal(a, b);
} */

export function toLiteral (d) {
  if (isNumeric(d)) {
    return Object.freeze(new BigNumber(d));
  } else if (isBoolean(d)) {
    return d.toLowerCase() === 'true';
  } else if (d === 'i') {
    return I;
  }
  switch (d[0]) {
    case '#':
      return Symbol(d.slice(1));
    case '$':
      return d.slice(1);
    default:
      if (d.length > 1 && (d[d.length - 1] === ':' || d[0] === '\\')) {
        if (d[d.length - 1] === ':') {
          d = d.slice(0, d.length - 1);
        } else if (d[0] === '\\') {
          d = d.slice(1);
        }
        d = toLiteral(d);
      }
      return new Atom(d);
  }
}
