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

var // Token,
  // TokenName,
  // FnExprTokens,
  // Messages,
  // Regex,
  // SyntaxTreeDelegate,
  source,
  // strict,
  index,
  lineNumber,
  lineStart,
  length,
  // delegate,
  lookahead,
  state,
  extra;

    /* export const Token = {
      BooleanLiteral: 1,
      EOF: 2,
      Identifier: 3,
      // Keyword: 4,
      NullLiteral: 5,
      NumericLiteral: 6,
      Punctuator: 7,
      StringLiteral: 8,
      RegularExpression: 9,
      Template: 10
    };

    export const TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    // TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';
    TokenName[Token.Template] = 'Template'; */

    // A function following one of those tokens is an expression.
    /* const FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!==']; */

// Error messages should be identical to V8.
const Messages = {
  UnexpectedToken: 'Unexpected token %0'
  // UnexpectedNumber: 'Unexpected number',
  // UnexpectedString: 'Unexpected string',
  // UnexpectedIdentifier: 'Unexpected identifier',
  // UnexpectedReserved: 'Unexpected reserved word',
  // UnexpectedEOS: 'Unexpected end of input',
  // NewlineAfterThrow: 'Illegal newline after throw',
  // InvalidRegExp: 'Invalid regular expression',
  // UnterminatedRegExp: 'Invalid regular expression: missing /',
  // InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
  // InvalidLHSInForIn: 'Invalid left-hand side in for-in',
  // MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
  // NoCatchOrFinally: 'Missing catch or finally after try',
  // UnknownLabel: 'Undefined label \'%0\'',
  // Redeclaration: '%0 \'%1\' has already been declared',
  // IllegalContinue: 'Illegal continue statement',
  // IllegalBreak: 'Illegal break statement',
  // IllegalReturn: 'Illegal return statement',
  // StrictModeWith: 'Strict mode code may not include a with statement',
  // StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
  // StrictVarName: 'Variable name may not be eval or arguments in strict mode',
  // StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
  // StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
  // StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
  // StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
  // StrictDelete: 'Delete of an unqualified identifier in strict mode.',
  // StrictDuplicateProperty: 'Duplicate data property in object literal not allowed in strict mode',
  // AccessorDataProperty: 'Object literal may not have data and accessor property with the same name',
  // AccessorGetSet: 'Object literal may not have multiple get/set accessors with the same name',
  // StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
  // StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
  // StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
  // StrictReservedWord: 'Use of future reserved word in strict mode'
};

    // See also tools/generate-unicode-regex.py.
    /* const Regex = {
      NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
      NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc\^]')
    }; */

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    /* export const Character = {

      fromCodePoint (cp) {
        return (cp < 0x10000) ? String.fromCharCode(cp)
          : String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
          String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
      },

      // ECMA-262 11.2 White Space

      isWhiteSpace (cp) {
        return (cp === 44) || //  comma is whitespace
          (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
          (cp >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
      },

      // ECMA-262 11.3 Line Terminators

      isLineTerminator (cp) {
        return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
      },

      // Identifier Names and Identifiers

      isIdentifierCommon (ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
          (ch === 33) || (ch === 124) ||    // !|
          (ch >= 35 && ch <= 38) ||         // #$%&
          (ch >= 42 && ch <= 43) ||         // *+
          (ch === 46 && ch === 47) ||         // ./
          (ch >= 97 && ch <= 122) ||        // a..z
          (ch >= 60 && ch <= 90) ||         // <>=?A..Z
          (ch === 94) ||                    // ^
          (ch === 92) ||                    // \ (backslash)
          (ch === 126);                    // ~
      },

      isIdentifierStart (ch) {
        return Character.isIdentifierCommon(ch) ||
          ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
      },

      isIdentifierPart (ch) {
        return Character.isIdentifierCommon(ch) || (ch === 45) ||
          (ch >= 48 && ch <= 59) ||         // 0..9;:
          ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
      },

      // ECMA-262 11.8.3 Numeric Literals

      isDecimalDigit (cp) {
        return (cp >= 0x30 && cp <= 0x39);      // 0..9
      },

      isHexDigit (cp) {
        return (cp >= 0x30 && cp <= 0x39) ||    // 0..9
            (cp >= 0x41 && cp <= 0x48) ||       // A..H
            (cp >= 0x61 && cp <= 0x68);         // a..h
      },

      isOctalDigit (cp) {
        return (cp >= 0x30 && cp <= 0x37);      // 0..7
      }
    }; */

