/* global process */

import crypto from 'crypto';

// const stdin = process.stdin;
const stdout = process.stdout;

export default {
  'os': () => process.platform,
  'println': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.log(a, ...b);
  },
  'print': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(String([a, ...b]));
  },
  '?': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.info(a, ...b);
  },
  'bye': () => {
    process.exit(0);
  },
  'rand-u32': function randU32 () {
    return crypto.randomBytes(4).readUInt32BE(0, true);
  },
  'env': () => process.env,
  'cls': '"\u001B[2J\u001B[0;0f" println'
};
