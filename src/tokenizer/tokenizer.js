// Raw tokenizer taken from Esprima.
// from https://gist.github.com/espadrine/6706677

/* Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import {Character} from './character';
import {Token, TokenName} from './tokens';

let source;
let index;
let lineNumber;
let lineStart;
let length;
let lookahead;
let state;
let extra;

// Error messages should be identical to V8.
const Messages = {
  UnexpectedToken: 'Unexpected token %0'
};

function assert (condition, message) {
  if (!condition) {
    throw new Error(`ASSERT: ${message}`);
  }
}

// Throw an exception
function throwError (token, messageFormat) {
  let error;
  const args = Reflect.apply([].slice, arguments, [2]);
  const msg = messageFormat.replace(
        /%(\d)/g,
        (whole, index) => {
          assert(index < args.length, 'Message reference must be in range');
          return args[index];
        }
    );

  if (typeof token.lineNumber === 'number') {
    error = new Error(`Line ${token.lineNumber}: ${msg}`);
    error.index = token.range[0];
    error.lineNumber = token.lineNumber;
    error.column = token.range[0] - lineStart + 1;
  } else {
    error = new Error(`Line ${token.lineNumber}: ${msg}`);
    error.index = index;
    error.lineNumber = lineNumber;
    error.column = index - lineStart + 1;
  }

  error.description = msg;
  throw error;
}

// Comments

function addComment (type, value, start, end, loc) {
  assert(typeof start === 'number', 'Comment must have valid position');

  // Because the way the actual token is scanned, often the comments
  // (if any) are skipped twice during the lexical analysis.
  // Thus, we need to skip adding a comment if the comment array already
  // handled it.
  if (state.lastCommentStart >= start) {
    return;
  }
  state.lastCommentStart = start;

  const comment = {
    type,
    value
  };
  if (extra.range) {
    comment.range = [start, end];
  }
  if (extra.loc) {
    comment.loc = loc;
  }
  extra.comments.push(comment);

  if (extra.attachComment) {
    const attacher = {
      comment,
      candidate: null,
      range: [start, end]
    };
    extra.pendingComments.push(attacher);
  }
}

function skipSingleLineComment () {
  let comment;

  const start = index - 2;
  const loc = {
    start: {
      line: lineNumber,
      column: index - lineStart - 2
    }
  };

  while (index < length) {
    const ch = source.charCodeAt(index);
    ++index;
    if (Character.isLineTerminator(ch)) {
      if (extra.comments) {
        comment = source.slice(start + 2, index - 1);
        loc.end = {
          line: lineNumber,
          column: index - lineStart - 1
        };
        addComment('Line', comment, start, index - 1, loc);
      }
      if (ch === 13 && source.charCodeAt(index) === 10) {
        ++index;
      }
      ++lineNumber;
      lineStart = index;
      return;
    }
  }

  if (extra.comments) {
    comment = source.slice(start + 2, index);
    loc.end = {
      line: lineNumber,
      column: index - lineStart
    };
    addComment('Line', comment, start, index, loc);
  }
}

function skipMultiLineComment () {
  let start;
  let loc;

  if (extra.comments) {
    start = index - 2;
    loc = {
      start: {
        line: lineNumber,
        column: index - lineStart - 2
      }
    };
  }

  while (index < length) {
    const ch = source.charCodeAt(index);
    if (Character.isLineTerminator(ch)) {
      if (ch === 13 && source.charCodeAt(index + 1) === 10) {
        ++index;
      }
      ++lineNumber;
      ++index;
      lineStart = index;
      if (index >= length) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
      }
    } else if (ch === 42) {
      // Block comment ends with '*/' (char #42, char #47).
      if (source.charCodeAt(index + 1) === 47) {
        ++index;
        ++index;
        if (extra.comments) {
          const comment = source.slice(start + 2, index - 2);
          loc.end = {
            line: lineNumber,
            column: index - lineStart
          };
          addComment('Block', comment, start, index, loc);
        }
        return;
      }
      ++index;
    } else {
      ++index;
    }
  }

  throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
}

