import { inspect } from 'util';
import * as fixedWidthString from 'fixed-width-string';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import {boundMethod} from 'autobind-decorator';
import is from '@sindresorhus/is';

import { typed } from '../types/index';

const STYLES = {
  number: chalk.magenta,
  boolean: chalk.magenta,

  null: chalk.greenBright,
  undefined: chalk.grey,

  string: chalk.green,

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
  maxOutputLength: number;
  styles: { [key: string ]: any };
  arrayBraces: string;
  mapBraces: string;
  hideQueue: boolean;
}

const DEFAULT_OPTS: InspectOptions = {
  showHidden: false,
  depth: 10,
  colors: chalk.supportsColor.hasBasic,
  styles: STYLES,
  indent: false,
  maxArrayLength: 50,
  maxObjectKeys: 10,
  maxOutputLength: null,
  arrayBraces: '[]',
  mapBraces: '{}',
  hideQueue: false
};

// TODO: Move this
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

/* export const formatValue: (...args: any) => string = typed('formatValue', {
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

function formatString(value: any, opts?: InspectOptions): string {
  opts = { ...DEFAULT_OPTS, colors: false, ...opts };
  const x = JSON.stringify(value)
    .replace(/^"|"$/g, '')
    .replace(/'/g, `\\'`)
    .replace(/\\"/g, '"');
  return stylize(`'${x}'`, 'string', opts);
} */

/**
 * The length of a string,
 * exclusing colors
 */
function strLen(str: string): number {
  return stripAnsi(str).length + 1;
}

function lpad(str: string, n = 40): string {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n, { align: 'right' });
}

function rtrim(str: string, n = 40): string {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n);
}

export class FFlatPrettyPrinter {
  static get consoleWidth() {
    return process.stdout && process.stdout.columns
      ? process.stdout.columns
      : 80; // todo: this should be an option input
  }

  private _stylizeSymbol: Function;
  private _stylizeString: Function;
  private _stylizeNull: Function;
  private _stylizeBoolean: Function;
  private _stylizeName: Function;
  private _stylizeNumber: Function;
  private _stylizeDate: Function;

  formatValue: (item: any, depth?: number) => string;

  constructor(private opts: InspectOptions) {
    this.opts = {
      ...DEFAULT_OPTS,
      ...opts
    };

    this._stylizeSymbol = this.getStyledFormater('symbol');
    this._stylizeString = this.getStyledFormater('string');
    this._stylizeNull = this.getStyledFormater('null');
    this._stylizeBoolean = this.getStyledFormater('boolean');
    this._stylizeName = this.getStyledFormater('name');
    this._stylizeNumber = this.getStyledFormater('number');
    this._stylizeDate = this.getStyledFormater('date');

    this.formatValue = typed('formatValue', {
      'Symbol, number | null': (value: Symbol) => this.formatSymbol(value),
      'Decimal | Complex | ComplexInfinity | Indeterminate | number, number | null': this._stylizeNumber,
      'null, number | null': this._stylizeNull,
      'boolean, number | null': this._stylizeBoolean,
      'Word | Sentence, number | null': this._stylizeName,
      'string, number | null': this.formatString,
      'Array, number | null': this.formatArray,
      'Future, number | null': (value: any, depth: number) => inspect(value, this.opts),
      'plainObject, number | null': this.formatMap,
      'Date, number | null': this.formatDate,
      'any, number | null': (value: any, depth: number) => inspect(value, this.opts)
    });
  }

  @boundMethod
  formatDate(value: Date): string {
    return this._stylizeDate(value.toISOString());
  }

  @boundMethod
  formatString(value: string): string {
    const x = JSON.stringify(value)
      .replace(/^"|"$/g, '')
      .replace(/'/g, `\\'`)
      .replace(/\\"/g, '"');
    return this._stylizeString(`'${x}'`);
  }

  @boundMethod
  formatTrace({ stack, queue, currentAction }, max = FFlatPrettyPrinter.consoleWidth): string {
    const maxOutputWidth = this.opts.maxOutputLength || FFlatPrettyPrinter.consoleWidth;
    max = (max < 0) ? maxOutputWidth / 2 + max : max / 2;
    max -= 16;

    const stackString = this.formatArray(stack, 0);
    const lastActionString = is.undefined(currentAction) ? '' : this.formatValue(currentAction, 0);
    const queueString = this.formatArray(queue, 0);
    return `${lpad(stackString, max)}> ${fixedWidthString(lastActionString, 16)} <${rtrim(queueString,  max)}`;
  }

  @boundMethod
  formatSymbol(value: Symbol): string {
    const str = value.toString().replace(/Symbol\(([^)]*)\).*/g, '$1');
    return this._stylizeSymbol(str);
  }

  @boundMethod
  formatArray(arr: Array<any>, depth: number = 0): string {
    const opts = (depth > 0 && this.opts.childOpts) ? this.opts.childOpts : this.opts;
    const braces = this.opts.arrayBraces;
    if (!is.nullOrUndefined(opts.depth) && depth >= opts.depth) {
      return `${braces[0]}Array${braces[1]}`;
    }
    const maxLength = opts.maxArrayLength || 100;

    const output = arr
      .slice(0, maxLength)
      .map(x => {
        return this.formatValue(x, depth + 1).replace(/\n/g, '\n  ');
      });

    if (arr.length > output.length) {
      output.push('…');
    }
    return this.reduceToSingleString(output, braces);
  }

  @boundMethod
  formatMap(value: Object, depth: number): string {
    const opts = (depth > 0 && this.opts.childOpts) ? this.opts.childOpts : this.opts;
    const braces = this.opts.mapBraces;
    if (!is.nullOrUndefined(opts.depth) && depth >= opts.depth) {
      return `${braces[0]}Object${braces[1]}`;
    }
    const maxLength = opts.maxObjectKeys || 100;
    const keys = Object.keys(value);
    const output = keys.slice(0, maxLength).map(key => {
      const skey = this._stylizeName(String(key));
      const svalue = this.formatValue(value[key], depth + 1).replace(/\n/g, '\n  ');
      return `${skey}: ${svalue}`;
    });
    if (keys.length > output.length) {
      output.push('…');
    }
    return this.reduceToSingleString(output, braces);
  }

  private getStyledFormater(styleType: string) {
    const style = this.opts.colors ? this.opts.styles[styleType] : null;

    return function stylize(value: any): string {
      const str = value.toString();
      return style ? style(str) : str;
    };
  }

  /**
   * Given a an array of string,
   * If the combine lengeth is > maxLength,
   * wrap lines
   */
  private reduceToSingleString(output: string[], braces: string): string {
    const joined = `${braces[0]} ${output.join('  ')} ${braces[1]}`;
    if (this.opts.indent && strLen(joined) > this.opts.maxOutputLength || FFlatPrettyPrinter.consoleWidth) {
      return `${braces[0]} ${output.join('\n  ')} ${braces[1]}`;
    }
    return joined;
  }
}

export const ffPrettyPrint = new FFlatPrettyPrinter(DEFAULT_OPTS);