function assert (condition, message) {
  if (!condition) {
    throw new Error('ASSERT: ' + message);
  }
}

  // Throw an exception

function throwError (token, messageFormat) {
  var error;
  var args = Array.prototype.slice.call(arguments, 2);
  var msg = messageFormat.replace(
        /%(\d)/g,
        function (whole, index) {
          assert(index < args.length, 'Message reference must be in range');
          return args[index];
        }
    );

  if (typeof token.lineNumber === 'number') {
    error = new Error('Line ' + token.lineNumber + ': ' + msg);
    error.index = token.range[0];
    error.lineNumber = token.lineNumber;
    error.column = token.range[0] - lineStart + 1;
  } else {
    error = new Error('Line ' + lineNumber + ': ' + msg);
    error.index = index;
    error.lineNumber = lineNumber;
    error.column = index - lineStart + 1;
  }

  error.description = msg;
  throw error;
}

    /* function isDecimalDigit (ch) {
      return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit (ch) {
      return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit (ch) {
      return '01234567'.indexOf(ch) >= 0;
    } */

    // 7.2 White Space

    /* function isWhiteSpace (ch) {
      return (ch === 44) || //  comma is whitespace
        (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
        (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    } */

    // 7.3 Line Terminators

    /* function isLineTerminator (ch) {
      return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    } */

    // 7.6 Identifier Names and Identifiers

    /* function isIdentifierCommon (ch) {
      return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
        (ch === 33) || (ch === 124) ||    // !|
        (ch >= 35 && ch <= 38) ||         // #$%&
        (ch >= 42 && ch <= 43) ||         // *+
        (ch === 46 && ch === 47) ||         // ./
        (ch >= 97 && ch <= 122) ||        // a..z
        (ch >= 60 && ch <= 90) ||         // <>=?A..Z
        (ch === 94) ||                    // ^
        (ch === 92) ||                    // \ (backslash)
        (ch === 126);                    // ~
    }

    function isIdentifierStart (ch) {
      return isIdentifierCommon(ch) ||
        ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart (ch) {
      return isIdentifierCommon(ch) || (ch === 45) ||
        (ch >= 48 && ch <= 59) ||         // 0..9;:
        ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    } */

    // 7.6.1.1 Keywords

    /* function isKeyword(id) {
        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    } */

    // 7.4 Comments

function addComment (type, value, start, end, loc) {
  var comment, attacher;

  assert(typeof start === 'number', 'Comment must have valid position');

  // Because the way the actual token is scanned, often the comments
  // (if any) are skipped twice during the lexical analysis.
  // Thus, we need to skip adding a comment if the comment array already
  // handled it.
  if (state.lastCommentStart >= start) {
    return;
  }
  state.lastCommentStart = start;

  comment = {
    type: type,
    value: value
  };
  if (extra.range) {
    comment.range = [start, end];
  }
  if (extra.loc) {
    comment.loc = loc;
  }
  extra.comments.push(comment);

  if (extra.attachComment) {
    attacher = {
      comment: comment,
      candidate: null,
      range: [start, end]
    };
    extra.pendingComments.push(attacher);
  }
}

