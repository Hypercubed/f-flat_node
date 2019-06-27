import { typed } from './typed';

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

export const complexInfinity = new AbstractValue('ComplexInfinity');
export const indeterminate = new AbstractValue('Indeterminate');

/* typed.addType({
  name: 'AbstractValue',
  test: x => x instanceof AbstractValue
}); */

typed.addType({
  name: 'ComplexInfinity',
  test: (x: unknown) => x === complexInfinity
});

typed.addType({
  name: 'Indeterminate',
  test: (x: unknown) => x === indeterminate
});

/* typed.addType({
  name: 'zero',
  test: x => {
    console.log('zero', x, +x === 0);
    return +x === 0;
  }
}); */

typed.addType({
  name: 'infinity',
  test: (x: unknown) => {
    return x === Infinity || x === -Infinity;
  }
});
