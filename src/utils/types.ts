import { signature, Any } from '@hypercubed/dynamo';

import {
  dynamo,
  Key,
  Word,
  Sentence,
  Decimal,
  Complex,
} from '../types/index';

class GetType {
  @signature([Word, Sentence, Key])
  words(x: Word | Sentence | Key) {
    return 'action';
  }
  @signature(Array)
  array(x: any[]) {
    return 'array';
  }
  @signature([Number, Decimal])
  Decimal(x: Decimal) {
    return 'number';
  }
  @signature()
  Complex(x: Complex) {
    return 'complex';
  }
  @signature()
  Date(x: Date) {
    return 'date';
  }
  @signature()
  RegExp(x: RegExp) {
    return 'regexp';
  }
  @signature(Any)
  any(x: unknown) {
    return typeof x;
  }
}

// TODO: get type name from dynamo?
export const type = dynamo.function(GetType);