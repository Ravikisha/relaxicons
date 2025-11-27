const { normalizePath } = require('../src/utils/paths');
const path = require('path');

test('normalizePath converts OS separator to forward slash', () => {
  const p = ['one','two','three'].join(path.sep);
  const n = normalizePath(p);
  expect(n).toBe('one/two/three');
});
