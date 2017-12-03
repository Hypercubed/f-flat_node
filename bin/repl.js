#!/usr/bin/env node

/* global process */

const repl = require('repl');
const program = require('commander');

const { Stack, RootStack } = require('../dist/stack');
const { log, formatValue } = require('../dist/utils');

const pkg = require('../package.json');

const welcome = `
Welcome to F♭ REPL Interpreter
F♭ Version ${pkg.version} (C) 2000-2017 ${pkg.author}
`; // todo: Type ".help", ".copyright", ".credits" or ".license" for more information.

const initialPrompt = 'f♭>';
const inspectOptions = {
  showHidden: false,
  depth: null,
  colors: true,
  indent: true
};

let arg = '';
let buffer = '';
let timeout = null;
let silent = false;

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

process.on('uncaughtException', () => {
  console.log('The event loop was blocked for longer than 2000 milliseconds');
  process.exit(1);
});

repl.start({
  prompt: `${initialPrompt} `,
  eval: fEval,
  writer,
  ignoreUndefined: false,
  useColors: true,
  useGlobal: false
}).on('reset', () => {
  f = newStack();
}).defineCommand('silent', {
  help: 'Toggle silent mode',
  action() {
    silent = !silent;
    this.displayPrompt();
  }
});

// functions

function newStack() {
  const f = Stack('true auto-undo', RootStack());

  f.defineAction('prompt', () => {
    return new Promise(resolve => {
      stackRepl.question('', resolve);
    });
  });

  console.log(welcome);

  return f.createChild(undefined);
}

function writer(_) {
  return silent ? '' : `${formatValue(_.stack, null, inspectOptions)}\n`;
}

function fEval(code, _, __, cb) {
  code = code
    .replace(/^\(([\s\S]*)\n\)$/m, '$1')
    .replace(/[\s]/g, ' ')
    .trim();

  if (code.slice(0, 2) === '({' && code.slice(-2) === '})') {
    code = code.slice(1, -1); // remove "(" and ")" added by node repl
  }

  buffer += `${code}\n`;
  global.clearTimeout(timeout);
  timeout = global.setTimeout(run, 60);

  function run() {
    global.clearTimeout(timeout);

    if (!buffer.length) {
      return;
    }

    f
      .next(buffer)
      .then(result => cb(null, result))
      .catch(err => {
        cb(err);
      });

    buffer = '';
  }
}
