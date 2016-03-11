import repl from 'repl';
import util from 'util';
import tripwire from 'tripwire';

import {Stack} from '../src/stack';
import pkg from '../package.json';
import {log} from '../src/logger';

const initialPrompt = 'f♭>';
const inspectOptions = {
  showHidden: false,
  depth: null,
  colors: true
};

const program = require('commander');

let arg = '';

program
  .version(pkg.version)
  .usage('[options] [commands...]')
  .option('-L, --log-level [level]', 'Set the log level [warn]', 'warn')
  .action((...cmds) => {
    cmds.pop();
    arg += cmds.join(' ');
  });

program.parse(process.argv);

let f = new Stack('true auto-undo');

if (program.logLevel) {
  log.level = program.logLevel;
}

if (arg !== '') {
  f.eval(arg);
  console.log(`${util.inspect(f.stack, inspectOptions)}\n`);
  process.exit();
}

setupStack();

const stackRepl = repl.start({
  prompt: `${initialPrompt} `,
  eval: fEval,
  writer,
  ignoreUndefined: false,
  useColors: true,
  useGlobal: false
})
.on('reset', setupStack);

process.on('uncaughtException', () => {
  console.log('The event loop was blocked for longer than 2000 milliseconds');
  process.exit(1);
});

stackRepl
  .defineCommand('.', {
    help: 'print stack',
    action: function action () {
      console.log(writer(f));
      this.displayPrompt();
    }
  });

function setupStack () {
  f = new Stack('true auto-undo "Welcome to f♭" println');
  f.defineAction('prompt', () => {
    return new Promise(resolve => {
      stackRepl.question('', resolve);
    });
  });
}

function writer (_) {
  const depth = '>'.repeat(_.depth);
  stackRepl.setPrompt(`${initialPrompt}${depth} `);

  // console.log(v8.getHeapStatistics());
  // console.log(_.queue);

  return `${util.inspect(_.stack, inspectOptions)}\n`;
}

let buffer = '';
let timeout = null;

function fEval (code, _, __, cb) {
  code = code
    .replace(/^\(([\s\S]*)\n\)$/m, '$1')
    .replace('[\s]', ' ')
    .trim();

  if (code.slice(0, 1) === '({' && code[code.length - 1] === ')') {
    code = code.slice(1, -1); // remove "(" and ")" added by node repl
  }

  buffer += `${code}\n`;
  clearTimeout(timeout);
  timeout = setTimeout(run, 60);

  /* const qcount = (code.match(/\`/g) || []).length;

  if (code[code.length - 1] === '\\' || qcount % 2 === 1) {
    buffer = `${code.slice(0, -1)}\n`;
  } else {
    buffer = '';

    tripwire.resetTripwire(600000);  // 10 mins max

    f.next(code)
      .then(result => cb(null, result))
      .catch(err => {
        console.log(err);
        cb(err);
      });
  } */

  function run () {
    clearTimeout(timeout);
    if (!buffer.length) {
      return;
    }

    tripwire.resetTripwire(600000);  // 10 mins max

    f.next(buffer)
      .then(result => cb(null, result))
      .catch(err => {
        cb(err);
      });

    buffer = '';
  }
}