function skipSingleLineComment () {
  var start, loc, ch, comment;

  start = index - 2;
  loc = {
    start: {
      line: lineNumber,
      column: index - lineStart - 2
    }
  };

  while (index < length) {
    ch = source.charCodeAt(index);
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
  var start, loc, ch, comment;

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
    ch = source.charCodeAt(index);
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
          comment = source.slice(start + 2, index - 2);
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
  var ch;

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
  var i, len, ch;
  var code = 0;

  len = (prefix === 'u') ? 4 : 2;
  for (i = 0; i < len; ++i) {
    if (index < length && Character.isHexDigit(source[index])) {
      ch = source[index++];
      code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
    } else {
      return '';
    }
  }
  return String.fromCharCode(code);
}

function getEscapedIdentifier () {
  var ch, id;

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
  var start, ch;

  start = index++;
  while (index < length) {
    ch = source.charCodeAt(index);
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
  var start, id, type;

  start = index;

  // Backslash (char #92) starts an escaped character.
  id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

  // There is no keyword or literal with only one character.
  // Thus, it must be an identifier.
  if (id.length === 1) {
    type = Token.Identifier;
  } else if (id === 'null') {
    type = Token.NullLiteral;
  } else if (id === 'true' || id === 'false') {
    type = Token.BooleanLiteral;
  } else {
    type = Token.Identifier;
  }

  return {
    type: type,
    value: id,
    lineNumber: lineNumber,
    lineStart: lineStart,
    range: [start, index]
  };
}

// 7.7 Punctuators

function scanPunctuator () {
  // var code2;
    // ch2;
    // ch3;
    // ch4;
  var start = index;
  var code = source.charCodeAt(index);
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
        lineNumber: lineNumber,
        lineStart: lineStart,
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

// 7.8.3 Numeric Literals

function scanHexLiteral (start) {
  var number = '';

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
    value: parseInt('0x' + number, 16),
    lineNumber: lineNumber,
    lineStart: lineStart,
    range: [start, index]
  };
}

function scanOctalLiteral (start) {
  var number = '0' + source[index++];
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
    lineNumber: lineNumber,
    lineStart: lineStart,
    range: [start, index]
  };
}

function scanNumericLiteral () {
  var number, start, ch;

  ch = source[index];
  assert(Character.isDecimalDigit(ch.charCodeAt(0)) || (ch === '.') || (ch === '-'),
      'Numeric literal must start with a decimal digit or a decimal point');

  start = index;
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

  if (Character.isIdentifierStart(source.charCodeAt(index))) {
    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
  }

  return {
    type: Token.NumericLiteral,
    value: parseFloat(number),
    lineNumber: lineNumber,
    lineStart: lineStart,
    range: [start, index]
  };
}

// 7.8.4 String Literals

function scanStringLiteral () {
  var str = '';
  var quote, start, ch, code, unescaped, restore;
  var octal = false;

  quote = source[index];
  assert((quote === '\'' || quote === '"' || quote === '`'),
    'String literal must starts with a quote');

  start = index;
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
          case 'x':
            restore = index;
            unescaped = scanHexEscape(ch);
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
    octal: octal,
    lineNumber: lineNumber,
    lineStart: lineStart,
    range: [start, index]
  };
}

