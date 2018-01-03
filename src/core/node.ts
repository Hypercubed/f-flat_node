import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, readFile, existsSync } from 'fs';
import { dirname, join, extname } from 'path';
import * as fetch from 'isomorphic-fetch';
import { promisify } from 'util';
import * as normalizeUrl from 'normalize-url';

const readFileAsync = promisify(readFile);

import { StackEnv } from '../env';
import { log, FFlatError } from '../utils';
import { typed } from '../types';

// const stdin = process.stdin;
const stdout = <any>process.stdout;

const { URL } = require('url');

function resolve(input: string, base = getURLStringForCwd()) {
  return new URL(input, base);
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
export const node = {
  /**
   * ## `args`
   */
  args: () => process.argv,

  /**
   * ## `println`
   *
   * Prints the value followed by (newline)
   *
   */
  println: (a, ...b) => {
    try {
      stdout.clearLine();
      stdout.cursorTo(0);
    } catch (e) {

    }
    console.log(a, ...b);
  },

  /**
   * ## `print`
   *
   * Prints the value
   *
   */
  print: (a) => {
    try {
      stdout.clearLine();
      stdout.cursorTo(0);
    } catch (e) {

    }
    stdout.write(String(a));
  },

  /**
   * ## `?`
   *
   * Prints the value followed by (newline)
   *
   */
  '?': (a, ...b) => {
    try {
      stdout.clearLine();
      stdout.cursorTo(0);
    } catch (e) {

    }
    console.info(a, ...b);
  },

  /**
   * ## `exit`
   *
   * terminate the process synchronously with an a status code
   *
   */
  exit: a => {
    process.exit(Number(a)); // exit: `process.exit` js-raw ;
  },

  /**
   * ## `rand-u32`
   *
   * Generates cryptographically strong pseudo-random with a givennumber of bytes to generate
   *
   */
  'rand-u32': () => randomBytes(4).readUInt32BE(0, true),

  /**
   * ## `dirname`
   *
   * returns the directory name of a path, similar to the Unix dirname command.
   * See https://nodejs.org/api/path.html#path_path_dirname_path
   *
   */
  dirname: (name: string) => dirname(name),

  /**
   * ## `path-join`
   *
   * joins all given path segments together using the platform specific separator as a delimiter
   * See https://nodejs.org/api/path.html#path_path_join_paths
   *
   */
  'path-join': (args: string[]) => join(...args),

  /**
   * ## `resolve`
   *
   * returns a URL href releative to the current base
   *
   */
  resolve: typed('resolve', {
    'string': (name: string): string => normalizeUrl(resolve(name).href),
    'Array': ([name, base]: string[]): string => normalizeUrl(resolve(name, base).href)
  }),

  /**
   * ## `exists`
   *
   * Returns true if the file exists, false otherwise.
   *
   */
  exists: (name: string) => existsSync(name),

  /**
   * ## `read`
   *
   * Pushes the content of a file as a utf8 string
   *
   */
  read(name: string): string {
    const url = resolve(name);
    try {
      if (url.protocol === 'file:') {
        return readFileSync(url, 'utf8');
      }
      return fetch(url.href).then(res => res.text());
    } catch (e) {
      throw new FFlatError(e, this);
    }
  }
};
