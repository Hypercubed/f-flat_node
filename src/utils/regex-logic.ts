import * as jRex from 'jrex';

export function rAnd(lhs: RegExp, rhs: RegExp) {
  const slhs = jRex({regex: lhs, ahead: true }).regex().source;
  const srhs = jRex({regex: rhs, ahead: true }).regex().source;
  const flags = lhs.flags;
  return new RegExp(slhs + srhs, flags);
}

export function rNot(lhs: RegExp) {
  const out = lhs.source;
  const flags = lhs.flags;
  return jRex({regex: lhs, ahead: 'not', flags}).regex();
}

export function rNand(lhs: RegExp, rhs: RegExp) {
  return rNot(rAnd(lhs, rhs));
}

export function rOr(lhs: RegExp, rhs: RegExp) {
  const flags = lhs.flags;
  return jRex({or: [lhs, rhs], flags}).regex();
}

export function rXor(lhs, rhs) {
  return rAnd(rOr(lhs, rhs), rNot(rAnd(lhs, rhs)));
}

export function rLsh(lhs: RegExp, rhs: RegExp) {
  const flags = lhs.flags;
  return jRex({sub: [lhs, rhs], flags}).regex();
}

export function rRsh(lhs: RegExp, rhs: RegExp) {
  const flags = rhs.flags;
  return jRex({sub: [lhs, rhs], flags}).regex();
}

export function rRepeat(lhs: RegExp, rhs: number) {
  rhs = +rhs;
  const flags = lhs.flags;
  const max = rhs === Infinity ? null : rhs | 0;
  const min = rhs === Infinity ? 1 : rhs | 0;
  return jRex({regex: lhs, flags, max, min }).regex();
}