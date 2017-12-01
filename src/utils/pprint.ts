import { inspect } from 'util';
import * as fixedWidthString from 'fixed-width-string';
import { stripColor, supportsColor } from 'chalk';
import * as chalk from 'chalk';

import { typed } from '../types/index';

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

export const formatValue: Function = typed('formatValue', {
  'Symbol, any, any': (value, depth, opts) => formatSymbol(value, opts),

  'Decimal | Complex | ComplexInfinity | number, any, any': (value, depth, opts) =>
    stylize(value, 'number', opts),
  'null, any, any': (value, depth, opts) => stylize('Null', 'null', opts),
  'boolean, any, any': (value, depth, opts) => stylize(value, 'boolean', opts),

  'Action, any, any': (value, depth, opts) => stylize(value, 'name', opts),
  'string, any, any': (value, depth, opts) => formatString(value, opts),

  'Array, any, any': formatArray,
  'Future, any, any': (value, depth, opts) => inspect(value, opts),
  'Object, any, any': formatMap,

  'Date, any, any': (value, depth, opts) => stylize(value, 'name', opts),

  'any, any, any': (value, depth, opts) => inspect(value, opts)
});

function formatString(value: any, opts = { colors: false }): string {
  const x = JSON.stringify(value)
    .replace(/^"|"$/g, '')
    .replace(/'/g, '\\\'')
    .replace(/\\"/g, '"');
  return stylize(`'${x}'`, 'string', opts);
}

const strLen = (str: string): number => stripColor(str).length + 1;

function lpad(str: string, n = 40): string {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n, { align: 'right' });
}

function rtrim(str: string, n = 40): string {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n);
}

function stylize(value: any, styleType: string, opts = { colors: false }): string {
  const str = value.toString();
  if (opts.colors) {
    const style = styles[styleType];
    if (style) {
      return style(str);
    }
  }
  return str;
}

export function formatState({ stack, queue }, opts = defaultOpts): string {
  const n = (process.stdout && process.stdout.columns) ? process.stdout.columns / 2 - 5 : 35;
  stack = lpad(formatArray(stack, 0, opts, '  '), n);
  queue = rtrim(formatArray(queue, 0, opts, '  '), n);
  return `${stack} <=> ${queue}`;
}

const sRE = /Symbol\(([^)]*)\).*/g;

function formatSymbol(value: any, opts): string {
  const str = value.toString().replace(sRE, '#$1');
  return stylize(str, 'symbol', opts);
}

function formatArray(obj: any, depth: number, opts: any, braces = '[]'): string {
  const str = obj.map(x => formatValue(x, depth + 1, opts).replace(/\n/g, '\n  '));
  return reduceToSingleString(str, braces, opts);
}

function reduceToSingleString(output: any[], braces: string, opts: any): string {
  const length = output.reduce((prev, cur) => prev + strLen(cur), 0);

  if (length > 60 && opts.indent) {
    return `${braces[0]} ${output.join('\n  ')} ${braces[1]}`;
  }

  return `${braces[0]} ${output.join(' ')} ${braces[1]}`;
}

function formatMap(value: Object, depth: number, opts: { colors: boolean }): string {
  const output: string[] = [];
  const keys = Object.keys(value);
  keys.forEach(key => {
    output.push(formatProperty(key, value[key], depth + 1, opts));
  });
  return reduceToSingleString(output, '{}', opts);
}

function formatProperty(key: any, value: any, depth: number, opts: { colors: boolean }): string {
  const skey = stylize(String(key), 'name', opts);
  const svalue = formatValue(value, depth + 1, opts).replace(/\n/g, '\n  ');

  return `${skey}: ${svalue}`;
}
