const fs = require('fs');
const path = require('path');

module.exports = function getConfig(cwd = process.cwd()) {
  const file = path.join(cwd, 'icon.config.json');
  if (!fs.existsSync(file)) {
    const err = new Error('Configuration file icon.config.json not found. Run "relaxicons init" first.');
    err.code = 'NO_CONFIG';
    throw err;
  }
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    return json;
  } catch (e) {
    const err = new Error('Failed to read icon.config.json: ' + e.message);
    err.code = 'BAD_CONFIG';
    throw err;
  }
};
