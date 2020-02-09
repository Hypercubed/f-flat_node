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
