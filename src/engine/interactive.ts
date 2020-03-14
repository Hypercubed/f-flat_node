#!/usr/bin/env node

import * as readline from 'readline';
import * as program from 'commander';
import * as gradient from 'gradient-string';
import * as memoize from 'memoizee';
import * as process from 'process';
import * as chalk from 'chalk';
import * as fixedWidthString from 'fixed-width-string';

import { createRootEnv } from '../stack';
import { log, bar, ffPrettyPrint, type } from '../utils';

import { StackEnv } from './env';

const WELCOME = gradient.rainbow(`

          []]           F♭ Version ${process.env.npm_package_version}
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
${PRESS}{enter}${chalk.dim(' to undo the stack')}
${PRESS}{esc}${chalk.dim(' to continue')}
${PRESS}a${chalk.dim(' to always restore the stack')}
${PRESS}n${chalk.dim(' to never restore the stack')}`;

const COMMANDS = [
  ['.clear', 'Clear the stack and the undo buffer'],
  ['.reset', 'Reset the environment'],
  ['.editor', 'Enter editor mode'],
  ['.echo', 'Change the stack echo mode'],
  ['.exit', 'Exit the repl'],
  ['.help', 'Print this help message'],
];

const HELP = COMMANDS.map(c => {
  return `${chalk.gray(fixedWidthString(c[0], 10))} ${c[1]}`;
}).join('\n');

const initialPrompt = 'F♭> ';

// Writers, use `.echo` to cycle through writers
const writers = {
  pretty: (_: StackEnv) => ffPrettyPrint.color(_.stack) + '\n',
  literal: (_: StackEnv) => ffPrettyPrint.literal(_.stack) + '\n',
  silent: (_: StackEnv) => '',
};

export function newStack(): StackEnv {
  log.level = program.logLevel || 'warn';

  const newParent = createRootEnv();

  if (!program.quiet) {
    console.log(WELCOME);
  }

  const child = newParent.createChild(undefined);
  child.silent = !program.interactive;
  child.idle.add(() => bar.terminate());
  return child;
}

export class CLI {
  private readonly readline: readline.ReadLine;
  private isPaused = false;
  private watchCtrlC = false;
  private f = null;
  private editorMode = false;
  private buffer = '';
  private timeout = null;
  private undoStack = [];
  private autoundo = undefined;
  private currentWriter = writers.pretty;
  private bindings = [];

  constructor() {
    this.readline = readline.createInterface({
      prompt: initialPrompt,
      input: process.stdin,
      output: process.stdout,
      completer: this.completer.bind(this)
    });

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
  }

  start(f: StackEnv) {
    this.f = f || newStack();

    this.f.defineAction('prompt', () => {
      return new Promise(resolve => {
        this.readline.question('', resolve);
      });
    });

    this.readline.prompt();

    this.readline.on('pause', () => {
      this.isPaused = true;
    });
  
    this.readline.on('resume', () => {
      this.isPaused = false;
    });
  
    this.readline.on('line', (line: string) => {
      if (!this.isPaused && !this.processReplCommand(line)) {
        this.fEval(line);
      }
      this.watchCtrlC = false;
    });
  
    this.readline.on('close', () => {
      process.exit(0);
    });
  
    this.readline.on('SIGINT', () => {
      if (this.editorMode) {
        this.buffer = '';
        this.turnOffEditorMode();
      } else if (this.watchCtrlC) {
        this.readline.pause();
      } else {
        console.log(`\nTo exit, press ^C again or ^D or type .exit`);
        this.prompt();
        this.watchCtrlC = true;
      }
    });

    this.readline.on('SIGCONT', () => {
      this.prompt();
    });

    process.stdin.on('keypress', (s, key) => {
      // console.log({ s, key });
      switch (key.name) {
        case 'enter':
          this.buffer += ']\n'.repeat(this.f.depth);
        case 'e':
          if (key.ctrl) {
            if (this.editorMode) {
              this.turnOffEditorMode();
            } else {
              this.turnOnEditorMode();
            }
          }
      }
    });
  }

  private fEval(code: string) {
    this.buffer += `${code}\n`;
    global.clearTimeout(this.timeout);
  
    if (!this.editorMode) {
      this.timeout = global.setTimeout(() => this.run(), 60);
    }
  }

  private run() {
    global.clearTimeout(this.timeout);

    if (!this.buffer.length) {
      return;
    }

    this.addBeforeHooks();

    const fin = () => {
      this.readline.resume();
      log.profile('dispatch');
      this.prompt();
    }

    log.profile('dispatch');
    this.undoStack.push(this.f.stateSnapshot());
    this.readline.pause();
    this.f.next(this.buffer)
      .catch(err => {
        console.error(err);
        if (this.autoundo === true) {
          this.undo();
        } else if (this.autoundo !== false) {
          return this.errorPrompt();
        }
      })
      .then(fin, fin);  // finally

    this.buffer = '';
  }

  private processReplCommand(command: string) {
    if (!command.startsWith('.')) return false;
    command = command.replace(/^\./, '');
  
    switch (command) {
      case 'clear':
        console.log('Clearing stack and undo buffer...\n');
        this.f.clear();
        this.undoStack = [];
        this.prompt();
        return true;
      case 'reset':
        console.log('Resetting the environment...\n');
        this.autoundo = undefined;
        this.undoStack = [];
        this.f = newStack();
        this.prompt();
        return true;
      case 'help':
        console.log(HELP);
        this.prompt();
        return true;
      case 'undo':
        this.undo();
        this.prompt();
        return true;
      case 'echo':
        const entries = Object.entries(writers);
        const i = entries.findIndex(([_, v]) => v === this.currentWriter);
        const n = (i + 1) % entries.length;
        console.log(`Switched to ${entries[n][0]} mode\n`);
        this.currentWriter = entries[n][1];
        this.prompt();
        return true;
      case 'exit':
        process.exit();
        return true;
      case 'editor':
        this.turnOnEditorMode();
        return true;
      case 's': {
        const N = Math.max(0, this.f.stack.length - 20);
        for (let i = N; i < this.f.stack.length; i++) {
          const v = this.f.stack[i];
          const n = fixedWidthString(this.f.stack.length - i, 4, { align: 'right' });
          console.log(`${n}: ${ffPrettyPrint.color(v)} [${type(v)}]`);
        }
        this.prompt(false);
        return true;        
      }
    }
    return false;
  }

  private turnOnEditorMode() {
    console.log('Entering editor mode (^E to finish, ^C to cancel)');
    this.editorMode = true;
    this.readline.setPrompt(initialPrompt);
  }
  
  private turnOffEditorMode() {
    this.editorMode = false;
    this.fEval('');
  }

  private prompt(print = true) {
    print && console.log(this.currentWriter(this.f));
    this.readline.setPrompt(this.f.depth < 1 ? initialPrompt : `F♭${' '.repeat(this.f.depth - 1)}| `);
    this.readline.prompt();
  }

  private async errorPrompt() {
    console.log(CONTINUE);
    let data = await this.getKeypress();
    data = data ? String(data).toLowerCase() : 'u';
  
    switch (data) {
      case 'n':
        this.autoundo = false;
      case 'c':
      case '\u001b':
        break;
      case 'a':
        this.autoundo = true;
      case 'u':
      default:
        this.undo();
        break;
    }
    return data;
  }

  private undo() {
    const state = this.undoStack.pop();
    Object.assign(this.f, state);
  }

  private addBeforeHooks() {
    while (this.bindings.length > 0) {
      const b = this.bindings.pop();
      b.detach();
    }
  
    let qMax = this.f.stack.length + this.f.queue.length;

    const trace = () => console.log(ffPrettyPrint.formatTrace(this.f));

    const updateBar = () => {
      const q = this.f.stack.length + this.f.queue.length;
      if (q > qMax) qMax = q;
  
      bar.update(this.f.stack.length / qMax, {
        stack: this.f.stack.length,
        queue: this.f.queue.length,
        depth: this.f.depth,
        lastAction: ffPrettyPrint.trace(this.f.currentAction)
      });
    };
  
    // move these be part of winston logger?
    switch (log.level.toString()) {
      case 'trace':
        this.bindings.push(this.f.before.add(trace));
        this.bindings.push(this.f.beforeEach.add(trace));
        this.bindings.push(this.f.idle.add(trace));
        break;
      case 'warn': {
        if (this.f.silent) return;
        this.bindings.push(this.f.before.add(updateBar));
        this.bindings.push(this.f.beforeEach.add(updateBar));
        this.bindings.push(this.f.idle.add(() => bar.terminate()));
      }
    }
  }

  private getKeypress() {
    process.stdin.setRawMode(true);
    this.readline.pause();
  
    return new Promise(resolve => {
      process.stdin.once('data', data => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        // this.readline.clearLine();
        this.readline.resume();
  
        resolve(String(data));
      });
      process.stdin.resume();
    });
  }

  private completer(line: string) {
    const token = line.split(/[\s]+/).pop();
    const completions = [...this.f.dict.words(), ...COMMANDS.map(c => c[0])];
    const hits = completions.filter(c => c.startsWith(token));
    return [hits.length ? hits : completions, line];
  }
}

