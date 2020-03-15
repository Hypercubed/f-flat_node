#!/usr/bin/env node

import * as readline from 'readline';
import * as program from 'commander';
import * as gradient from 'gradient-string';
// import * as memoize from 'memoizee';
import * as process from 'process';
import * as chalk from 'chalk';
import * as fixedWidthString from 'fixed-width-string';
import * as MuteStream from 'mute-stream';

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

const PROMPT = 'F♭';

// Writers, use `.echo` to cycle through writers
const WRITERS = {
  pretty: (_: StackEnv) => ffPrettyPrint.color(_.stack) + '\n',
  literal: (_: StackEnv) => ffPrettyPrint.literal(_.stack) + '\n',
  silent: (_: StackEnv) => '',
};

const MAX_UNDO = 20;

export function newStack(rl?: readline.ReadLine): StackEnv {
  log.level = program.logLevel || 'warn';

  const newParent = createRootEnv();

  if (!program.quiet) {
    console.log(WELCOME);
  }

  if (rl) {
    this.f.defineAction('prompt', () => {
      return new Promise(resolve => {
        rl.question('', resolve);
      });
    });
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
  private redoStack = [];
  private autoundo = undefined;
  private currentWriter = WRITERS.pretty;
  private bindings = [];
  private tracing = false;
  private started = false;
  private mutableStdin: MuteStream;
  private mutableStdout: MuteStream;

  constructor() {
    this.mutableStdin = new MuteStream();
    this.mutableStdout = new MuteStream();

    const terminal = !!process.stdin.setRawMode;

    this.readline = readline.createInterface({
      prompt: '',
      input: this.mutableStdin,
      output: this.mutableStdout,
      terminal,
      completer: this.completer.bind(this)
    });
  }

  start(f: StackEnv) {
    if (this.started) {
      throw new Error('Instance already started');
    }
    this.f = f || newStack(this.readline);

    if (process.stdin.setRawMode) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.pipe(this.mutableStdin);
    this.mutableStdout.pipe(process.stdout);

    this.prompt();

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
      if (key.ctrl) {
        switch (key.name) {
          case 'e':
            if (this.editorMode) {
              this.turnOffEditorMode();
            } else {
              this.turnOnEditorMode();
            }
            return;
        }
      }
    });
  }

  suspend() {
    this.mutableStdin.mute();
    this.mutableStdout.mute();
    process.stdin.unpipe(this.mutableStdin);
  }

  resume() {
    this.mutableStdin.unmute();
    this.mutableStdout.unmute();

    process.stdin.pipe(this.mutableStdin);
    process.stdout.write('\r\n');
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

    this.undoStack = [...this.undoStack.slice(-MAX_UNDO + 1), this.f.stateSnapshot()];
    this.redoStack = [];

    this.readline.pause();
    this.f.next(this.buffer)
      .catch((err: Error) => {
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
        this.f = newStack(this.readline);
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
      case 'redo':
        this.redo();
        this.prompt();
        return true;
      case 'echo':
        const entries = Object.entries(WRITERS);
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
      case 'trace':
        this.tracing = !this.tracing;
        console.log(`Tracing ${this.tracing ? 'on' : 'off'}...\n`);
        this.prompt();
        return true;
    }
    return false;
  }

  private turnOnEditorMode() {
    this.editorMode = true;
    this.readline.setPrompt('');
    this.readline.write('\n');
    console.log('Entering editor mode (^E to finish, ^C to cancel)');
  }
  
  private turnOffEditorMode() {
    this.editorMode = false;
    this.readline.write('\n');
  }

  private prompt(print = true) {
    print && console.log(this.currentWriter(this.f));
    if (this.editorMode) {
      this.readline.setPrompt('');
    } else {
      let prompt = PROMPT;
      prompt += this.f.depth < 1 ? '> ' : `${' '.repeat(this.f.depth - 1)}| `;
      this.readline.setPrompt(prompt);
    }
    this.readline.prompt();
  }

  private async errorPrompt() {
    this.suspend();

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

    this.resume();
    return data;
  }

  private undo() {
    const state = this.undoStack.pop();
    this.redoStack.push(this.f.stateSnapshot());
    Object.assign(this.f, state);
  }

  private redo() {
    const state = this.redoStack.pop();
    this.undoStack.push(this.f.stateSnapshot());
    Object.assign(this.f, state);
  }

  private addBeforeHooks() {
    while (this.bindings.length > 0) {
      this.bindings.pop().detach();
    }
  
    let qMax = this.f.stack.length + this.f.queue.length;

    if (this.tracing) {
      const trace = () => console.log(ffPrettyPrint.formatTrace(this.f));

      this.bindings.push(this.f.before.add(trace));
      this.bindings.push(this.f.beforeEach.add(trace));
      this.bindings.push(this.f.idle.add(trace));
    } else if (!this.f.silent) {
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

      this.bindings.push(this.f.before.add(updateBar));
      this.bindings.push(this.f.beforeEach.add(updateBar));
      this.bindings.push(this.f.idle.add(() => bar.terminate()));
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
    const completions = [...COMMANDS.map(c => c[0]), ...this.f.dict.words()];
    const hits = completions.filter(c => c.startsWith(token));
    return [hits.length ? hits : completions, token];
  }
}

