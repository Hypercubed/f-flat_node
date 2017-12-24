
export type bool = boolean | null;
export type cmpValue = -1 | 0 | 1;

export function not(a: bool) {
  if (a === true) return false;
  if (a === false) return true;
  return null;
}

export function and(lhs: bool, rhs: bool): bool {
  if (lhs === true) return rhs;
  if (rhs === true) return lhs;
  if (lhs === false || rhs === false) return false;
  return null;
}

export function nand(lhs: bool, rhs: bool): bool {
  return not(and(lhs, rhs));
}

export function or(lhs: bool, rhs: bool): bool {
  return nand(not(lhs), not(rhs));
}

export function xor(lhs: bool, rhs: bool): bool {
  return and(or(lhs, rhs), nand(lhs, rhs));
}

export function nor(lhs: bool, rhs: bool): bool {
  return not(or(lhs, rhs));
}

export function mimpl(lhs: bool, rhs: bool): bool {
  return or(not(lhs), rhs);
}

export function cimpl(lhs: bool, rhs: bool): bool {
  return or(lhs, not(rhs));
}

export function mnonimpl(lhs: bool, rhs: bool): bool {
  return and(lhs, not(rhs));
}

export function cnonimpl(lhs: bool, rhs: bool): bool {
  return and(not(lhs), rhs);
}

export function cmp(lhs: bool, rhs: bool): cmpValue {
  const slhs = sort_order(lhs);
  const srhs = sort_order(rhs);
  if (slhs === srhs) return 0;
  return slhs > srhs ? 1 : -1;
}

function sort_order(a: bool): cmpValue {
  if (a === null) return 0;
  return a ? 1 : -1;
}
