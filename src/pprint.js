import {inspect} from 'util';
import fixedWidthString from 'fixed-width-string';
import {stripColor, supportsColor, default as chalk} from 'chalk';

import {typed} from './types/index';

const styles = {
  number: chalk.magenta,
  boolean: chalk.magenta,

  null: chalk.grey,
  undefined: chalk.grey,

  string: chalk.palegreen,

  special: chalk.cyan,
  name: chalk.cyan,
  symbol: chalk.cyan,
  date: chalk.cyan,

  regexp: chalk.red
};

const defaultOpts = {
  showHidden: false,
  depth: null,
  colors: supportsColor,
  indent: false
};

export const formatValue = typed('formatValue', {
  'Symbol, any, any': (value, depth, opts) => formatSymbol(value, opts),

  'BigNumber | Complex | number, any, any': (value, depth, opts) => stylize(value, 'number', opts),
  'null, any, any': (value, depth, opts) => stylize('Null', 'null', opts),
  'boolean, any, any': (value, depth, opts) => stylize(value, 'boolean', opts),

  'Action, any, any': (value, depth, opts) => stylize(value, 'name', opts),
  'string, any, any': (value, depth, opts) => formatString(value, opts),

  'Array, any, any': formatArray,
  'Future, any, any': (value, depth, opts) => inspect(value, opts),
  'Object, any, any': formatMap,

  'any, any, any': (value, depth, opts) => inspect(value, opts)
});

function formatString (value, opts) {
  value = JSON.stringify(value).replace(/^"|"$/g, '')
      .replace(/'/g, "\\'")
      .replace(/\\"/g, '"');
  return stylize(`'${value}'`, 'string', opts);
}

const strLen = str => stripColor(str).length + 1;

function lpad (str, n = 40) {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n, {align: 'right'});
}

function rtrim (str, n = 40) {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n);
}

function stylize (value, styleType, opts) {
  value = value.toString();
  if (opts.colors) {
    const style = styles[styleType];
    if (style) {
      return style(value);
    }
  }
  return value;
}

export function formatState ({stack, queue}, opts = defaultOpts) {
  const n = process.stdout.columns / 2 - 5;
  stack = lpad(formatArray(stack, 0, opts, '  '), n);
  queue = rtrim(formatArray(queue, 0, opts, '  '), n);
  return `${stack} <=> ${queue}`;
}

const sRE = /Symbol\(([^\)]*)\).*/g;

function formatSymbol (value, opts) {
  value = value.toString().replace(sRE, '#$1');
  return stylize(value, 'symbol', opts);
}

function formatArray (obj, depth, opts, braces = '[]') {
  obj = obj.map(x => formatValue(x, depth + 1, opts).replace(/\n/g, '\n  '));
  return reduceToSingleString(obj, braces, opts);
}

function reduceToSingleString (output, braces, opts) {
  const length = output.reduce((prev, cur) => prev + strLen(cur), 0);

  if (length > 60 && opts.indent) {
    return `${braces[0]} ${output.join('\n  ')} ${braces[1]}`;
  }

  return `${braces[0]} ${output.join(' ')} ${braces[1]}`;
}

function formatMap (value, depth, opts) {
  const output = [];
  const keys = Object.keys(value);
  keys.forEach(key => {
    output.push(formatProperty(key, value[key], depth + 1, opts));
  });
  return reduceToSingleString(output, '{}', opts);
}

function formatProperty (key, value, depth, opts) {
  key = stylize(String(key), 'name', opts);
  value = formatValue(value, depth + 1, opts).replace(/\n/g, '\n  ');

  return `${key}: ${value}`;
}