function skipComment () {
  let ch;

  while (index < length) {
    ch = source.charCodeAt(index);

    if (Character.isWhiteSpace(ch)) {
      ++index;
    } else if (Character.isLineTerminator(ch)) {
      ++index;
      if (ch === 13 && source.charCodeAt(index) === 10) {
        ++index;
      }
      ++lineNumber;
      lineStart = index;
    } else if (ch === 47) { // 47 is '/'
      ch = source.charCodeAt(index + 1);
      if (ch === 47) {
        ++index;
        ++index;
        skipSingleLineComment();
      } else if (ch === 42) {  // 42 is '*'
        ++index;
        ++index;
        skipMultiLineComment();
      } else {
        break;
      }
    } else if (ch === 60) { // 60 is '<'
      if (source.slice(index + 1, index + 4) === '!--') {
        ++index; // `<`
        ++index; // `!`
        ++index; // `-`
        ++index; // `-`
        skipSingleLineComment();
      } else {
        break;
      }
    } else {
      break;
    }
  }
}

function scanHexEscape (prefix) {
  let code = 0;

  const len = (prefix === 'u') ? 4 : 2;
  for (let i = 0; i < len; ++i) {
    if (index < length && Character.isHexDigit(source[index])) {
      const ch = source[index++];
      code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
    } else {
      return '';
    }
  }
  return String.fromCharCode(code);
}

function getEscapedIdentifier () {
  let ch;
  let id;

  ch = source.charCodeAt(index++);
  id = String.fromCharCode(ch);

  // '\u' (char #92, char #117) denotes an escaped character.
  if (ch === 92) {
    if (source.charCodeAt(index) !== 117) {
      throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }
    ++index;
    ch = scanHexEscape('u');
    if (!ch || ch === '\\' || !Character.isIdentifierStart(ch.charCodeAt(0))) {
      throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }
    id = ch;
  }

  while (index < length) {
    ch = source.charCodeAt(index);
    if (!Character.isIdentifierPart(ch)) {
      break;
    }
    ++index;
    id += String.fromCharCode(ch);

    // '\u' (char #92, char #117) denotes an escaped character.
    if (ch === 92) {
      id = id.substr(0, id.length - 1);
      if (source.charCodeAt(index) !== 117) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
      }
      ++index;
      ch = scanHexEscape('u');
      if (!ch || ch === '\\' || !Character.isIdentifierPart(ch.charCodeAt(0))) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
      }
      id += ch;
    }
  }

  return id;
}

function getIdentifier () {
  const start = index++;
  while (index < length) {
    const ch = source.charCodeAt(index);
    if (ch === 92) {
      // Blackslash (char #92) marks Unicode escape sequence.
      index = start;
      return getEscapedIdentifier();
    }
    if (Character.isIdentifierPart(ch)) {
      ++index;
    } else {
      break;
    }
  }

  return source.slice(start, index);
}

function scanIdentifier () {
  let type;

  const start = index;

  // Backslash (char #92) starts an escaped character.
  const id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

  // There is no keyword or literal with only one character.
  // Thus, it must be an identifier.
  if (id.length === 1) {
    type = Token.Identifier;
  /* } else if (id === 'null') {
    type = Token.NullLiteral;
  } else if (id === 'true' || id === 'false') {
    type = Token.BooleanLiteral; */
  } else if (id[0] === '#') {
    type = Token.SymbolLiteral;
  } else if (id[0] === ':' || id[0] === '@' || id[0] === '.') {
    type = Token.TokenGetter;
  } else if (id.slice(-1) === ':') {
    type = Token.TokenLiteral;
  } else {
    type = Token.Identifier;
  }

  return {
    type,
    value: id,
    lineNumber,
    lineStart,
    range: [start, index]
  };
}

// Punctuators

