// import {processIdentifier} from './utils';
// import {isString, isArray} from 'fantasy-helpers/src/is';

import {Action, BigNumber, typed} from '../types/index';
import {isNumeric} from '../utils';

import {lex} from 'literalizer';

function processNumeric (value) {  // todo complex
  return Object.freeze(
    value.slice(-1) === '%' ?
      new BigNumber(String(value.slice(0, -1))).div(100) :
      new BigNumber(String(value))
    );
}

export const lexer = typed('lexer', {
  Array: arr => arr,
  string: text => lex(text)
    .reduce((a, b) => a.concat(processLexerTokens(b)), []), // flatmap
  any: text => [text]
});

function processLexerTokens ({type, val}) {
  switch (type) {
    case 0:  // general
    case 4:  // regex
      return val
        .replace(/([\{\}\(\)\[\]])/g, ' $1 ')  // handle brackets
        .split(/[\,\n\s]+/g)                    // split on whitespace
        .reduce((p, c) => c.length > 0 ? p.concat(convertLiteral(c)) : p, []);
    case 2: // string literal
      return val.slice(1, -1);
    case 3: // string template
      return [val.slice(1, -1), Action.of('template'), Action.of('eval')];
    case 1: // comment
      return undefined;
    default:
      console.log('Unknown type in lexer', type, val);
      return process.exit();
  }
}

function convertLiteral (value) {
  const id = value.toLowerCase().trim();
  if (id.length <= 0) {
    return undefined;
  }
  if (isNumeric(value)) {   // number
    return processNumeric(value);
  } else if (value.length === 1) {  // all one character tokens are actions
    return Action.of(value);
  } else if (id === 'null') {
    return null;
  } else if (id === 'true' || id === 'false') {
    return id === 'true';
  } else if (id[0] === '#') {
    return Symbol(value.slice(1));
  } else if (id[0] === '@' || id[0] === '.') {
    return [String(value.slice(1)), Action.of('@')];
  } else if (id.slice(-1) === ':') {
    return Action.of(Action.of(value.slice(0, -1)));
  }
  return Action.of(value);
}
