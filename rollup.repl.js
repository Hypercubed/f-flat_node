import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default {
  entry: 'bin/repl.js',
  plugins: [
    json(),
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread'],
      exclude: ['node_modules/**']
    })
  ],
  format: 'umd',
  banner: '#!/usr/bin/env node'
};
