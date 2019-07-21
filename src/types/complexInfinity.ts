import { guard } from '@hypercubed/dynamo';

import { Complex } from './complex';

export class AbstractValue {
  constructor(public type: string) {}

  toString(): string {
    return this.type;
  }

  inspect(): string {
    return this.toString();
  }

  valueOf() {
    return Infinity;
  }
}

export class Indeterminate extends AbstractValue {
  static indeterminate = new Indeterminate();

  @guard()
  static isIndeterminate(a: any): a is ComplexInfinity {
    return a === Indeterminate.indeterminate;
  }

  constructor() {
    super('Indeterminate');
  }
}

export class ComplexInfinity extends AbstractValue {
  static complexInfinity = new ComplexInfinity();

  static get symbol() {
    return '∞̅';
  }

  static times(rhs: Complex | ComplexInfinity) {
    if (ComplexInfinity.isComplexInfinity(rhs)) {
      return ComplexInfinity.complexInfinity;
    }

    if (rhs.cmp(0) !== 0) {
      return ComplexInfinity.complexInfinity;
    }

    return indeterminate;
  }

  static div(rhs: Complex | ComplexInfinity) {
    if (ComplexInfinity.isComplexInfinity(rhs)) {
      return indeterminate;
    }
    return ComplexInfinity.complexInfinity;
  }

  static idiv(lhs: Complex | ComplexInfinity) {
    return 0;
  }

  @guard()
  static isComplexInfinity(a: any): a is ComplexInfinity {
    return a === ComplexInfinity.complexInfinity;
  }

  constructor() {
    super('ComplexInfinity');
  }
}

export const { complexInfinity } = ComplexInfinity;
export const { indeterminate } = Indeterminate;
