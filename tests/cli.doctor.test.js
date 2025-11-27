const { spawnSync } = require('child_process');
const path = require('path');

function run(args = []) {
  const bin = path.join(__dirname, '..', 'bin', 'index.js');
  return spawnSync('node', [bin, ...args], { encoding: 'utf8' });
}

describe('CLI doctor', () => {
  it('prints diagnostics', () => {
    const res = run(['doctor', '--verbose']);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Configuration loaded|No configuration/);
    expect(res.stdout).toMatch(/Network OK|Network check failed/);
  });
});