import { Word, Sentence } from './words';
import { Future } from './future';

export type StackValue = number | string | boolean | Symbol | Word | Sentence | Future | Function | StackArray | undefined | null;

export interface StackArray extends Array<StackValue> { }