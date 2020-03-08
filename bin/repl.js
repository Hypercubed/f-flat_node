#!/usr/bin/env node

const readline = require('readline');
const program = require('commander');
const gradient = require('gradient-string');
const memoize = require('memoizee');
const process = require('process');
const chalk = require('chalk');

const { createStack, createRootEnv } = require('../dist/stack');
const { log, bar, ffPrettyPrint } = require('../dist/utils');

const pkg = require('../package.json');

const WELCOME = gradient.rainbow(`

          []]           F♭ Version ${pkg.version}
          []]           Copyright (c) 2000-2020 by Jayson Harshbarger
[]]]]]]]] []] []]]      Documentation: http://hypercubed.github.io/f-flat_node/
[]]       []]]   []]
[]]       []]   []]     
[]]]]]]   []]  []]      Type '.exit' to exit the repl
[]]       []][]]        Type '.clear' to clear the stack and the undo buffer
[]]                     Type '.reset' to reset the environment
[]]                     Type '.help' for more help
`);

const PRESS = chalk.dim(' › Press ');

const CONTINUE = `Continue
${PRESS}u${chalk.dim(' to undo the stack')}
${PRESS}c${chalk.dim(' to continue')}
${PRESS}a${chalk.dim(' to always restore the stack')}
${PRESS}n${chalk.dim(' to never restore the stack')}`;

const HELP = `.clear    Clear the stack and the undo buffer
.reset    Reset the environment
.exit     Exit the repl
.help     Print this help message
`;

const initialPrompt = 'F♭> ';

const bindings = [];

let arg = '';
let buffer = '';
let timeout = null;
let rl = null;

let undoStack = [];
let autoundo = undefined;

const writers = {
  pretty: (_) => ffPrettyPrint.color(_.stack) + '\n',
  literal: (_) => ffPrettyPrint.literal(_.stack) + '\n',
  silent: (_) => '',
};

let currentWriter = writers.pretty;

program
  .version(pkg.version)
  .usage('[options] [commands...]')
  .option('-L, --log-level [level]', 'Set the log level', 'warn')
  .option('-f, --file [file]', 'Evaluate contents of file')
  .option('-i, --interactive', 'force interactive mode', false)
  .option('-q, --quiet', `don't print initial banner`, false)
  .action((...cmds) => {
    cmds.pop();
    arg += cmds.join(' ');
  });

program.parse(process.argv);

if (typeof program.interactive === 'undefined') {
  program.interactive = !program.file && arg === '' && process && process.stdin && process.stdin.isTTY;
}

if (program.logLevel) {
  log.level = program.logLevel;
}

if (typeof program.quiet === 'undefined') {
  program.quiet = !program.interactive;
}

// TODO: start in user directory
process.chdir('./src/ff-lib/');

let f = newStack();

if (program.file) {
  f.promise(`"${program.file}" read await`).then(exitOrStartREPL);
}

if (arg !== '') {
  f.promise(arg).then(exitOrStartREPL);
}

