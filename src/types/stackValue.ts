import { Action } from './atom';

export type StackValue = number | string | boolean | Symbol | Action | Function | StackArray | undefined | null;

export interface StackArray extends Array<StackValue> { }