const fs = require('fs');
const path = require('path');
const getConfig = require('../src/utils/getConfig');

test('getConfig migrates outDir to iconPath and accepts minimal config', () => {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rlx-cfg-'));
  const file = path.join(tmp, 'relaxicons.config.json');
  fs.writeFileSync(file, JSON.stringify({ framework: 'react', outDir: 'icons', typescript: false }));
  const cfg = getConfig(tmp);
  expect(cfg.iconPath).toBe('icons');
});
