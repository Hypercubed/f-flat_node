import {isWhitespace, isQuote, isBracket, toLiteral} from './utils';
import {isString, isArray} from 'fantasy-helpers/src/is';

import {Action, Seq} from './types/index';

function generateTemplateString (template) {
  var r = [''];
  template.split(/[\$\}]/).map(s => {
    if (s[0] === '{') {
      r.push(...lexer(s.slice(1)));
      r.push(Action.of('string'));
    } else {
      r.push(s);
    }
    r.push(Action.of('+'));
  });
  return r;
}

export function lexer (text) {
  if (isArray(text)) return text;
  if (!isString(text)) return [text];

  if (!text || text.length < 1) { return []; }

  const tokens = [];
  let token = '';
  let index = 0;
  const len = text.length;

  while (index < len) {
    var ch = text.charAt(index++);
    var nch = text.charAt(index);

    if (isWhitespace(ch)) {
      pushToken();
    } else if (isQuote(ch)) {
      tokens.push(scanString(ch));
    } else if (ch === '`') {
      // generateTemplateString(scanString('`'));
      tokens.push(...generateTemplateString(scanString('`')));
    } else if (ch === '/' && nch === '*') {
      scanString('*/');
    } else if (ch === '/' && nch === '/') {
      scanString('\n');
    } else if (isBracket(ch) || isBracket(nch) || index === len) {
      token += ch;
      pushToken();
    } else {
      token += ch;
    }
  }

  return tokens;

  function scanString (lch) {
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

  function pushToken (t) {
    if (t === undefined && token.length > 0) {
      t = toLiteral(token);
      // t = processMacros(t);
    }
    if (token.length > 0) {
      if (t instanceof Seq) {
        tokens.push(...t.value);
      } else {
        tokens.push(t);
      }
      token = '';
    }
  }
}
