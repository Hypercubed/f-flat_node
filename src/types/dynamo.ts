import { Dynamo, guard } from '@hypercubed/dynamo';

import { Future } from './future';
import { DecimalDef } from './decimal';
import { Complex } from './complex';
import { Word, Key, Sentence } from './words';
import { GlobalSymbol } from './vocabulary-values';
import { ComplexInfinity, Indeterminate } from './complex-infinity';

export const dynamo = new Dynamo();

class IsSymbol {
  @guard(Symbol)
  static isSymbol(value: unknown) {
    return typeof value === 'symbol';
  }
}

dynamo.add(GlobalSymbol, Future, Word, Key, Sentence, DecimalDef, Complex, ComplexInfinity, Indeterminate, IsSymbol);
