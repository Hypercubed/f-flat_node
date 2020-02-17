import { Word, Key, Alias } from './words';
import { Future } from './future';
import { Complex } from './complex';
import { Decimal } from './decimal';
import { ScopeModule } from './vocabulary-values';

export type StackValue =
  | number // TODO: remove this, should only be Decimal?
  | string
  | boolean
  | Symbol
  | Key
  | Future
  | undefined
  | null
  | Complex
  | Decimal
  | ScopeModule
  | { [s: string]: StackValue }
  | StackValue[];

export type QueueValue =
  | StackValue
  | Alias
  | Word;
