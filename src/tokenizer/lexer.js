// import {processIdentifier} from './utils';
import {isString, isArray} from 'fantasy-helpers/src/is';

import {Action, BigNumber} from '../types/index';

import {tokenize} from './tokenizer';

// const reProperty = /^\_\..+$/;

/* export function processIdentifier (d) {
  if (reProperty.test(d)) {
    d = (d
      .replace('_.', '')
      .replace('.', '.@.') + '.@')
        .split('.')
        .map(x => (x === '@') ? Action.of('@') : String(x));

    return Seq.of(d);
  }

  return Action.of(d);
} */

function processNumeric (value) {  // xodo complex
  return Object.freeze(
    value.slice(-1) === '%' ?
      new BigNumber(value.slice(0, -1)).div(100) :
      new BigNumber(value)
    );
}

export function lexer (text) {
  if (isArray(text)) {
    return text;
  }
  if (!isString(text)) {
    return [text];
  }

  return tokenize(text)
    .map(({type, value}) => {
      switch (type) {
        case 'String':
          return value.slice(1, -1);
        case 'Template':
          return [value.slice(1, -1), Action.of('template'), Action.of('eval')];
        case 'Numeric':
          return processNumeric(value);
        /* case 'Boolean':
          return value.toLowerCase() === 'true';
        case 'Null':
          return null; */
        case 'Symbol':
          return Symbol(value.slice(1));
        case 'Token':
          return Action.of(Action.of(value.slice(0, -1)));
        case 'Getter':
          return [String(value.slice(1)), Action.of('@')];
        case 'Identifier':
        case 'Punctuator':
          return Action.of(value);
        default:
          console.log('Unknown type in lexer', type, value);
          process.exit();
      }
      return undefined;
    }).reduce((a, b) => {  // flatmap
      return a.concat(b);
    }, []);
}
