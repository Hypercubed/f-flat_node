import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, readFile, existsSync } from 'fs';
import { dirname, join } from 'path';
import * as fetch from 'isomorphic-fetch';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

import { StackEnv } from '../env';
import { log } from '../utils';

// const stdin = process.stdin;
const stdout = <any>process.stdout;

const { URL } = require('url');

function resolve(specifier: string, parentModuleURL = getURLStringForCwd()) {
  return new URL(specifier, parentModuleURL);
}

function getURLStringForCwd(): string | undefined {
  try {
    return getURLFromFilePath(`${process.cwd()}/`).href;
  } catch (e) {
    e.stack;
    // If the current working directory no longer exists.
    if (e.code === 'ENOENT') {
      return undefined;
    }
    throw e;
  }
}

// We percent-encode % character when converting from file path to URL,
// as this is the only character that won't be percent encoded by
// default URL percent encoding when pathname is set.
const percentRegEx = /%/g;
function getURLFromFilePath(filepath: string) {
  const tmp = new URL('file://');
  if (filepath.includes('%'))
    filepath = filepath.replace(percentRegEx, '%25');
  tmp.pathname = filepath;
  return tmp;
}


/**
 * # Internal Node Words
 */
export default {

  /**
   * ## `os`
   */
  os: () => process.platform,


  /**
   * ## `cwd`
   */
  cwd: () => process.cwd(),

  /**
   * ## `println`
   */
  println: (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.log(a, ...b);
  },

  /**
   * ## `print`
   */
  print: (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(String([a, ...b]));
  },

  /**
   * ## `?`
   */
  '?': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.info(a, ...b);
  },

  /**
   * ## `bye`
   */
  bye: () => {
    process.exit(0);
  },

  /**
   * ## `rand-u32`
   */
  'rand-u32': function randU32() {
    return randomBytes(4).readUInt32BE(0, true);
  },

  /**
   * ## `env`
   */
  env: () => process.env,

  /**
   * ## `dirname`
   */
  dirname: (name: string) => dirname(name),

  /**
   * ## `path-join`
   */
  'path-join': (args: string[]) => join(...args),

  /**
   * ## `resolve`
   */
  resolve: (name: string) => resolve(name).href,

  /**
   * # fs.existsSync
   */
  exists: (name: string) => existsSync(name),

  /**
   * ## `read`
   */
  read(name: string): string {
    const url = resolve(name);
    if (url.protocol === 'file:') {
      return readFileSync(url, 'utf8');
    }
    return fetch(url.href).then(res => res.text());
  },

  /**
   * ## `sesssave`
   */
  sesssave(this: StackEnv) {
    log.debug('saving session');
    writeFileSync(
      'session',
      JSON.stringify(
        {
          dict: this.dict,
          stack: this.stack
        },
        null,
        2
      ),
      'utf8'
    );
  }
};
