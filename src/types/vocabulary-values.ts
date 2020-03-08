import { guard } from '@hypercubed/dynamo';
import { Word, Sentence } from './words';

export class GlobalSymbol {
  constructor(public readonly description: string = '') {
    if (new.target === GlobalSymbol) {
      Object.freeze(this);
    }
  }

  @guard(GlobalSymbol)
  static is(x: unknown): x is GlobalSymbol {
    return x instanceof GlobalSymbol;
  }

  toString(): string {
    return this.description;
  }
}

export type ScopeModule = { [k in string]: GlobalSymbol };

// TODO: only Sentence and ScopeModule
export type VocabValue =
  | Word
  | Sentence
  | ScopeModule
  | { [key: string]: VocabValue }
  | Function
  | symbol;
