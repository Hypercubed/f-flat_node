/* global process */

import repl from 'repl';

import program from 'commander';

import { Stack } from '../src/stack';
import pkg from '../package.json';
import { log } from '../src/utils/logger';
import { formatValue } from '../src/utils/pprint';

const initialPrompt = 'f♭>';
const inspectOptions = {
  showHidden: false,
  depth: null,
  colors: true,
  indent: true
};

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

let f = newStack();

if (program.logLevel) {
  log.level = program.logLevel;
}

if (arg !== '') {
  f.eval(arg);
  console.log(formatValue(f.stack, null, inspectOptions));
  console.log();
  process.exit();
}

console.log(`Welcome to F♭ REPL Interpreter
F♭ Version ${pkg.version} (C) 2000-2017 ${pkg.author}
`); // Type "help", "copyright", "credits" or "license" for more information.

const stackRepl = repl.start({
  prompt: `${initialPrompt} `,
  eval: fEval,
  writer,
  ignoreUndefined: false,
  useColors: true,
  useGlobal: false
});

stackRepl.on('reset', () => {
  f = newStack();
});

process.on('uncaughtException', () => {
  console.log('The event loop was blocked for longer than 2000 milliseconds');
  process.exit(1);
});

stackRepl.defineCommand('.', {
  help: 'print stack',
  action: function action() {
    console.log(writer(f));
    this.displayPrompt();
  }
});

function newStack() {
  const f = new Stack().eval('true auto-undo');
  f.defineAction('prompt', () => {
    return new Promise(resolve => {
      stackRepl.question('', resolve);
    });
  });
  return f.createChild();
}

function writer(_) {
  // const depth = '>'.repeat(_.depth);
  // stackRepl.setPrompt(`${initialPrompt}${depth} `);

  // console.log(v8.getHeapStatistics());
  // console.log(_.queue);

  return `${formatValue(_.stack, null, inspectOptions)}\n`;

  // return `${util.inspect(_.stack, inspectOptions)}\n`;
}

let buffer = '';
let timeout = null;

function fEval(code, _, __, cb) {
  code = code
    .replace(/^\(([\s\S]*)\n\)$/m, '$1')
    .replace(/[\s]/g, ' ')
    .trim();

  if (code.slice(0, 2) === '({' && code.slice(-2) === '})') {
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

  function run() {
    clearTimeout(timeout);

    // const qcount = (buffer.match(/\`/g) || []).length;
    if (!buffer.length) {
      return;
    }

    // tripwire.resetTripwire(600000);  // 10 mins max
    f
      .next(buffer)
      .then(result => cb(null, result))
      .catch(err => {
        cb(err);
      });

    buffer = '';
  }
}
