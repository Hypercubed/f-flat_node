export const Token = {
  // BooleanLiteral: 1,
  EOF: 2,
  Identifier: 3,
  // Keyword: 4,
  // NullLiteral: 5,
  NumericLiteral: 6,
  Punctuator: 7,
  StringLiteral: 8,
  // RegularExpression: 9,
  Template: 10,
  SymbolLiteral: 11,
  TokenLiteral: 12,
  TokenGetter: 13
};

export const TokenName = {
  // [Token.BooleanLiteral]: 'Boolean',
  [Token.EOF]: '<end>',
  [Token.Identifier]: 'Identifier',
  // [Token.Keyword]: 'Keyword',
  // [Token.NullLiteral]: 'Null',
  [Token.NumericLiteral]: 'Numeric',
  [Token.Punctuator]: 'Punctuator',
  [Token.StringLiteral]: 'String',
  // [Token.RegularExpression]: 'RegularExpression',
  [Token.Template]: 'Template',
  [Token.SymbolLiteral]: 'Symbol',
  [Token.TokenLiteral]: 'Token',
  [Token.TokenGetter]: 'Getter'
};