function scanPunctuator () {
  // var code2;
    // ch2;
    // ch3;
    // ch4;
  const start = index;
  const code = source.charCodeAt(index);
  // var ch1 = source[index];

  switch (code) {

    // Check for most common single-character punctuators.
    // case 46:   // . dot
    case 40:   // ( open bracket
    case 41:   // ) close bracket
    // case 59:   // ; semicolon
    // case 44:   // , comma
    case 123:  // { open curly brace
    case 125:  // } close curly brace
    case 91:   // [
    case 93:   // ]
    // case 58:   // :
    // case 63:   // ?
    // case 126:  // ~
      ++index;
      if (extra.tokenize) {
        if (code === 40) {
          extra.openParenToken = extra.tokens.length;
        } else if (code === 123) {
          extra.openCurlyToken = extra.tokens.length;
        }
      }
      return {
        type: Token.Punctuator,
        value: String.fromCharCode(code),
        lineNumber,
        lineStart,
        range: [start, index]
      };

    default:
      throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
      /* code2 = source.charCodeAt(index + 1);

      // '=' (char #61) marks an assignment or comparison operator.
      if (code2 === 61) {
        switch (code) {
          case 37:  // %
          case 38:  // &
          case 42:  // *:
          case 43:  // +
          case 45:  // -
          case 47:  // /
          case 60:  // <
          case 62:  // >
          case 94:  // ^
          case 124: // |
            index += 2;
            return {
              type: Token.Punctuator,
              value: String.fromCharCode(code) + String.fromCharCode(code2),
              lineNumber: lineNumber,
              lineStart: lineStart,
              range: [start, index]
            };

          case 33: // !
          case 61: // =
            index += 2;

            // !== and ===
            if (source.charCodeAt(index) === 61) {
              ++index;
            }
            return {
              type: Token.Punctuator,
              value: source.slice(start, index),
              lineNumber: lineNumber,
              lineStart: lineStart,
              range: [start, index]
            };
          default:
            break;
        }
      }
      break; */
  }

  // Peek more characters.

  // ch2 = source[index + 1];
  // ch3 = source[index + 2];
  // ch4 = source[index + 3];

  // 4-character punctuator: >>>=

  /* if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
    if (ch4 === '=') {
      index += 4;
      return {
        type: Token.Punctuator,
        value: '>>>=',
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
      };
    }
  }

  // 3-character punctuators: === !== >>> <<= >>=

  if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
    index += 3;
    return {
      type: Token.Punctuator,
      value: '>>>',
      lineNumber: lineNumber,
      lineStart: lineStart,
      range: [start, index]
    };
  }

  if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
    index += 3;
    return {
      type: Token.Punctuator,
      value: '<<=',
      lineNumber: lineNumber,
      lineStart: lineStart,
      range: [start, index]
    };
  }

  if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
    index += 3;
    return {
      type: Token.Punctuator,
      value: '>>=',
      lineNumber: lineNumber,
      lineStart: lineStart,
      range: [start, index]
    };
  }

    // Other 2-character punctuators: ++ -- << >> && ||

    if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
        index += 2;
        return {
            type: Token.Punctuator,
            value: ch1 + ch2,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
        ++index;
        return {
            type: Token.Punctuator,
            value: ch1,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    } */

  throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
}

// Numeric Literals

function scanHexLiteral (start) {
  let number = '';

  while (index < length) {
    if (!Character.isHexDigit(source[index])) {
      break;
    }
    number += source[index++];
  }

  if (number.length === 0) {
    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
  }

  if (Character.isIdentifierStart(source.charCodeAt(index))) {
    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
  }

  return {
    type: Token.NumericLiteral,
    value: parseInt(`0x${number}`, 16),
    lineNumber,
    lineStart,
    range: [start, index]
  };
}

function scanOctalLiteral (start) {
  let number = `0${source[index++]}`;
  while (index < length) {
    if (!Character.isOctalDigit(source[index])) {
      break;
    }
    number += source[index++];
  }

  if (Character.isIdentifierStart(source.charCodeAt(index)) || Character.isDecimalDigit(source.charCodeAt(index))) {
    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
  }

  return {
    type: Token.NumericLiteral,
    value: parseInt(number, 8),
    octal: true,
    lineNumber,
    lineStart,
    range: [start, index]
  };
}

