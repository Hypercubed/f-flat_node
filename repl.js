import {Stack} from './src/stack';
import repl from 'repl';
import util from 'util';
import winston from 'winston';

winston.level = process.env.NODE_ENV;

var f = new Stack('"Welcome to f♭" println');

repl.start({
  prompt: 'f♭> ',
  eval: (code, context, filename, callback) => {
    code = code
      .replace(/^\(([\s\S]*)\n\)$/m, '$1')
      .replace('({', '{')
      .replace('})', '}');

    f.eval(code);
    callback(null, f.stack);
  },
  writer: (stack) => {
    console.log(util.inspect(stack, { showHidden: false, depth: null, colors: true }));
    return '';
  },
  terminal: true,
  useColors: true,
  useGlobal: false
});
