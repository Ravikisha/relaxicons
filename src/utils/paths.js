const path = require('path');

function normalizePath(p) {
  return p.split(path.sep).join('/');
}

module.exports = { normalizePath };
