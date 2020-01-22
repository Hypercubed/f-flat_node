import { guard } from '@hypercubed/dynamo';
import { encode } from '../utils/json';
import { StackValue } from './stack-value';

function toString(x: any) {
  if (Array.isArray(x)) {
    return `[ ${x.map(x => toString(x)).join(' ')} ]`;
  }
  return String(x);
}

abstract class Action {
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
  @guard()
  static isWord(x: unknown): x is Word {
    return x instanceof Word;
  }

  constructor(public value: string, public displayString?: string) {
    super(value, displayString);
  }
}

export class Key extends Action {
  @guard()
  static isKey(x: unknown): x is Key {
    return x instanceof Key;
  }

  constructor(public value: string, public displayString?: string) {
    super(value, displayString);
    if (!displayString) {
      this.displayString = toString(value) + ':';
    }
  }
}

export class Alias extends Action {
  @guard()
  static isAlias(x: unknown): x is Alias {
    return x instanceof Alias;
  }

  constructor(value: string, displayString?: string) {
    super(value, displayString);
  }
}

export class Sentence extends Action {
  @guard()
  static isSentence(x: unknown): x is Sentence {
    return x instanceof Sentence;
  }

  constructor(value: StackValue[], displayString?: string) {
    super(value, displayString);
  }
}
