import { Word, Sentence } from './words';

export type ScopeModule = { [k in string]: symbol };

// TODO: only Sentence and ScopeModule
export type VocabValue =
  | Word
  | Sentence
  | ScopeModule
  | { [key: string]: VocabValue }
  | Function
  | symbol;
