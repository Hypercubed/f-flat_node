import { Dynamo, guard, conversion } from '@hypercubed/dynamo';

import { Future } from './future';
import { Decimal } from './decimal';
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

class DecimalDef {
  @guard(Decimal)
  static isDecimal(value: unknown) {
    return value instanceof Decimal;
  }

  @conversion()
  static fromNumber(value: number): Decimal {
    return new Decimal(value);
  }
}

dynamo.add(
  Future, Word, Sentence,
  DecimalDef, Complex,
  ComplexInfinity, Indeterminate,
  IsSymbol
);