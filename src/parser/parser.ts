// Reference the Myna module
import { Myna } from 'myna-parser';

// Construct a grammar object
const g = Object.create(null);
const delimiters = ' \t\n\r\f,';
const brackets = '[]{}()';
const quotes = '\'"`';

// words
g.bracket = Myna.char(brackets).ast;
g.identifierFirst = Myna.notChar(delimiters + quotes + brackets);
g.identifierNext = Myna.notChar(delimiters + quotes + brackets);
g.identifier = Myna.seq(g.identifierFirst, g.identifierNext.zeroOrMore);
g.word = g.identifier.copy.ast;

// decimal
g.integer = Myna.seq(
  Myna.digit.oneOrMore,
  Myna.char('_').zeroOrMore,
  Myna.digit.zeroOrMore
);
g.fraction = Myna.seq('.', g.integer);
g.plusOrMinus = Myna.char('+-');
g.exponent = Myna.seq(Myna.char('eE'), g.plusOrMinus.opt, Myna.digits);
g.decimal = Myna.seq(
  g.plusOrMinus.opt,
  g.integer,
  g.fraction.opt,
  g.exponent.opt
).thenNot(g.identifierNext.or(Myna.digit));

// radix
g.radixDigit = Myna.char('0123456789abcdefABCDEF');
g.radixInteger = Myna.seq(
  g.radixDigit.oneOrMore,
  Myna.char('_').zeroOrMore,
  g.radixDigit.zeroOrMore
);
g.radixFraction = Myna.seq('.', g.radixInteger);
g.radixExponent = Myna.seq(
  Myna.char('eEpP'),
  g.plusOrMinus.opt,
  g.radixDigit.oneOrMore
);
g.radix = Myna.seq(
  g.plusOrMinus.opt,
  '0',
  Myna.char('oObBxF'),
  g.radixInteger,
  g.radixFraction.opt,
  g.radixExponent.opt
).thenNot(g.identifierNext.or(g.radixDigit));

g.number = Myna.choice(g.radix, g.decimal).ast;

// Comments and whitespace
g.untilEol = Myna.advanceWhileNot(Myna.newLine).then(Myna.newLine.opt);
g.fullComment = Myna.seq('/*', Myna.advanceUntilPast('*/'));
g.lineComment = Myna.seq('//', g.untilEol);
g.comment = g.fullComment.or(g.lineComment);
g.delimiter = Myna.char(delimiters).oneOrMore;
g.ws = g.delimiter.or(Myna.atWs.then(Myna.advance)).zeroOrMore;

// symbol
g.symbol = Myna.seq(Myna.char('#'), g.identifier).ast;

// literals
// g.quote = Myna.char(brackets).ast;
g.bool = Myna.keywords('true', 'false', 'TRUE', 'FALSE').thenNot(
  g.identifierNext
).ast;
g.null = Myna.keyword('null', 'NULL').thenNot(g.identifierNext).ast;
g.nan = Myna.keyword('nan', 'NAN').thenNot(g.identifierNext).ast;
g.i = Myna.char('iI').thenNot(g.identifierNext).ast;

g.literal = Myna.choice(g.bool, g.null, g.nan, g.i);

// strings
g.escapedChar = Myna.char('\\').then(Myna.advance);
g.templateString = Myna.guardedSeq('`', Myna.notChar('`').zeroOrMore, '`').ast;
g.singleQuotedString = Myna.guardedSeq(
  "'",
  Myna.notChar("'").zeroOrMore,
  "'"
).ast;
g.doubleQuotedString = Myna.guardedSeq(
  '"',
  Myna.notChar('"').zeroOrMore,
  '"'
).ast;
g.string = Myna.choice(
  g.templateString,
  g.singleQuotedString,
  g.doubleQuotedString
);

g.value = Myna.choice(
  g.comment,
  g.number,
  g.symbol,
  g.literal,
  g.word,
  g.string,
  g.bracket
);

g.sequence = g.value.delimited(g.ws);

Myna.registerGrammar('fflat', g, g.value);

// Get the parser
export const parser = function(text) {
  return Myna.parse(g.sequence, text);
};

export const tokenize = function(text) {
  const result = Myna.parse(g.sequence, text);
  return result ? result.children : [];
};
