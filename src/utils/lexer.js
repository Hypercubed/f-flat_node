// import {processIdentifier} from './utils';
// import {isString, isArray} from 'fantasy-helpers/src/is';
import { lex } from 'literalizer';

import { Action, BigNumber, typed } from '../types/index';
import { unescapeString } from './stringConversion';

const atAction = new Action('@');
const templateAction = new Action('template');
const evalAction = new Action('eval');

export function processNumeric(value) {
  if (typeof value !== 'string') {
    return NaN;
  }
  try {
    return Object.freeze(
      value.slice(-1) === '%'
        ? new BigNumber(String(value.slice(0, -1))).div(100)
        : new BigNumber(String(value))
    );
  } catch (e) {
    return NaN;
  }
}

/* two pass lexing using getify/literalizer */
export const lexer = typed('lexer', {
  Array: arr => arr,
  string: text =>
    lex(text).reduce((a, b) => a.concat(processLexerTokens(b)), []), // flatmap
  any: text => [text]
});

function innerParse(val) {
  return val
    .replace(/([\{\}\(\)\[\]])/g, ' $1 ') // add white space around braces
    .split(/[\,\n\s]+/g) // split on whitespace
    .reduce((p, c) => (c.length > 0 ? p.concat(convertLiteral(c)) : p), []);
}

function processLexerTokens({ type, val }) {
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

function convertString(val) {
  const v = val.slice(1, -1);
  return val.charCodeAt(0) === 34 ? unescapeString(v) : v;
}

function convertLiteral(value) {
  const id = value.toLowerCase().trim();

  if (id.length <= 0) {
    return undefined;
  }

  const ch = id.charCodeAt(0);

  if (ch === 45 || ch === 46 || (ch >= 0x30 && ch <= 0x39)) {
    // -.0-9
    const n = processNumeric(id);
    if (!isNaN(n)) {
      // number
      return n;
    }
  }

  if (id.length === 1) {
    // all one character tokens are actions
    return new Action(value);
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

  if (id.slice(-1) === ':') {
    value = value.slice(0, -1);
    return new Action(new Action(value));
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

  return new Action(value);
}
