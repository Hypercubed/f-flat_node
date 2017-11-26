export function and(lhs, rhs) {
  if (Number.isNaN(rhs)) {
    return lhs && rhs;
  }
  return rhs && lhs;
}

export function xor(lhs, rhs) {
  return (lhs || rhs) && !(lhs && rhs);
}

export function or(lhs, rhs) {
  if (Number.isNaN(rhs)) {
    return lhs || rhs;
  }
  return rhs || lhs;
}

export function nand(lhs, rhs) {
  if (Number.isNaN(lhs)) {
    return !rhs || NaN;
  }
  if (Number.isNaN(rhs)) {
    return !lhs || NaN;
  }
  return !(rhs && lhs);
}

export function not(lhs) {
  return Number.isNaN(lhs) ? NaN : !lhs;
}