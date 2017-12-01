import { typed } from './typed';
import { formatValue } from '../utils/pprint';

function toString(x: any) {
  if (Array.isArray(x)) {
    return `[ ${x.map(x => toString(x)).join(' ')} ]`;
  }
  return String(x);
}

export class Action { // rename word, create sentence
  constructor(public value: any, public displayString?: string) {
    if (!displayString) {
      this.displayString = toString(value);
    }
    Object.freeze(this);
  }

  inspect(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }
    if (typeof this.value === 'undefined') {
      return 'undefined';
    }
    return this.value.inspect ? this.value.inspect() : String(this.value);
  }

  toJSON(): any {
    return {
      '@@Action': this.value
    };
  }

  equals(b: any): boolean {
    return typeof this.value.equals === 'function'
      ? this.value.equals(b.value)
      : this.value === b.value;
  }

  extract(): any {
    return this.value;
  }

  toString(): string {
    return toString(this.value);
  }

  [Symbol.toPrimitive](hint?: string) {
    if (hint === 'string') {
      return toString(this.value);
    }
    if (hint === 'number') {
      return Number(this.value);
    }
    return this.value;
  }
}

typed.addType({
  name: 'Action',
  test: item => item instanceof Action
});

