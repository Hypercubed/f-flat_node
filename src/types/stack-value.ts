import { Word, Sentence } from './words';
import { Future } from './future';
import { Complex } from './complex';
import { Decimal } from './decimal';
import { Just, Seq } from './return-values';

export type StackValue =
  | number // TODO: remove this, should only be Decimal?
  | string
  | boolean
  | Symbol
  | Word
  | Future
  | undefined
  | null
  | Complex
  | Decimal
  | { [s: string]: StackValue }
  | StackValue[];
