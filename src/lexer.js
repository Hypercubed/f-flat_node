// import {processIdentifier} from './utils';
import {isString, isArray} from 'fantasy-helpers/src/is';

import {Seq, Action, BigNumber, I} from './types/index';

import {tokenize} from './tokenizer/tokenizer';

const reString = /^\$.+$/;
const reSymbol = /^\#.+$/;
const reProperty = /^\_\..+$/;
const reAction = /^\\.+$/;
const reAction2 = /^.+:$/;
const reAt = /^[:\@].+$/;
const rePercent = /^[-+]?[0-9]*\.?[0-9]+%$/;

export function processIdentifier (d) {
  if (d === 'i') {
    return I;
  }

  /* if (d[0] === '`') {
    return Seq.of([String(d.slice(1)), Action.of('template'), Action.of('eval')]);
  } */

  if (reString.test(d)) {
    return d.slice(1);
  }

  if (reSymbol.test(d)) {
    return Symbol(d.slice(1));
  }

  if (reAt.test(d)) {
    return [String(d.slice(1)), Action.of('@')];
  }

  if (reProperty.test(d)) {
    d = (d
      .replace('_.', '')
      .replace('.', '.@.') + '.@')
        .split('.')
        .map(x => (x === '@') ? Action.of('@') : String(x));

    return Seq.of(d);
  }

  if (rePercent.test(d)) {
    d = (d.replace('%', ''));
    return Object.freeze(new BigNumber(d).div(100));
  }

  if (reAction.test(d)) {
    d = processIdentifier(d.slice(1));
  }

  if (reAction2.test(d)) {
    d = processIdentifier(d = d.slice(0, d.length - 1));
  }

  return Action.of(d);
}

export function lexer (text) {
  if (isArray(text)) return text;
  if (!isString(text)) return [text];

  /* const len = text.length;

  if (!text || len < 1) { return []; }

  const tokens = [];

  let token = '';
  let index = 0;

  while (index < len) {
    var ch = text.charAt(index++);
    var nch = text.charAt(index);

    if (isWhitespace(ch)) {
      pushLiteral(token);
      token = '';
    } else if (isQuote(ch)) {
      pushString(ch);
    } else if (ch === '`') {
      pushString('`');  // should be a macro?
      pushLiteral('template');
      pushLiteral('eval');
    } else if (ch === '/' && nch === '*') {
      scanString('*');
    } else if (ch === '/' && nch === '/') {
      scanString('\n');
    } else if (isBracket(ch) || isBracket(nch) || index === len) {
      token += ch;
      pushLiteral(token);
      token = '';
    } else {
      token += ch;
    }
  } */

  return tokenize(text)
    .map(({type, value}) => {
      switch (type) {
        case 'String':
          return value.slice(1, -1);
        case 'Template':
          return [value.slice(1, -1), Action.of('template'), Action.of('eval')];
        case 'Numeric':
          return Object.freeze(new BigNumber(value));
        case 'Boolean':
          return value.toLowerCase() === 'true';
        case 'Null':
          return null;
        case 'Identifier':
        case 'Punctuator':
          return processIdentifier(value);
        default:
          console.log('Unknown type in lexer', type, value);
          process.exit();
      }
    }).reduce(function (a, b) {  // flatmap
      return a.concat(b);
    }, []);

  // return tokens;

  /* function scanString (lch) {
    let token = '';
    const ll = lch.length;

    let pch = null;
    let nch = null;

    while (index < text.length - ll && (nch !== lch || pch === '\\')) {
      token += text[index++];
      pch = nch;
      nch = text.substring(index, index + ll);
    }
    index += ll;
    return token.replace('\\' + lch, lch);
  }

  function pushString (ch) {
    tokens.push(String(scanString(ch)));
  }

  function pushLiteral (token) {
    if (token.length > 0) {
      const t = toLiteral(token);
      if (t instanceof Seq) {
        tokens.push(...t.value);
      } else {
        tokens.push(t);
      }
    }
  } */
}
