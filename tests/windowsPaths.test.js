const path = require('path');
const { normalizePath } = require('../src/utils/paths');

test('windows style path to posix', () => {
  const winLike = `dir${path.sep}sub${path.sep}file.ts`;
  const normalized = normalizePath(winLike);
  expect(normalized).toMatch(/dir\/sub\/file\.ts/);
});
