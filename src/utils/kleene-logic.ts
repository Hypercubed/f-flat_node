import is from '@sindresorhus/is';

export function not(a: boolean) {
  return (is as any).null(a) ? null : !a;
}

export function and(lhs, rhs) {
  if ((is as any).null(lhs)) {
    if ((is as any).null(rhs)) return null;
    return rhs ? null : false;
  }
  if ((is as any).null(rhs)) {
    return lhs ? null : false;
  }
  return rhs && lhs;
}

export function or(lhs, rhs) {
  if ((is as any).null(rhs)) {
    return lhs || rhs;
  }
  return rhs || lhs;
}

export function cmp(lhs, rhs) {
  lhs = k(lhs);
  rhs = k(rhs);
  if (lhs === rhs) {
    return 0;
  }
  return lhs > rhs ? 1 : -1;
}

export function xor(lhs, rhs) {
  return and(or(lhs, rhs), nand(lhs, rhs));
}

export function nand(lhs, rhs) {
  return not(and(lhs, rhs));
}

export function nor(lhs, rhs) {
  return not(or(lhs, rhs));
}

export function mimpl(lhs, rhs) {
  return or(not(lhs), rhs);
}

export function cimpl(lhs, rhs) {
  return or(lhs, not(rhs));
}

export function mnonimpl(lhs, rhs) {
  return and(lhs, not(rhs));
}

export function cnonimpl(lhs, rhs) {
  return and(not(lhs), rhs);
}

function k(a) {
  if ((is as any).null(a)) return 0;
  return a ? 1 : -1;
}

export function r(a) {
  if (a === 0) return null;
  return a === 1;
}
