import {
  sequence, flags, lookAhead, avoid, either, suffix
} from 'compose-regexp';

export function rAnd(lhs: RegExp, rhs: RegExp) {
  const slhs = lookAhead(lhs);
  const srhs = lookAhead(rhs);
  return flags(lhs.flags, sequence(slhs, srhs));
}

export function rNot(lhs: RegExp) {
  return flags(lhs.flags, avoid(lhs));
}

export function rNand(lhs: RegExp, rhs: RegExp) {
  return rNot(rAnd(lhs, rhs));
}

export function rOr(lhs: RegExp, rhs: RegExp) {
  return flags(lhs.flags, either(lhs, rhs));
}

export function rNor(lhs: RegExp, rhs: RegExp) {
  return rNot(rOr(lhs, rhs));
}

export function rXor(lhs, rhs) {
  return rAnd(rOr(lhs, rhs), rNot(rAnd(lhs, rhs)));
}

export function rLsh(lhs: RegExp, rhs: RegExp) {
  return flags(lhs.flags, sequence(lhs, rhs));
}

export function rRsh(lhs: RegExp, rhs: RegExp) {
  return flags(rhs.flags, sequence(lhs, rhs));
}

export function rRepeat(lhs: RegExp, rhs: number) {
  rhs = +rhs;
  const max = rhs === Infinity ? '' : rhs | 0;
  const min = rhs === Infinity ? 1 : rhs | 0;
  const s = max ? `{${min}}` : `{${min},${max}}`;
  return flags(lhs.flags, suffix(s, lhs));
}