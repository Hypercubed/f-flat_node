const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const extract = require('parse-comments');

const SOURCE_PATH = '/../src/core/';
const TARGET_PATH = '/../docs/api/';
const LINK_PATH = 'https://github.com/Hypercubed/f-flat_node/blob/master/src/core/';

const files = [
  'core.ts',
  'base.ts',
  'dict.ts',
  'math.ts',
  'node.ts',
  'objects.ts',
  'types.ts',
  'experimental.ts'
];

const md = files.map(file => {
  const str = read(file);
  const comments = extract(str);
  const md = process(file, comments);
  write(md, file.replace('.ts', '.md'));
}).join('\n');

function process(file, comments) {
  const lp = join(LINK_PATH, file);
  return comments
    .map(c => {
      const link = `<div style="text-align: right"><a href="${lp}#L${c.context.begin}">[src]</a></div>`;
      return `${c.comment.content}${link}\n`;
    })
    .join('\n');
}

function read(fp) {
  fp = join(__dirname, SOURCE_PATH, fp);
  console.log('Reading', fp);
  return readFileSync(fp, 'utf8');
}

function write(data, fp) {
  fp = join(__dirname, TARGET_PATH, fp);
  console.log('Writing', fp);
  return writeFileSync(fp, data, 'utf8');
}

/* function emu(source) {
  const BLOCK = '/**';
  const BLOCK_END = '* /'
  const LINE = '///';

  return require('literalizer').lex(source)  /// * Parses stdin JavaScript
    .filter(function (x) {
      
      if (x.type !== 1) {
        return false;
      }
      x.type = x.val.slice(0, 3);
      if (x.type === BLOCK && x.val.slice(-BLOCK_END.length) === BLOCK_END) {  /// * Extract block comments with double asterisks
        return true;
      }
      if (x.type === LINE) { /// * Extract line comments with triple forward slash
        return true;
      }
      return false;
    })
    .map(function (c) {
      var value;
      var prefix;
      var r;
      var result;

      if (c.type === BLOCK) {
        value = c.val.slice(BLOCK.length, -BLOCK_END.length).replace(/\s+$/, '');
        r = /(\n[\s\*]+)/g;

        while (result = r.exec(value)) {  // eslint-disable-line no-cond-assign
          if (prefix === undefined || result[1].length < prefix.length) {
            prefix = result[1];
          }
        }

        return value
          .split(prefix)
          .join('\n')
          .replace(/\n[ \*]+/g, '\n')
          .replace(/^\n+/g, '') + '\n';  /// * Trims out the prefixed whitespace
      }

      value = c.val.slice(4).replace(/\s+$/, '');
      return value.split(prefix).join('').replace(/^\n+/, '');
    })
    .join('\n');   /// * Prints the results to stdout
}; */