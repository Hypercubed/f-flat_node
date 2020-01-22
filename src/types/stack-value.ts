import { Word, Key } from './words';
import { Future } from './future';
import { Complex } from './complex';
import { Decimal } from './decimal';

export type StackValue =
  | number // TODO: remove this, should only be Decimal?
  | string
  | boolean
  | Symbol
  | Key
  | Word  // remove this?
  | Future
  | undefined
  | null
  | Complex
  | Decimal
  | { [s: string]: StackValue }
  | StackValue[];
