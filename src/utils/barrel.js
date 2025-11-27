const fs = require('fs-extra');

async function ensureSortedBarrel(filePath) {
  if (!(await fs.pathExists(filePath))) return;
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines.filter(l => l.trim().startsWith('//'));
  const exportsOnly = lines.filter(l => !l.trim().startsWith('//'));
  exportsOnly.sort((a, b) => a.localeCompare(b));
  const next = (header.length ? header.join('\n') + '\n' : '') + exportsOnly.join('\n') + '\n';
  if (next !== content) await fs.writeFile(filePath, next, 'utf8');
}

module.exports = { ensureSortedBarrel };
