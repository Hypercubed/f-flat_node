import { Word, Key } from './words';
import { Future } from './future';
import { Complex } from './complex';
import { Decimal } from './decimal';
import { ScopeModule, GlobalSymbol } from './vocabulary-values';

export type StackValue =
  | number // TODO: remove this, should only be Decimal?
  | string
  | boolean
  | Symbol // for now, well known symbols `(` and `_`
  | Key
  | Future
  | undefined
  | null
  | Complex
  | Decimal
  | ScopeModule
  | { [s: string]: StackValue }
  | StackValue[];

export type QueueValue = StackValue | GlobalSymbol | Word;
