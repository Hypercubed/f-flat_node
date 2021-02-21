module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    curly: 'off',
    'space-before-function-paren': 'off',

    // Allowing groups
    'sort-imports': ['off', { allowSeparatedGroups: true }],

    // no console
    'no-console': 'error',
    'no-alert': 'error',
    'no-debugger': 'error',
  
    // conflicts with prettier
    'array-bracket-spacing': 'off',
    'max-len': 'off',

    // Replace 'no-unused-vars' rule with '@typescript-eslint' version
    'no-unused-vars': 'off',
    // Allow unused args with underscore
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Warning only
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],

    // Allow non-null-assertion
    '@typescript-eslint/no-non-null-assertion': 'off',

    // Enable these later
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-useless-escape': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-console': 'off',
    'no-alert': 'off',
    'no-debugger': 'off',
    'no-case-declarations': 'off',
    'prefer-const': 'off',
    'no-useless-catch': 'off',
    '@typescript-eslint/ban-types': 'off',
    'no-fallthrough': 'off',
    'no-self-assign': 'off',
    'no-constant-condition': 'off',
    'no-compare-neg-zero': 'off'
  }
};
