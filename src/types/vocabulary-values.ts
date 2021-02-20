import { guard } from '@hypercubed/dynamo';
import { Sentence } from './words';

export class GlobalSymbol {
  private readonly name: string;

  constructor(public readonly description: string = '') {
    this.name = `${description}`;
    if (new.target === GlobalSymbol) {
      Object.freeze(this);
    }
  }

  @guard(GlobalSymbol)
  static is(x: unknown): x is GlobalSymbol {
    return x instanceof GlobalSymbol;
  }

  toString(): string {
    return this.name;
  }
}

export type ScopeModule = { [k in string]: GlobalSymbol };

export type VocabValue = Sentence | ScopeModule | { [key: string]: VocabValue } | Function;
