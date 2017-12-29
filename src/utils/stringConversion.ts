import * as punycode from 'punycode';

import { Word, Sentence } from '../types/index';
import { StackEnv } from '../env';

const cap = '%-cap-%';
const caplen = cap.length;
const reReplace = /\$\([^\)]*\)/g;
const reSplit = new RegExp(`(${cap}\\$\\([^\\)]*\\))`, 'g');

export function template(this: StackEnv, template: string): string {
  const r: string[] = [];
  const c = this.createChild();

  return template
    .replace(reReplace, x => cap + x)
    .split(reSplit)
    .map(s => {
      if (s.slice(0, caplen) === cap) {
        const ev = s.slice(caplen + 2, -1);
        const stk = c
          .eval(ev)
          .stack;
        c.clear();
        return stk
          .map(x => String(x))
          .join(' ');
      }
      return unicodeEscape(s);
    }).join('');
}

export function unescapeString(x: string): string {
  return unicodeEscape(convertjEsc2Char(String(x), true));
}

// following code from https://mathiasbynens.be/notes/javascript-encoding#comment-8
function unicodeEscape(x: string): string {
  // note: this will match `u{123}` (with leading `\`) as well
  return x.replace(/\\u\{([0-9a-fA-F]{1,8})\}/g, ($0, $1) => {
    return punycode.ucs2.encode([parseInt($1, 16)]);
  });
}

/*
  following code from http://www.rishida.net/tools/conversion/conversionfunctions.js

  Copyright (C) 2007  Richard Ishida ishida@w3.org
  This program is free software; you can redistribute it and/or modify it under the terms
  of the GNU General Public License as published by the Free Software Foundation; either
  version 2 of the License, or (at your option) any later version as long as you point to
  http://rishida.net/ in your code.
 */

function dec2hex(x: number): string {
  return (x + 0).toString(16).toUpperCase();
}

function hex2char(hex: string): string {
  // converts a single hex number to a character
  // note that no checking is performed to ensure that this is just a hex number, eg. no spaces etc
  // hex: string, the hex codepoint to be converted

  let result = '';
  let n = parseInt(hex, 16);
  if (n <= 0xffff) {
    result += String.fromCharCode(n);
  } else if (n <= 0x10ffff) {
    n -= 0x10000;
    result +=
      String.fromCharCode(0xd800 | (n >> 10)) +
      String.fromCharCode(0xdc00 | (n & 0x3ff));
  } else {
    result += `hex2Char error: Code point out of range: ${dec2hex(n)}`;
  }
  return result;
}

function convertjEsc2Char(str: string, shortEscapes: boolean): string {
  // converts a string containing JavaScript or Java escapes to a string of characters
  // str: string, the input
  // shortEscapes: boolean, if true the function will convert \b etc to characters

  // convert \U and 6 digit escapes to characters
  str = str.replace(/\\U([A-Fa-f0-9]{8})/g, (matchstr, parens) =>
    hex2char(parens)
  );

  // convert \u and 6 digit escapes to characters
  str = str.replace(/\\u([A-Fa-f0-9]{4})/g, (matchstr, parens) =>
    hex2char(parens)
  );

  // convert \b etc to characters, if flag set
  if (shortEscapes) {
    // str = str.replace(/\\0/g, '\0');
    str = str.replace(/\\b/g, '\b');
    str = str.replace(/\\t/g, '\t');
    str = str.replace(/\\n/g, '\n');
    str = str.replace(/\\v/g, '\v');
    str = str.replace(/\\f/g, '\f');
    str = str.replace(/\\r/g, '\r');
    str = str.replace(/\\'/g, '\'');
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\\\/g, '\\');
  }
  return str;
}