if (!program.file && arg === '') {
  exitOrStartREPL();
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

// functions

function exitOrStartREPL() {
  if (!program.interactive) {
    process.exit();
  } else {
    stackRepl = startREPL();
  }
}

function startREPL() {
  rl = readline.createInterface({
    prompt: initialPrompt,
    input: process.stdin,
    output: process.stdout,
    completer: memoize(completer, { maxAge: 10000 })
  });

  rl.prompt();

  rl.on('line', (line) => {
    if (!processReplCommand(line)) {
      fEval(line);
    }
  }).on('close', () => {
    process.exit(0);
  });
}

function newStack() {
  log.level = program.logLevel || 'warn';

  const newParent = createStack('', createRootEnv());

  newParent.defineAction('prompt', () => {
    return new Promise(resolve => {
      rl.question('', resolve);
    });
  });

  if (!program.quiet) {
    console.log(WELCOME);
  }

  const child = newParent.createChild(undefined);
  child.silent = !program.interactive;
  child.idle.add(() => bar.terminate());
  return child;
}

function fEval(code) {
  buffer += `${code}\n`;
  global.clearTimeout(timeout);
  timeout = global.setTimeout(run, 60);

  function run() {
    global.clearTimeout(timeout);

    if (!buffer.length) {
      return;
    }

    addBefore();

    log.profile('dispatch');
    undoStack.push(f.stateSnapshot());
    f.next(buffer)
      .catch(err => {
        console.error(err);
        if (!program.interactive) {
          process.exit(1);
        }
        if (autoundo === true) {
          undo();
        } else if (autoundo !== false) {
          return errorPrompt();
        }
      })
      .then(fin, fin);  // finally

    buffer = '';

    function fin() {
      log.profile('dispatch');
      rl.setPrompt(f.depth < 1 ? initialPrompt : `F♭${' '.repeat(f.depth)}| `);
      prompt(f);
    }
  }
}

function completer(line) {
  const completions = getKeys();
  const hits = completions.filter(c => c.startsWith(line));
  return [hits.length ? hits : completions, line];
}

function getKeys() {
  const keys = [];
  for (const prop in f.dict.locals) {
    keys.push(prop);
  }
  return keys;
}

function addBefore() {
  while (bindings.length > 0) {
    b = bindings.pop();
    b.detach();
  }

  let qMax = f.stack.length + f.queue.length;
  let last = new Date();

  // move these be part of winston logger?
  switch (log.level.toString()) {
    case 'trace':
      bindings.push(f.before.add(trace));
      bindings.push(f.beforeEach.add(trace));
      bindings.push(f.idle.add(trace));
      break;
    case 'warn': {
      if (f.silent) return;
      bindings.push(f.before.add(updateBar));
      bindings.push(f.beforeEach.add(throttledUpdateBar));
      bindings.push(f.idle.add(() => bar.terminate()));
    }
  }

  function trace() {
    console.log(ffPrettyPrint.formatTrace(f));
  }

  function throttledUpdateBar() {
    const q = f.stack.length + f.queue.length;
    if (q > qMax) qMax = q;

    const now = new Date();
    const delta = now - last;
    if (delta > 120) { // output frequency in ms
      updateBar();
      last = now;
    }
  }

  function updateBar() {
    bar.update(f.stack.length / qMax, {
      stack: f.stack.length,
      queue: f.queue.length,
      depth: f.depth,
      lastAction: ffPrettyPrint.trace(f.currentAction)
    });
  }
}

function prompt() {
  console.log(currentWriter(f));
  rl.prompt();
}

function undo() {
  const state = undoStack.pop();
  Object.assign(f, state);
}

function errorPrompt() {
  return new Promise(resolve => {
    console.log(CONTINUE);
    process.stdin.setRawMode(true);
    process.stdin.once('keypress', data => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      rl.clearLine();

      data = data ? String(data).toLowerCase() : 'u';
  
      switch (data) {
        case 'u':
          undo();
          break;
        case 'a':
          autoundo = true;
          undo();
          break;
        case 'n':
          autoundo = false;
          undo();
          break;
      }
      resolve(data);
    })
    .resume();
  });
}

function processReplCommand(command) {
  if (!command.startsWith('.')) return false;
  command = command.replace(/^\./, '');

  switch (command) {
    case 'clear':
      console.log('Clearing stack and undo buffer...\n');
      f.clear();
      undoStack = [];
      rl.setPrompt(initialPrompt);
      prompt();
      return true;
    case 'reset':
      console.log('Resetting the environment...\n');
      autoundo = undefined;
      undoStack = [];
      f = newStack();
      rl.setPrompt(initialPrompt);
      prompt();
      return true;
    case 'help':
      console.log(HELP);
      prompt();
      return true;
    case 'undo':
      undo();
      rl.setPrompt(initialPrompt);
      prompt();
      return true;
  }
  return false;
}