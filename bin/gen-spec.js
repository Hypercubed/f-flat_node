'use strict';

const Myna = require('myna-parser');
const g = require('../dist/parser/tokenizer').fflatGrammar;
const fs = require('fs');

const m = Myna.Myna;
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = pkg.version;
const schema = m.astSchemaToString('fflat');
const grammar = m.grammarToString('fflat').replace(/fflat\./g, '');

const grammkit = require('grammkit');

const map = new WeakMap();

function processRule(expr) {
  if (expr.name && map.has(expr))
    return {
      type: 'rule_ref',
      name: expr.name || expr.toString()
    };
  map.set(expr, true);

  switch (expr.type) {
    case 'rule':
      return {
        ...expr,
        expression: processRule(expr.expression)
      };
    case 'optional':
      return {
        type: 'optional',
        expression: processRule(expr.rules[0])
      };
    case 'seq':
    case 'keywordAnyCase':
    case 'advanceUntilPast':
      return {
        type: 'sequence',
        elements: expr.rules.map(processRule)
      };
    case 'advanceWhileNot':
    case 'repeatWhileNot':
      return {
        type: 'sequence',
        elements: [...expr.rules.map(processRule), { type: 'any' }]
      };
    case 'choice':
      return {
        type: 'choice',
        alternatives: expr.rules.map(processRule)
      };
    case 'text':
    case 'err':
      return {
        type: 'class',
        rawText: expr.toString()
      };
    case 'zeroOrMore':
      return {
        type: 'zero_or_more',
        expression: processRule(expr.rules[0])
      };
    case 'oneOrMore':
      return {
        type: 'one_or_more',
        expression: processRule(expr.rules[0])
      };
    case 'delimitedList':
    case 'advanceIf':
    case 'unless':
      return processRule(expr.rules[0]);
    case 'not':
      return {
        type: 'simple_not',
        expression: processRule(expr.rules[0])
      };
    case 'advance':
      return {
        type: 'any'
      };
    case 'charSet':
    case 'charRange':
    case 'anyCaseText':
    default:
      return {
        type: 'literal',
        value: expr.toString()
      };
  }
}

const diagrams = [];

Object.keys(g).forEach(k => {
  const expr = processRule({
    type: 'rule',
    name: k,
    expression: g[k]
  });

  diagrams.push('**' + k + '**\n');
  diagrams.push(grammkit.diagram(expr));
});

const QUOTE = '```';

fs.writeFileSync(
  './spec.md',
  `

# FFlat Specification ${version}

## PEG Grammar

${QUOTE}
${grammar}
${QUOTE}

## Syntax diagrams (WIP)

${diagrams.join('\n')}

<style>
svg.railroad-diagram {
  background-color: hsl(30,20%,95%);
}
svg.railroad-diagram path {
  stroke-width: 3;
  stroke: black;
  fill: none;
}
svg.railroad-diagram text {
  font: bold 14px monospace;
  text-anchor: middle;
  cursor: pointer;
}
svg.railroad-diagram text.label {
  text-anchor: start;
}
svg.railroad-diagram text.comment {
  font: italic 12px monospace;
}
svg.railroad-diagram rect {
  stroke-width: 3;
  stroke: black;
  fill: hsl(120,100%,90%);
}
</style>

`
);

process.exit();
