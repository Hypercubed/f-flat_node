import {Stack} from '../';
import repl from 'repl';
import util from 'util';

const initialPrompt = 'f♭>';

let f = new Stack();

const f_eval = (function (f) {
  var buffer = '';

  return (code, context, filename, callback) => {
    code = buffer + code
      .replace(/^\(([\s\S]*)\n\)$/m, '$1')
      .replace('[\s]', ' ')
      .replace('({', '{')
      .replace('})', '}')
      .trim();

    if (code[code.length - 1] === '\\') {
      buffer = code.slice(0, -1) + '\n';
    } else {
      buffer = '';
      f.eval(code);
      callback(null, f.stack);
    }
  };
})(f);

const inspectOptions = { showHidden: false, depth: null, colors: true };

console.log('** Welcome to f♭ **\n');

const stackRepl = repl.start({
  prompt: initialPrompt + ' ',
  eval: f_eval,
  writer: (stack) => {
    const depth = '>'.repeat(f.getDepth());
    stackRepl.setPrompt(initialPrompt + depth + ' ');

    return util.inspect(stack, inspectOptions) + '\n';
  },
  ignoreUndefined: true,
  useColors: true,
  useGlobal: false
})
.on('reset', (context) => {
  f = new Stack('"Welcome to f♭" println');
});
