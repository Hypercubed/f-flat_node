import { Dynamo, guard } from '@hypercubed/dynamo';

import { Future } from './future';
import { DecimalDef } from './decimal';
import { Complex } from './complex';
import { Word, Sentence } from './words';
import { ComplexInfinity, Indeterminate } from './complexInfinity';

export const dynamo = new Dynamo();

class IsSymbol {
  @guard(Symbol)
  static isSymbol(value: unknown) {
    return typeof value === 'symbol';
  }
}

dynamo.add(
  Future, Word, Sentence,
  DecimalDef, Complex,
  ComplexInfinity, Indeterminate,
  IsSymbol
);