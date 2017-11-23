import { Action } from './words';
import { Future } from './future';

export type StackValue = number | string | boolean | Symbol | Action | Future | Function | StackArray | undefined | null;

export interface StackArray extends Array<StackValue> { }