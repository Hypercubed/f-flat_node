import { guard } from '@hypercubed/dynamo';
import { encode } from '../utils/json';
import { StackValue } from './stack-values';

function toString(x: any) {
  if (Array.isArray(x)) {
    return `[ ${x.map(x => toString(x)).join(' ')} ]`;
  }
  return String(x);
}

abstract class Action {
  constructor(public readonly value: any, public readonly displayString?: string) {
    if (!displayString) {
      this.displayString = toString(value);
    }
    if (new.target === Action) {
      Object.freeze(this);
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

  equals(b: any): boolean {
    return typeof this.value.equals === 'function' ? this.value.equals(b.value) : this.value === b.value;
  }

  extract(): any {
    return this.value;
  }

  toString(): string {
    return toString(this.displayString || this.value);
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

  constructor(public readonly value: string, public readonly displayString?: string) {
    // value s/b PropertyKey?
    super(value, displayString);
    if (new.target === Word) {
      Object.freeze(this);
    }
  }

  toJSON(): any {
    return {
      '@@Word': encode(this.value)
    };
  }
}

export class Key extends Action {
  @guard()
  static isKey(x: unknown): x is Key {
    return x instanceof Key;
  }

  constructor(public readonly value: string, public readonly displayString?: string) {
    super(value, displayString);
    if (!displayString) {
      this.displayString = toString(value) + ':';
    }
    if (new.target === Key) {
      Object.freeze(this);
    }
  }

  toJSON(): any {
    return {
      '@@Key': encode(this.value)
    };
  }
}

export class Sentence extends Action {
  @guard()
  static isSentence(x: unknown): x is Sentence {
    return x instanceof Sentence;
  }

  constructor(public readonly value: StackValue[], public readonly displayString?: string) {
    super(value, displayString);
    if (new.target === Sentence) {
      Object.freeze(this);
    }
  }

  toJSON(): any {
    return {
      '@@Sentence': encode(this.value)
    };
  }
}
