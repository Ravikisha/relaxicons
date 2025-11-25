const fs = require('fs');
const path = require('path');
const detectFramework = require('../src/utils/detectFramework');

function withTemp(cb) {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rlx-fw-'));
  try { cb(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

describe('detectFramework', () => {
  test('returns unknown when no markers', () => {
    withTemp((dir) => {
      const res = detectFramework(dir);
      expect(res.id).toBe('unknown');
    });
  });

  test('detects next.js config', () => {
    withTemp((dir) => {
      fs.writeFileSync(path.join(dir, 'next.config.js'), 'module.exports = {}');
      const res = detectFramework(dir);
      expect(res.id).toBe('next');
    });
  });

  test('detects vite + react dependency', () => {
    withTemp((dir) => {
      fs.writeFileSync(path.join(dir, 'vite.config.js'), '');
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { react: '18.0.0' } }));
      const res = detectFramework(dir);
      expect(res.id).toBe('vite-react');
    });
  });

  test('chooses highest confidence with multiple', () => {
    withTemp((dir) => {
      fs.writeFileSync(path.join(dir, 'next.config.js'), '');
      fs.writeFileSync(path.join(dir, 'vite.config.js'), '');
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { react: '18.2.0' } }));
      const res = detectFramework(dir);
      expect(res.id).toBe('next'); // Next higher confidence 0.9 vs 0.8
    });
  });
});
