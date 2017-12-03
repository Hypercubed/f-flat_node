import { lex } from 'literalizer';

import {
  Word,
  Sentence,
  Decimal,
  typed,
  StackValue,
  StackArray,
  Just,
  Seq
} from '../types/index';
import { unescapeString } from './stringConversion';

const makeAction = new Word(':');
const atAction = new Word('@');
const templateAction = new Word('template');
const evalAction = new Word('eval');

export function processNumeric(value: string): Decimal | number {
  if (typeof value !== 'string') {
    return NaN;
  }
  if (value[0] === '+' && value[1] !== '-') {
    value = value.slice(1, value.length);
  }
  value = value.replace(/_/g, '');
  try {
    return Object.freeze(
      value.slice(-1) === '%'
        ? new Decimal(String(value.slice(0, -1))).div(100)
        : new Decimal(String(value))
    );
  } catch (e) {
    return NaN;
  }
}

/* two pass lexing using getify/literalizer */
export const lexer: (x: StackValue) => StackArray = typed('lexer', {
  Array: (arr: StackArray) => arr,
  string: (text: string) =>
    lex(text).reduce((a, b) => a.concat(processLexerTokens(b)), []), // flatmap
  any: (text: StackValue) => [text]
});

function innerParse(val: string): StackArray {
  return (
    val
      .replace(/([{}()[\]])/g, ' $1 ') // add white space around braces
      // .replace(/([\!])/g, ' $1 ') // add white space after bang
      .split(/[,\n\s]+/g) // split on whitespace
      .reduce(
        (p, c) => (c.length > 0 ? p.concat(convertLiteral(c)) : p),
        [] as StackArray
      )
  );
}

function processLexerTokens({ type, val }): StackValue | undefined {
  switch (type) {
    case 0: // general
    case 4: // regex
      return innerParse(val);
    case 2: // string literal
      return convertString(val);
    case 3: // string template
      return [val.slice(1, -1), templateAction, evalAction];
    case 1: // comment
      return undefined;
    default:
      console.log('Unknown type in lexer', type, val);
      return process.exit();
  }
}

function convertString(val: string): string {
  const v = val.slice(1, -1);
  return val.charCodeAt(0) === 34 ? unescapeString(v) : v;
}

function convertLiteral(value: any): StackValue | undefined {
  const id = value.toLowerCase().trim();

  if (id.length <= 0) {
    return undefined;
  }

  const ch = id.charCodeAt(0);

  if (ch === 43 || ch === 45 || ch === 46 || (ch >= 0x30 && ch <= 0x39)) {
    // +-.0-9
    const n = processNumeric(id);
    if (!isNaN(<any>n)) {
      // number
      return <any>n;
    }
  }

  if (id.length === 1) {
    // all one character tokens are actions
    return new Word(value);
  }

  if (id === 'null') {
    return null;
  }

  if (id === 'true' || id === 'false') {
    return ch === 116;
  }

  if (ch === 35) {
    // #
    return Symbol(value.slice(1));
  }

  if (id.slice(-1) === ':') { // this is a hack to push word literals, get rid of this
    value = value.slice(0, -1);
    return new Word(<any>new Word(value));
  }

  if (ch === 64) {
    // @
    value = value.slice(1);
    value = parseInt(value, 10) || String(value);
    return [value, atAction];
  }

  if (ch === 46) {
    // .
    value = value.slice(1);
    value = String(value);
    return [value, atAction, evalAction];
  }

  return new Word(value);
}
