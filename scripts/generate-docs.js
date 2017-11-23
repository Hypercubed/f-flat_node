const fs = require('fs');
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
  return process(comments);
}).join('\n');

write(md);

function process(comments) {
  return comments.map(c => c.comment.content).join('\n');
}

function read(fp) {
  return fs.readFileSync(__dirname + '/../src/core/' + fp, 'utf8');
}

function write(data, fp = 'api.md') {
  return fs.writeFileSync(__dirname + '/../docs/' + fp, data, 'utf8');
}