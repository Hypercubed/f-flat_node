import { randomBytes, createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { arch } from 'os';
import { dirname, join } from 'path';
import * as fetch from 'isomorphic-fetch';
import * as normalizeUrl from 'normalize-url';
import { URL } from 'url';
import { signature } from '@hypercubed/dynamo';

import { bar } from '../utils';
import { dynamo } from '../types';

// const stdin = process.stdin;
const stdout = <any>process.stdout;

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
  if (filepath.includes('%')) filepath = filepath.replace(percentRegEx, '%25');
  tmp.pathname = filepath;
  return tmp;
}

class Resolve {
  @signature()
  string(name: string): string {
    return normalizeUrl(resolve(name).href);
  }

  @signature()
  array([name, base]: string[]): string {
    return normalizeUrl(resolve(name, base).href);
  }
}

/**
 * # Internal Words for Node Environment
 */
export const node = {
  /**
   * ## `args`
   *
   * `-> [str*]`
   *
   * Returns an array containing of command line arguments passed when the process was launched
   */
  args: () => process.argv,

  /**
   * ## `println`
   *
   * `a ->`
   *
   * Prints the value followed by (newline)
   *
   */
  println(a: any) {
    bar.interrupt(String(a));
  },

  /**
   * ## `print`
   *
   * `a ->`
   *
   * Prints the value
   *
   */
  print(a: any) {
    try {
      stdout.clearLine();
      stdout.cursorTo(0);
    } catch (e) {}
    stdout.write(String(a));
  },

  /**
   * ## `exit`
   *
   * `->`
   *
   * terminate the process synchronously with an a status code
   *
   */
  exit(a: any) {
    process.exit(Number(a)); // exit: `process.exit` js-raw ;
  },

  /**
   * ## `rand-u32`
   *
   * `-> x`
   *
   * Generates cryptographically strong pseudo-random with a givennumber of bytes to generate
   *
   */
  'rand-u32': () => randomBytes(4).readUInt32BE(0),

  /**
   * ## `dirname`
   *
   * `str₁ -> str₂`
   *
   * returns the directory name of a path, similar to the Unix dirname command.
   * See https://nodejs.org/api/path.html#path_path_dirname_path
   *
   */
  dirname: (name: string) => dirname(name),

  /**
   * ## `path-join`
   *
   * `[ str* ] -> str`
   *
   * joins all given path segments together using the platform specific separator as a delimiter
   * See https://nodejs.org/api/path.html#path_path_join_paths
   *
   */
  'path-join': (args: string[]) => join(...args),

  /**
   * ## `resolve`
   *
   * `str₁ -> str₂`
   *
   * returns a URL href releative to the current base
   *
   */
  resolve: dynamo.function(Resolve),

  /**
   * ## `exists`
   *
   * `str -> bool`
   *
   * Returns true if the file exists, false otherwise.
   *
   */
  exists: (name: string) => existsSync(name),

  /**
   * ## `read`
   *
   * `str₁ -> str₂`
   *
   * Pushes the content of a file as a utf8 string
   *
   */
  read(name: string): string {
    const url = resolve(name);
    if (url.protocol === 'file:') {
      return readFileSync(url, 'utf8');
    }
    return fetch(url.href).then((res: any) => res.text());
  },

  /**
   * ## `cwd`
   *
   * `-> str`
   *
   * Pushes the current working directory
   *
   */
  cwd: (): string => getURLStringForCwd(),

  md5(x: string) {
    return createHash('md5')
      .update(x)
      .digest('hex');
  },

  sha1(x: string) {
    return createHash('sha1')
      .update(x)
      .digest('base64');
  },

  /**
   * ## `get-env`
   *
   * `str₁ -> str₂`
   *
   * Gets a environment variable
   *
   */
  'get-env'(x: string) {
    if (x in process.env) {
      return process.env[x];
    }
    return null;
  },

  os: arch
};
