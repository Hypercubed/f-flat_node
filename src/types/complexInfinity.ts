import { typed } from './typed';
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

export const indeterminate = new AbstractValue('Indeterminate');

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

  static isComplexInfinity(a: any): a is ComplexInfinity {
    return a === ComplexInfinity.complexInfinity;
  }

  constructor() {
    super('ComplexInfinity');
  }
}

export const { complexInfinity } = ComplexInfinity;

typed.addType({
  name: 'ComplexInfinity',
  test: ComplexInfinity.isComplexInfinity
});

typed.addType({
  name: 'Indeterminate',
  test: (x: unknown) => x === indeterminate
});

typed.addType({
  name: 'infinity',
  test: (x: unknown) => {
    return x === Infinity || x === -Infinity;
  }
});
