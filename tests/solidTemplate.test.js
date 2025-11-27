const { solidTemplate } = require('../src/templates/solid');

describe('solidTemplate', () => {
  test('generates Solid component', () => {
    const svg = { attrs: { viewBox: '0 0 10 10' }, children: '<path d="M0" />' };
    const code = solidTemplate('lucide:star', svg);
    expect(code).toMatch(/splitProps/);
    expect(code).toMatch(/export function StarIcon/);
  });
});
