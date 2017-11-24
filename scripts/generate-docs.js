const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const extract = require('parse-comments');

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
  const md = process(comments);
  write(md, file.replace('ts', 'md'));
}).join('\n');

function process(comments) {
  return comments.map(c => c.comment.content).join('\n');
}

function read(fp) {
  fp = join(__dirname, '/../src/core/', fp);
  console.log('Reading', fp);
  return readFileSync(fp, 'utf8');
}

function write(data, fp) {
  fp = join(__dirname, '/../docs/api/', fp);
  console.log('Writing', fp);
  return writeFileSync(fp, data, 'utf8');
}