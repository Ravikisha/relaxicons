const { safePascal, safeKebab } = require('../src/utils/sanitize');

test('safePascal prefixes reserved and numeric', () => {
  expect(safePascal('default')).toMatch(/^IconDefault/);
  expect(safePascal('1Home')).toMatch(/^Icon1Home/);
});

test('safeKebab strips invalid chars', () => {
  expect(safeKebab('Home@Icon')).toBe('home-icon');
});
