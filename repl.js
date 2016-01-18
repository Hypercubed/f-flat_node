import {Stack} from './src/stack';
import repl from 'repl';

var f = new Stack('"Welcome to f♭" print');

repl.start({
  prompt: 'f♭> ',
  eval: (code) => {
    code = code
      .replace(/^\(([\s\S]*)\n\)$/m, '$1')
      .replace('({', '{')
      .replace('})', '}');

    // console.log('Input: ', code);

    f.eval(code);
    console.log(f.stack);
  }
});
