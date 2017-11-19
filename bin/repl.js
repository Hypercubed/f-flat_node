#!/usr/bin/env node

require = require('@std/esm')(module);
module.exports = require('./repl.mjs').default;
