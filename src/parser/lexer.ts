import { tokenize } from './parser';

import {
  Word,
  Sentence,
  Decimal,
  Complex,
  StackValue,
  StackArray,
  Just,
  Seq,
  I
} from '../types';
import { unescapeString } from '../utils/stringConversion';

const makeAction = new Word(':');
const atAction = new Word('@');
const templateAction = new Word('template');
const evalAction = new Word('eval');

/* export const lexer: (x: StackValue) => StackArray = typed('lexer', {
  Array: (arr: StackArray) => arr,
  string: (text: string) => {
    text = text.trim(); // fix this in parser
    const nodes = tokenize(text).map(processParserTokens);
    return Array.prototype.concat.apply([], nodes); // flatmap
  },
  any: (text: StackValue) => [text]
}); */

export function lexer(a) {
  if (Array.isArray(a)) {
    return a;
  }
  if (typeof a === 'string') {
    a = a.trim(); // fix this in parser
    const nodes = tokenize(a).map(processParserTokens);
    return Array.prototype.concat.apply([], nodes); // flatmap
  }
  return [a];
};

function processParserTokens(node): StackValue | undefined {
  switch (node.name) {
    // todo: literals
    case 'templateString':
      return templateString(node.allText);
    case 'singleQuotedString':
      return singleQuotedString(node.allText);
    case 'doubleQuotedString':
      return doubleQuotedString(node.allText);
    case 'symbol':
      return Symbol(node.allText.slice(1));
    case 'number':
      const n = processNumeric(node.allText);
      if (!isNaN(<any>n)) {
        return <any>n;
      } // else fall through
    case 'word':
      const id = node.allText.toLowerCase().trim();
      if (id.length <= 0) {
        return undefined;
      } else if (id.length > 1) {
        return convertLiteral(node.allText);
      } // else fall through (all length)
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
  return [val.slice(1, -1), templateAction, evalAction];
}

function doubleQuotedString(val: string): string {
  const v = val.slice(1, -1);
  return unescapeString(v); // todo-move to parser
}

function singleQuotedString(val: string): string {
  return val.slice(1, -1);
}

function convertWord(value: string) {
  return new Word(value);
}

function convertLiteral(value: string): StackValue | undefined { // move these to parser
  if (value.slice(-1) === ':') { // this is a hack to push word literals, get rid of this
    value = value.slice(0, -1);
    return new Word(<any>new Word(value));
  }

  if (value.charCodeAt(0) === 64) {  // used?
    // @
    value = value.slice(1);
    return [parseInt(value, 10) || String(value), atAction];
  }

  return new Word(value);
}
