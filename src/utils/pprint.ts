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

interface InspectOptions {
  showHidden?: boolean;
  depth?: number | null;
  colors?: boolean;
  customInspect?: boolean;
  maxArrayLength?: number | null;
  maxObjectKeys?: number | null;
  indent?: boolean;
  childOpts?: InspectOptions;
}

const defaultOpts: InspectOptions = {
  showHidden: false,
  depth: null,
  colors: supportsColor,
  indent: false,
  maxArrayLength: 10000,
  maxObjectKeys: 10
};

export const type = typed('type', {
  Word: (x: unknown) => 'action',
  Sentence: (x: unknown) => 'action',
  Array: (x: unknown) => 'array',
  Decimal: (x: unknown) => 'number',
  Complex: (x: unknown) => 'complex',
  Date: (x: unknown) => 'date',
  RegExp: (x: unknown) => 'regexp',
  any: (x: unknown) => typeof x
});

export const formatValue: Function = typed('formatValue', {
  'Symbol, any, any': (value: Symbol, depth: unknown, opts: any) => formatSymbol(value, opts),

  'Decimal | Complex | ComplexInfinity | number, any, any': (
    value: Decimal | any | number,
    depth: unknown,
    opts: any
  ) => stylize(value, 'number', opts),
  'null, any, any': (value: null, depth: unknown, opts: any) => stylize('Null', 'null', opts),
  'boolean, any, any': (value: boolean, depth: unknown, opts: any) => stylize(value, 'boolean', opts),

  'Word, any, any': (value: any, depth: unknown, opts: any) => stylize(value, 'name', opts),
  'Sentence, any, any': (value: any, depth: unknown, opts: any) => stylize(value, 'name', opts),

  'string, any, any': (value: string, depth: unknown, opts: any) => formatString(value, opts),

  'Array, any, any': formatArray,
  'Future, any, any': (value: any, depth: unknown, opts: any) => inspect(value, opts),
  'plainObject, any, any': formatMap,

  'Date, any, any': (value: any, depth: unknown, opts: any) => stylize(value, 'name', opts),

  'any, any, any': (value: any, depth: unknown, opts: any) => inspect(value, opts)
});

function formatString(
  value: any,
  opts: InspectOptions = { colors: false }
): string {
  const x = JSON.stringify(value)
    .replace(/^"|"$/g, '')
    .replace(/'/g, `\\'`)
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

function stylize(
  value: any,
  styleType: string,
  opts: InspectOptions = { colors: false }
): string {
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
  const maxOutputLength =
    process.stdout && process.stdout.columns
      ? process.stdout.columns / 2 - 5
      : 35; // todo: this should be an option input
  opts.childOpts = { ...opts, maxArrayLength: 5, maxObjectKeys: 5 };
  stack = lpad(formatArray(stack, 0, opts, '  '), maxOutputLength);
  queue = rtrim(formatArray(queue, 0, opts, '  '), maxOutputLength);
  return `${stack} <=> ${queue}`;
}

const sRE = /Symbol\(([^)]*)\).*/g;

function formatSymbol(value: Symbol, opts: InspectOptions): string {
  const str = value.toString().replace(sRE, '$1');
  return stylize(str, 'symbol', opts);
}

export function formatArray(
  arr: Array<any>,
  depth: number,
  opts: InspectOptions,
  braces = '[]'
): string {
  const maxLength = opts.maxArrayLength || 100;
  const output = arr
    .slice(0, maxLength)
    .map(x =>
      formatValue(x, depth + 1, opts.childOpts || opts).replace(/\n/g, '\n  ')
    );
  if (arr.length > output.length) {
    output.push('…');
  }
  return reduceToSingleString(output, braces, opts);
}

function reduceToSingleString(
  output: any[],
  braces: string,
  opts: InspectOptions
): string {
  const length = output.reduce((prev, cur) => prev + strLen(cur), 0);
  if (length > 60 && opts.indent) {
    return `${braces[0]} ${output.join('\n  ')} ${braces[1]}`;
  }
  return `${braces[0]} ${output.join(' ')} ${braces[1]}`;
}

function formatMap(value: Object, depth: number, opts: InspectOptions): string {
  const maxLength = opts.maxObjectKeys || 100;
  const keys = Object.keys(value);
  const output = keys.slice(0, maxLength).map(key => {
    return formatProperty(key, value[key], depth + 1, opts.childOpts || opts);
  });
  if (keys.length > output.length) {
    output.push('…');
  }
  return reduceToSingleString(output, '{}', opts);
}

function formatProperty(
  key: string,
  value: any,
  depth: number,
  opts: InspectOptions
): string {
  const skey = stylize(String(key), 'name', opts);
  const svalue = formatValue(value, depth + 1, opts).replace(/\n/g, '\n  ');
  return `${skey}: ${svalue}`;
}
