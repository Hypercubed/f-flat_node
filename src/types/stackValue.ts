import { Word, Sentence } from './words';
import { Future } from './future';
import { Complex } from './complex';
import { Decimal } from './decimal';

export type StackValue =
  | number
  | string
  | boolean
  | Symbol
  | Word
  | Sentence
  | Future
  | Function
  | StackArray
  | undefined
  | null
  | Complex
  | Decimal;

export interface StackArray extends Array<StackValue> {}
