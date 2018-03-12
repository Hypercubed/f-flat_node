import { typed } from './typed';
import { formatValue } from '../utils/pprint';
import { encode } from '../utils/json';
import { StackValue } from './stackValue';

function toString(x: any) {
  if (Array.isArray(x)) {
    return `[ ${x.map(x => toString(x)).join(' ')} ]`;
  }
  return String(x);
}

class Action {
  constructor(public value: any, public displayString?: string) {
    if (!displayString) {
      this.displayString = toString(value);
    }
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
      '@@Action': encode(this.value)
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

export class Word extends Action {
  constructor(value: string, displayString?: string) {
    super(value, displayString);
  }
}

export class Sentence extends Action {
  constructor(value: StackValue[], displayString?: string) {
    super(value, displayString);
  }
}

typed.addType({
  name: 'Sentence',
  test: item => item instanceof Sentence
});

typed.addType({
  name: 'Word',
  test: item => item instanceof Word
});
