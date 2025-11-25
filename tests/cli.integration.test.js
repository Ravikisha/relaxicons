const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
// Integration tests spawn a separate process; use offline fixtures instead of network.

function runCLI(args, cwd) {
  return spawnSync('node', [path.join(__dirname, '..', 'bin', 'index.js'), ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, RELAXICONS_OFFLINE: '1' }
  });
}

describe('CLI integration', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rlx-cli-'));
  });
  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  test('init creates config & directory', () => {
    const res = runCLI(['init'], tmpDir);
    expect(res.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'icon.config.json'))).toBe(true);
  });

  test('add writes component and barrel (react)', async () => {
    // prepare config
    fs.writeFileSync(path.join(tmpDir, 'icon.config.json'), JSON.stringify({ framework: 'react', iconPath: 'icons', typescript: false }));
    const res = runCLI(['add', 'lucide:home'], tmpDir);
    expect(res.status).toBe(0);
    const files = fs.readdirSync(path.join(tmpDir, 'icons'));
    expect(files.some(f => /HomeIcon\.jsx$/.test(f))).toBe(true);
    const barrel = fs.readFileSync(path.join(tmpDir, 'icons', 'index.js'), 'utf8');
    expect(barrel).toMatch(/export \* from '\.\/HomeIcon'/);
  });

  test('list prints icons', () => {
    const res = runCLI(['list', 'lucide'], tmpDir);
    expect(res.stdout).toMatch(/home/);
    expect(res.stdout).toMatch(/star/);
    expect(res.stdout).toMatch(/bell/);
    expect(res.stdout).toMatch(/Total: 3/);
  });
});