function scanNumericLiteral () {
  let number;
  let ch;

  ch = source[index];
  assert(Character.isDecimalDigit(ch.charCodeAt(0)) || (ch === '.') || (ch === '-'),
      'Numeric literal must start with a decimal digit or a decimal point');

  const start = index;
  number = '';
  if (ch !== '.') {
    number = source[index++];
    ch = source[index];

    // Hex number starts with '0x'.
    // Octal number starts with '0'.
    if (number === '0') {
      if (ch === 'x' || ch === 'X') {
        ++index;
        return scanHexLiteral(start);
      }
      if (Character.isOctalDigit(ch)) {
        return scanOctalLiteral(start);
      }

      // decimal number starts with '0' such as '09' is illegal.
      if (ch && Character.isDecimalDigit(ch.charCodeAt(0))) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
      }
    }

    while (Character.isDecimalDigit(source.charCodeAt(index))) {
      number += source[index++];
    }
    ch = source[index];
  }

  if (ch === '.') {
    number += source[index++];
    while (Character.isDecimalDigit(source.charCodeAt(index))) {
      number += source[index++];
    }
    ch = source[index];
  }

  if (ch === 'e' || ch === 'E') {
    number += source[index++];

    ch = source[index];
    if (ch === '+' || ch === '-') {
      number += source[index++];
    }
    if (Character.isDecimalDigit(source.charCodeAt(index))) {
      while (Character.isDecimalDigit(source.charCodeAt(index))) {
        number += source[index++];
      }
    } else {
      throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }
  }

  if (Character.isIdentifierStart(source.charCodeAt(index)) && source.charCodeAt(index) !== 37) {
    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
  }

  if (source.charCodeAt(index) === 37) {
    index++;
    console.log('retyurning percent', parseFloat(number) / 100, typeof (parseFloat(number) / 100));
    return {
      type: Token.NumericLiteral,
      value: parseFloat(number) / 100,
      lineNumber,
      lineStart,
      range: [start, index]
    };
  }

  return {
    type: Token.NumericLiteral,
    value: 35 * parseFloat(number),
    lineNumber,
    lineStart,
    range: [start, index]
  };
}

// String Literals

function scanStringLiteral () {
  let str = '';
  let quote;
  let ch;
  let code;
  let octal = false;

  quote = source[index];
  assert((quote === '\'' || quote === '"' || quote === '`'),
    'String literal must starts with a quote');

  const start = index;
  ++index;

  while (index < length) {
    ch = source[index++];

    if (ch === quote) {
      quote = '';
      break;
    } else if (ch === '\\') {
      ch = source[index++];
      if (!ch || !Character.isLineTerminator(ch.charCodeAt(0))) {
        switch (ch) {
          case 'n':
            str += '\n';
            break;
          case 'r':
            str += '\r';
            break;
          case 't':
            str += '\t';
            break;
          case 'u':
          case 'x': // eslint-disable-line
            const restore = index;
            const unescaped = scanHexEscape(ch);
            if (unescaped) {
              str += unescaped;
            } else {
              index = restore;
              str += ch;
            }
            break;
          case 'b':
            str += '\b';
            break;
          case 'f':
            str += '\f';
            break;
          case 'v':
            str += '\x0B';
            break;

          default:
            if (Character.isOctalDigit(ch)) {
              code = '01234567'.indexOf(ch);

              // \0 is not octal escape sequence
              if (code !== 0) {
                octal = true;
              }

              if (index < length && Character.isOctalDigit(source[index])) {
                octal = true;
                code = code * 8 + '01234567'.indexOf(source[index++]);

                // 3 digits are only allowed when string starts
                // with 0, 1, 2, 3
                if ('0123'.indexOf(ch) >= 0 &&
                    index < length &&
                    Character.isOctalDigit(source[index])) {
                  code = code * 8 + '01234567'.indexOf(source[index++]);
                }
              }
              str += String.fromCharCode(code);
            } else {
              str += ch;
            }
            break;
        }
      } else {
        ++lineNumber;
        if (ch === '\r' && source[index] === '\n') {
          ++index;
        }
      }
    } else if (Character.isLineTerminator(ch.charCodeAt(0))) {
      break;
    } else {
      str += ch;
    }
  }

  if (quote !== '') {
    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
  }

  return {
    type: Token.StringLiteral,
    value: str,
    octal,
    lineNumber,
    lineStart,
    range: [start, index]
  };
}

function scanTemplate () {
  return {
    ...scanStringLiteral(),
    type: Token.Template
  };
}

function advance () {
  skipComment();

  if (index >= length) {
    return {
      type: Token.EOF,
      lineNumber,
      lineStart,
      range: [index, index]
    };
  }

  const ch = source.charCodeAt(index);

  // Very common: (, ), [, and ]
  if (ch === 40 || ch === 41 || ch === 91 || ch === 93) {
    return scanPunctuator();
  }

  // String literal starts with single quote (#39) or double quote (#34).
  if (ch === 39 || ch === 34) {
    return scanStringLiteral();
  }

  // Template starts with backtick (#96).
  if (ch === 96) {
    return scanTemplate();
  }

  if (Character.isIdentifierStart(ch)) {
    return scanIdentifier();
  }

  // Dot (.) and dash (-) char #46 can start a floating-point number, hence the need
  // to check the next character.
  if (ch === 45 || ch === 46) {
    if (Character.isDecimalDigit(source.charCodeAt(index + 1))) {
      return scanNumericLiteral();
    }
    return scanIdentifier();
  }

  if (Character.isDecimalDigit(ch)) {
    return scanNumericLiteral();
  }

  // Slash (/) char #47 can also start a regex.
  if (extra.tokenize && ch === 47) {
    // return advanceSlash();
    return scanIdentifier();
  }

  return scanPunctuator();
}

