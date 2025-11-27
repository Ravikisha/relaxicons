const fs = require('fs-extra');

async function removeLineFromFile(filePath, predicate) {
  if (!(await fs.pathExists(filePath))) return false;
  const text = await fs.readFile(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const kept = lines.filter((l) => !predicate(l));
  if (kept.length !== lines.length) {
    await fs.writeFile(filePath, kept.join('\n'), 'utf8');
    return true;
  }
  return false;
}

module.exports = { removeLineFromFile };
