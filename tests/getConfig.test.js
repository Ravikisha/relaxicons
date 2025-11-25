const fs = require('fs');
const path = require('path');
const getConfig = require('../src/utils/getConfig');

function withTemp(cb) {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rlx-cfg-'));
  try { cb(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

describe('getConfig', () => {
  test('throws NO_CONFIG when file absent', () => {
    withTemp((dir) => {
      expect(() => getConfig(dir)).toThrow(/icon.config.json/);
      try { getConfig(dir); } catch (e) { expect(e.code).toBe('NO_CONFIG'); }
    });
  });

  test('reads and parses JSON file', () => {
    withTemp((dir) => {
      const file = path.join(dir, 'icon.config.json');
      fs.writeFileSync(file, JSON.stringify({ framework: 'react', iconPath: 'icons', typescript: true }));
      const cfg = getConfig(dir);
      expect(cfg.framework).toBe('react');
      expect(cfg.iconPath).toBe('icons');
      expect(cfg.typescript).toBe(true);
    });
  });

  test('throws BAD_CONFIG on invalid JSON', () => {
    withTemp((dir) => {
      const file = path.join(dir, 'icon.config.json');
      fs.writeFileSync(file, '{ bad json');
      try { getConfig(dir); } catch (e) { expect(e.code).toBe('BAD_CONFIG'); }
    });
  });
});
