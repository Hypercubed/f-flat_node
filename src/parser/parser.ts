import { tokenize } from './tokenizer';
import { unicodeDecode } from '../utils/stringConversion';

import { Word, Key, Decimal, StackValue, I } from '../types';

const templateAction = new Word(':template');

export function lexer(a: any) {
  if (Array.isArray(a)) {
    return a;
  }
  if (typeof a === 'string') {
    a = a.trim(); // TODO: fix this in parser
    const nodes = tokenize(a).map(processParserTokens);
    return Array.prototype.concat.apply([], nodes); // flatmap
  }
  return [a];
}

function processParserTokens(node: any): StackValue | undefined {
  switch (node.name) {
    // todo: more literal: infinity, -infinity, regex, complex, percent
    case 'templateString':
      return templateString(node.allText);
    case 'singleQuotedString':
      return singleQuotedString(node.allText);
    case 'doubleQuotedString':
      return doubleQuotedString(node.allText);
    case 'key': {
      const id = unicodeDecode(node.allText
        .trim()
        .slice(0, -1));
      return new Key(id);
    }
    case 'number': {
      const n = processNumeric(node.allText);
      if (!isNaN(<any>n)) {
        return <any>n;
      } // else fall through
    }
    case 'word': {
      const id = unicodeDecode(node.allText.toLowerCase().trim());
      if (id.length <= 0) return undefined;
      return new Word(id);
    }
    case 'bracket':
      return new Word(node.allText);
    case 'null':
      return null;
    case 'bool':
      return node.allText.toLowerCase() === 'true';
    case 'nan':
      return NaN;
    case 'i':
      return I;
    default:
      throw new Error(`Unknown type in lexer: ${node.name} ${node.allText}`);
  }
}

function processNumeric(value: string): Decimal | number {
  if (typeof value !== 'string') {
    return NaN;
  }
  if (value[0] === '+' && value[1] !== '-') {
    value = value.slice(1, value.length);
  }
  value = value.replace(/_/g, '');
  try {
    if (value === '-0') return new Decimal('-0');
    return value.slice(-1) === '%'
      ? new Decimal(String(value.slice(0, -1))).div(100)
      : new Decimal(String(value));
  } catch (e) {
    return NaN;
  }
}

function templateString(val: string) {
  return [val.slice(1, -1), templateAction];
}

function doubleQuotedString(val: string): string {
  // tslint:disable-next-line: no-eval
  return unicodeDecode(val.slice(1, -1));  // converts to a string using js unicode decoding
}

function singleQuotedString(val: string): string {
  return val.slice(1, -1);
}

// function convertWord(value: string) {
//   return new Word(value);
// }

// function convertLiteral(value: string): StackValue | undefined {
//   // move these to parser
//   return new Word(value);
// }
