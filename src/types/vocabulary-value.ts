import { Word, Sentence } from './words';

export type VocabValue =
  | Word
  | Sentence
  | { [key: string]: VocabValue }
  | Function;
