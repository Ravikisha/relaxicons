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

  test('duplicate add does not duplicate barrel export', () => {
    fs.writeFileSync(path.join(tmpDir, 'icon.config.json'), JSON.stringify({ framework: 'react', iconPath: 'icons', typescript: false }));
    let res = runCLI(['add', 'lucide:home'], tmpDir);
    expect(res.status).toBe(0);
    res = runCLI(['add', 'lucide:home'], tmpDir);
    // second run should exit with code 0 (no crash) or 0? It currently sets no exitCode but returns 0 unless error; allow 0
    expect([0,1]).toContain(res.status); // status 1 if file exists message triggers process.exitCode
    const barrelPath = path.join(tmpDir, 'icons', 'index.js');
    if (fs.existsSync(barrelPath)) {
      const barrel = fs.readFileSync(barrelPath, 'utf8');
      const occurrences = (barrel.match(/export \* from '\.\/HomeIcon'/g) || []).length;
      expect(occurrences).toBe(1);
    }
  });

  test('raw mode does not create barrel export', () => {
    fs.writeFileSync(path.join(tmpDir, 'icon.config.json'), JSON.stringify({ framework: 'react', iconPath: 'icons', typescript: false }));
    const res = runCLI(['add', 'lucide:home', '--raw'], tmpDir);
    expect(res.status).toBe(0);
    const iconDir = path.join(tmpDir, 'icons');
    const files = fs.existsSync(iconDir) ? fs.readdirSync(iconDir) : [];
    // raw file should be kebab-case svg
    expect(files.some(f => f === 'home.svg')).toBe(true);
    // no index.js barrel file
    expect(files.some(f => /index\.(js|ts)$/.test(f))).toBe(false);
  });

  test('list prints icons', () => {
    const res = runCLI(['list', 'lucide'], tmpDir);
    expect(res.stdout).toMatch(/home/);
    expect(res.stdout).toMatch(/star/);
    expect(res.stdout).toMatch(/bell/);
    expect(res.stdout).toMatch(/Total: 3/);
  });
});
