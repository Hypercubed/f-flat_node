import is from '@sindresorhus/is';
import stripAnsi from 'strip-ansi';
import * as fixedWidthString from 'fixed-width-string';

import { Sentence, Complex } from '../types';

import {
  Milton,
  trimStrings,
  maxDepth,
  ansiColors,
  arrayDecender,
  objectDecender,
  jsValues,
  jsonValues,
  indent,
  COLORIZE_OPTIONS
} from '@hypercubed/milton';

function getDefaultWidth() {
  if (process && process.stdout && process.env.NODE_ENV !== 'test') {
    return process.stdout.columns || 70;
  }
  return 70;
}

export const objectToString = () => (s: any, _p: any, v: any) => {
  const t = toString.call(s);
  if (t === '[object Object]' && s.toString) {
    const vt = s.toString();
    if (vt !== t) return vt;
  }
  return s;
};

export const sentences = (_o: never, _r: never, get: any) => (
  s: any,
  path: any,
  v: any
) => (v instanceof Sentence ? get(v.value, path) : s);

export const symbols = () => (s: any) => {
  if (typeof s === 'symbol') {
    const esc = s.toString().replace(/Symbol\(([^)]*)\).*/g, '$1');
    return `#${esc}`;
  }
  return s;
};

export const breakLength = (options: any) => {
  return (s: any) => {
    if (typeof s === 'string') {
      const oneline = s.replace(/\n\s*/g, options.compact ? '' : ' ');
      return stripAnsi(oneline).length < options.breakLength ? oneline : s;
    }
    return s;
  };
};

const literals = () => {
  return (s: any, _p: any, v: any) => {
    if (typeof v === 'object') {
      if (v instanceof Complex) {
        return `"${s}":complex`;
      }
      if (v instanceof RegExp) {
        return `"${s}":regexp`;
      }
      if (v instanceof Date) {
        return `"${s}":date`;
      }
    }
    return s;
  };
};

const functions = () => {
  return (s: any, _p: any, v: any) => {
    if (typeof v === 'function') {
      return `[function${v.name && ` ${v.name}`}]`;
    }
    return s;
  };
};

export const oneline = () => (s: any) =>
  typeof s === 'string' ? s.replace(/\n\s*/g, ' ') : s;

function base(_: Milton) {
  _.add(jsValues);
  _.add(jsonValues, { quote: `'` });
  _.add(functions);

  _.add(symbols);
  _.add(sentences);
  _.add(objectToString);

  _.add(arrayDecender, { comma: false, maxLength: 20 });
  _.add(objectDecender, { quoteKeys: false, compact: false });

  return _;
}

const COLORS = {
  ...COLORIZE_OPTIONS,
  Word: 'green',
  Key: 'bold.yellow',
  Decimal: COLORIZE_OPTIONS.number,
  Complex: COLORIZE_OPTIONS.number,
  ComplexInfinity: COLORIZE_OPTIONS.number,
  Indeterminate: COLORIZE_OPTIONS.number
};

const stringify = new Milton();
stringify.use(base);
stringify.add(oneline);

const pretty = new Milton();
pretty.use(base);
pretty.add(trimStrings);
pretty.add(maxDepth, { max: 5 });
pretty.add(indent);
pretty.add(breakLength, { compact: false, get breakLength() { return getDefaultWidth(); }});

const color = new Milton();
color.use(base);
color.add(trimStrings);
color.add(maxDepth, { max: 5 });
color.add(indent);
color.add(breakLength, { compact: false, get breakLength() { return getDefaultWidth(); }});
color.add(ansiColors, COLORS);

const trace = new Milton();
trace.use(base);
trace.add(oneline);
trace.add(ansiColors, COLORS);

const literal = new Milton();
literal.use(base);
literal.add(literals);
literal.add(trimStrings);
literal.add(maxDepth, { max: 5 });
literal.add(indent);
literal.add(breakLength, { compact: false, get breakLength() { return getDefaultWidth(); }});
literal.add(ansiColors, COLORS);

export const ffPrettyPrint = {
  get consoleWidth() {
    return process?.stdout?.columns || 80; // todo: this should be an option input
  },

  color: color.stringify.bind(color),

  stringify: stringify.stringify.bind(stringify),

  trace: trace.stringify.bind(trace),

  literal: literal.stringify.bind(literal),

  formatTrace(
    { stack, queue, currentAction },
    max = ffPrettyPrint.consoleWidth
  ): string {
    const maxOutputWidth = ffPrettyPrint.consoleWidth;
    max = max < 0 ? maxOutputWidth / 2 + max : max / 2;
    max -= 16;

    const stackString = trace.stringify(stack);
    const lastActionString = is.undefined(currentAction)
      ? ''
      : trace.stringify(currentAction);
    const queueString = trace.stringify(queue);
    return `${lpad(stackString, max)}> ${fixedWidthString(
      lastActionString,
      16
    )} <${rtrim(queueString, max)}`;
  }
};

function lpad(str: string, n = 40): string {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n, { align: 'right' });
}

function rtrim(str: string, n = 40): string {
  str = str.replace(/[\s\n]+/gm, ' ');
  return fixedWidthString(str, n);
}
