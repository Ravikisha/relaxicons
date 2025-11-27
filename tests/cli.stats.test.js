const { spawnSync } = require('child_process');
const path = require('path');

function run(args = []) {
  const bin = path.join(__dirname, '..', 'bin', 'index.js');
  return spawnSync('node', [bin, ...args], { encoding: 'utf8' });
}

describe('CLI stats', () => {
  it('counts icons for a specific collection (json)', () => {
    const res = run(['stats', '-c', 'lucide', '--json']);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/"name":\s*"lucide"/);
    expect(res.stdout).toMatch(/"count"/);
  });
});