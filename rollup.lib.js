import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/stack.js',
  plugins: [
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread'],
      exclude: ['node_modules/**']
    })
  ],
  format: 'cjs'
};