function scanTemplate () {
  return {
    ...scanStringLiteral(),
    type: Token.Template
  };
}

    /* function scanRegExp () {
      var str, ch, start, pattern, flags, value, restore;
      var classMarker = false;
      var terminated = false;

      lookahead = null;
      skipComment();

      start = index;
      ch = source[index];
      assert(ch === '/', 'Regular expression literal must start with a slash');
      str = source[index++];

      while (index < length) {
        ch = source[index++];
        str += ch;
        if (ch === '\\') {
          ch = source[index++];
          // ECMA-262 7.8.5
          if (isLineTerminator(ch.charCodeAt(0))) {
            throwError({}, Messages.UnterminatedRegExp);
          }
          str += ch;
        } else if (classMarker) {
          if (ch === ']') {
            classMarker = false;
          }
        } else {
          if (ch === '/') {
            terminated = true;
            break;
          } else if (ch === '[') {
            classMarker = true;
          } else if (isLineTerminator(ch.charCodeAt(0))) {
            throwError({}, Messages.UnterminatedRegExp);
          }
        }
      }

      if (!terminated) {
        throwError({}, Messages.UnterminatedRegExp);
      }

      // Exclude leading and trailing slash.
      pattern = str.substr(1, str.length - 2);

      flags = '';
      while (index < length) {
        ch = source[index];
        if (!isIdentifierPart(ch.charCodeAt(0))) {
          break;
        }

        ++index;
        if (ch === '\\' && index < length) {
          ch = source[index];
          if (ch === 'u') {
            ++index;
            restore = index;
            ch = scanHexEscape('u');
            if (ch) {
              flags += ch;
              for (str += '\\u'; restore < index; ++restore) {
                str += source[restore];
              }
            } else {
              index = restore;
              flags += 'u';
              str += '\\u';
            }
          } else {
            str += '\\';
          }
        } else {
          flags += ch;
          str += ch;
        }
      }

      try {
        value = new RegExp(pattern, flags);
      } catch (e) {
        throwError({}, Messages.InvalidRegExp);
      }

      peek();

      if (extra.tokenize) {
        return {
          type: Token.RegularExpression,
          value: value,
          lineNumber: lineNumber,
          lineStart: lineStart,
          range: [start, index]
        };
      }
      return {
        literal: str,
        value: value,
        range: [start, index]
      };
    } */

    /* function collectRegex () {
      var pos, loc, regex, token;

      skipComment();

      pos = index;
      loc = {
        start: {
          line: lineNumber,
          column: index - lineStart
        }
      };

      regex = scanRegExp();
      loc.end = {
        line: lineNumber,
        column: index - lineStart
      };

      if (!extra.tokenize) {
        // Pop the previous token, which is likely '/' or '/='
        if (extra.tokens.length > 0) {
          token = extra.tokens[extra.tokens.length - 1];
          if (token.range[0] === pos && token.type === 'Punctuator') {
            if (token.value === '/' || token.value === '/=') {
              extra.tokens.pop();
            }
          }
        }

        extra.tokens.push({
          type: 'RegularExpression',
          value: regex.literal,
          range: [pos, index],
          loc: loc
        });
      }

      return regex;
    } */

    /* function advanceSlash () {
      var prevToken;
      var checkToken;

      // Using the following algorithm:
      // https://github.com/mozilla/sweet.js/wiki/design
      prevToken = extra.tokens[extra.tokens.length - 1];
      if (!prevToken) {
        // Nothing before that: it cannot be a division.
        return collectRegex();
      }
      if (prevToken.type === 'Punctuator') {
        if (prevToken.value === ')') {
          checkToken = extra.tokens[extra.openParenToken - 1];
          if (checkToken &&
              checkToken.type === 'Keyword' &&
              (checkToken.value === 'if' ||
               checkToken.value === 'while' ||
               checkToken.value === 'for' ||
               checkToken.value === 'with')) {
            return collectRegex();
          }
          return scanPunctuator();
        }
        if (prevToken.value === '}') {
          // Dividing a function by anything makes little sense,
          // but we have to check for that.
          if (extra.tokens[extra.openCurlyToken - 3] &&
                extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
            // Anonymous function.
            checkToken = extra.tokens[extra.openCurlyToken - 4];
            if (!checkToken) {
              return scanPunctuator();
            }
          } else if (extra.tokens[extra.openCurlyToken - 4] &&
                extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
            // Named function.
            checkToken = extra.tokens[extra.openCurlyToken - 5];
            if (!checkToken) {
              return collectRegex();
            }
          } else {
            return scanPunctuator();
          }
          // checkToken determines whether the function is
          // a declaration or an expression.
          if (FnExprTokens.indexOf(checkToken.value) >= 0) {
            // It is an expression.
            return scanPunctuator();
          }
          // It is a declaration.
          return collectRegex();
        }
        return collectRegex();
      }
      if (prevToken.type === 'Keyword') {
        return collectRegex();
      }
      return scanPunctuator();
    } */

function advance () {
  var ch;

  skipComment();

  if (index >= length) {
    return {
      type: Token.EOF,
      lineNumber: lineNumber,
      lineStart: lineStart,
      range: [index, index]
    };
  }

  ch = source.charCodeAt(index);

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
  var loc, token, range, value;

  skipComment();
  // start = index;
  loc = {
    start: {
      line: lineNumber,
      column: index - lineStart
    }
  };

  token = advance();
  loc.end = {
    line: lineNumber,
    column: index - lineStart
  };

  if (token.type !== Token.EOF) {
    range = [token.range[0], token.range[1]];
    value = source.slice(token.range[0], token.range[1]);
    extra.tokens.push({
      type: TokenName[token.type],
      value: value,
      range: range,
      loc: loc
    });
  }

  return token;
}

function lex () {
  var token;

  token = lookahead;
  index = token.range[1];
  lineNumber = token.lineNumber;
  lineStart = token.lineStart;

  lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();

  index = token.range[1];
  lineNumber = token.lineNumber;
  lineStart = token.lineStart;

  return token;
}

function peek () {
  var pos, line, start;

  pos = index;
  line = lineNumber;
  start = lineStart;
  lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
  index = pos;
  lineNumber = line;
  lineStart = start;
}

function filterTokenLocation () {
  var i, entry, token;
  var tokens = [];

  for (i = 0; i < extra.tokens.length; ++i) {
    entry = extra.tokens[i];
    token = {
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
  var toString;
  // var token;
  var tokens;

  toString = String;
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
