import * as unescapeJs from 'unescape-js';

import { StackEnv } from '../engine/env';

const CAP = '${expression-hole}';
const reExpression = /\$\([^\)]*\)/g;

function parts(str: string) {
  const queues: any = [];

  const raw = str
    .replace(reExpression, x => {
      queues.push(x.slice(2, -1));
      return CAP;
    })
    .split(CAP);
  return { raw, queues };
}

export function templateParts(stack: StackEnv, str: string, sen?: any) {
  const { raw, queues } = parts(str);

  const strings = raw.map(s => unicodeDecode(s));
  const stacks = queues.map(q => {
    const c = stack.createChild().eval(q);
    if (sen) c.eval(sen);
    return c.stack;
  });
  return { raw, strings, stacks };
}

export function templateSubstitute(str: string, values: any[]) {
  return str.replace(reExpression, x => values.shift());
}

export function template(stack: StackEnv, template: string, sen?: any): string {
  let { strings, stacks } = templateParts(stack, template, sen);
  const values = stacks.map((s: any) => {
    const ss = s.map((x: any) => String(x)).join(' ');
    return unicodeDecode(ss);
  });

  return strings
    .reduce((acc, s) => {
      acc.push(s);
      const val = values.shift();
      if (val) acc.push(val);
      return acc;
    }, [])
    .join('');
}
/**
 * Decodes a unicode encoded string
 */
export function unicodeDecode(x: string): string {
  return unescapeJs(x);
}
