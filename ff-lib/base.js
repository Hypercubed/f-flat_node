import is from 'is';
import {eql} from '../src/utils';

module.exports = {
  '+': function (lhs, rhs) {
    if (is.array(lhs) && is.array(rhs)) {  // concat
      return lhs.concat(rhs);
    }
    if (is.bool(rhs) && is.bool(lhs)) {  // boolean or
      return lhs || rhs;
    }
    return lhs + rhs;
  },
  '-': function (lhs, rhs) {
    if (is.bool(rhs) && is.bool(lhs)) { // boolean xor
      return (lhs || rhs) && !(lhs && rhs);
    }
    return lhs - rhs;
  },
  '*': function (lhs, rhs) {
    if (is.bool(rhs) && is.bool(lhs)) { // boolean and
      return (lhs && rhs);
    }
    if (typeof lhs === 'string' && typeof rhs === 'number') {
      rhs = rhs | 0;
      return new Array(rhs + 1).join(lhs);
    }
    if (is.array(lhs) && typeof rhs === 'string') {  // string join
      return lhs.join(rhs);
    }
    if (is.array(lhs) && is.array(rhs)) {
      var l = [];
      for (var i = 0; i < lhs.length; i++) {
        l.push(lhs[i]);
        l = l.concat(rhs);
      }
      return l;
    }
    if (is.array(lhs) && typeof rhs === 'number') {
      rhs = rhs | 0;
      if (rhs === 0) { return []; }
      var a = [];
      var len = lhs.length * rhs;
      while (a.length < len) { a = a.concat(lhs); }
      return a;
    }
    return lhs * rhs;
  },
  '/': function (lhs, rhs) {
    if (is.bool(rhs) && is.bool(lhs)) {  // boolean nand
      return !(lhs && rhs);
    }
    if (typeof lhs === 'string' && typeof rhs === 'string') {  // string split
      return lhs.split(rhs);
    }
    if ((typeof lhs === 'string' || is.array(lhs)) && typeof rhs === 'number') {  // string split
      rhs = rhs | 0;
      var len = lhs.length / rhs;
      return lhs.slice(0, len);
    }
    return lhs / rhs;
  },
  '>>': function (lhs, rhs) {
    rhs.unshift(lhs);
    return rhs;
  },
  '<<': function (lhs, rhs) {
    lhs.push(rhs);
    return lhs;
  },
  '%': (lhs, rhs) => lhs % rhs,
  '>': (lhs, rhs) => lhs > rhs,
  '<': (lhs, rhs) => lhs < rhs,
  '=': eql,
  'choose': (b, t, f) => b ? t : f
};
