const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/style=\{\{[^}]*(?:background|backgroundColor):[^}]*\}\}/g);
      if (matches) {
        results.push({ file, matches });
      }
    }
  });
  return results;
}

console.dir(walk('client/src'), { depth: null });