function collectToken () {
  // var start;
  // let rvalue;

  skipComment();
  // start = index;
  const loc = {
    start: {
      line: lineNumber,
      column: index - lineStart
    }
  };

  const token = advance();
  loc.end = {
    line: lineNumber,
    column: index - lineStart
  };

  if (token.type !== Token.EOF) {
    const range = [token.range[0], token.range[1]];
    const value = source.slice(token.range[0], token.range[1]);
    extra.tokens.push({
      type: TokenName[token.type],
      value,
      range,
      loc
    });
  }

  return token;
}

function lex () {
  const token = lookahead;

  index = token.range[1];
  lineNumber = token.lineNumber;
  lineStart = token.lineStart;

  lookahead = (typeof extra.tokens === 'undefined') ? advance() : collectToken();

  index = token.range[1];
  lineNumber = token.lineNumber;
  lineStart = token.lineStart;

  return token;
}

function peek () {
  const pos = index;
  const line = lineNumber;
  const start = lineStart;
  lookahead = (typeof extra.tokens === 'undefined') ? advance() : collectToken();
  index = pos;
  lineNumber = line;
  lineStart = start;
}

function filterTokenLocation () {
  const tokens = [];

  for (let i = 0; i < extra.tokens.length; ++i) {
    const entry = extra.tokens[i];
    const token = {
      type: entry.type,
      value: entry.value
    };
    if (extra.range) {
      token.range = entry.range;
    }
    if (extra.loc) {
      token.loc = entry.loc;
    }
    tokens.push(token);
  }

  extra.tokens = tokens;
}

export function tokenize (code, options) {
  // var token;
  let tokens;

  const toString = String;
  if (typeof code !== 'string' && !(code instanceof String)) {
    code = toString(code);
  }

  // var delegate = SyntaxTreeDelegate;
  source = code;
  index = 0;
  lineNumber = (source.length > 0) ? 1 : 0;
  lineStart = 0;
  length = source.length;
  lookahead = null;
  state = {
    allowIn: true,
    labelSet: {},
    inFunctionBody: false,
    inIteration: false,
    inSwitch: false,
    lastCommentStart: -1
  };

  extra = {};

  // Options matching.
  options = options || {};

  // Of course we collect tokens here.
  options.tokens = true;
  extra.tokens = [];
  extra.tokenize = true;
  // The following two fields are necessary to compute the Regex tokens.
  extra.openParenToken = -1;
  extra.openCurlyToken = -1;

  extra.range = (typeof options.range === 'boolean') && options.range;
  extra.loc = (typeof options.loc === 'boolean') && options.loc;

  if (typeof options.comment === 'boolean' && options.comment) {
    extra.comments = [];
  }
  if (typeof options.tolerant === 'boolean' && options.tolerant) {
    extra.errors = [];
  }

  if (length > 0) {
    if (typeof source[0] === 'undefined') {
      // Try first to convert to a string. This is good as fast path
      // for old IE which understands string indexing for string
      // literals only and not for string object.
      if (code instanceof String) {
        source = code.valueOf();
      }
    }
  }

  try {
    peek();
    if (lookahead.type === Token.EOF) {
      return extra.tokens;
    }

    // token =
    lex();
    while (lookahead.type !== Token.EOF) {
      try {
        // token =
        lex();
      } catch (lexError) {
        // token = lookahead;
        if (extra.errors) {
          extra.errors.push(lexError);
          // We have to break on the first error
          // to avoid infinite loops.
          break;
        } else {
          throw lexError;
        }
      }
    }

    filterTokenLocation();
    tokens = extra.tokens;
    if (typeof extra.comments !== 'undefined') {
      tokens.comments = extra.comments;
    }
    if (typeof extra.errors !== 'undefined') {
      tokens.errors = extra.errors;
    }
  } catch (e) {
    throw e;
  } finally {
    extra = {};
  }
  return tokens;
}
