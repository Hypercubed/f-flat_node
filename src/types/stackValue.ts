import { Word, Sentence } from './words';
import { Future } from './future';
import { Complex } from './complex';
import { Decimal } from './decimal';
import { Just, Seq } from './returnValues';
import { map } from './map';

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
  | Decimal
  | map;

export interface StackArray extends Array<StackValue> {}

export type Tokens = Word | Sentence | Just | Seq | Future | Promise<any>;

