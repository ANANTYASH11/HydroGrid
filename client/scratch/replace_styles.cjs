const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('client/src');
let filesChanged = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Background replacements
  content = content.replace(/background:\s*['"]#08090F['"]/g, 'background: "var(--bg-card)"');
  content = content.replace(/backgroundColor:\s*['"]#08090F['"]/g, 'backgroundColor: "var(--bg-card)"');
  
  content = content.replace(/background:\s*['"]#0A0B12['"]/g, 'background: "var(--bg-elevated)"');
  content = content.replace(/background:\s*['"]#0D0F16['"]/g, 'background: "var(--bg-elevated)"');
  content = content.replace(/background:\s*['"]#1a1a1c['"]/g, 'background: "var(--bg-elevated)"');
  content = content.replace(/background:\s*['"]#060609['"]/g, 'background: "var(--bg-elevated)"');
  content = content.replace(/background:\s*['"]#07070C['"]/g, 'background: "var(--bg-base)"');
  content = content.replace(/background:\s*['"]#050508['"]/g, 'background: "var(--bg-base)"');

  // Border and Color replacements
  content = content.replace(/borderColor:\s*['"]rgba\(255,255,255,0\.04\)['"]/g, 'borderColor: "var(--border-sub)"');
  content = content.replace(/borderColor:\s*['"]rgba\(255,255,255,0\.05\)['"]/g, 'borderColor: "var(--border-sub)"');
  content = content.replace(/borderColor:\s*['"]rgba\(255,255,255,0\.06\)['"]/g, 'borderColor: "var(--border-sub)"');
  content = content.replace(/border:\s*['"]1px solid rgba\(255,255,255,0\.06\)['"]/g, 'border: "1px solid var(--border-sub)"');
  content = content.replace(/borderTop:\s*['"]1px solid rgba\(255,255,255,0\.06\)['"]/g, 'borderTop: "1px solid var(--border-sub)"');
  content = content.replace(/borderBottom:\s*['"]1px solid rgba\(255,255,255,0\.06\)['"]/g, 'borderBottom: "1px solid var(--border-sub)"');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    filesChanged++;
  }
}

console.log(`Finished. Updated ${filesChanged} files.`);
