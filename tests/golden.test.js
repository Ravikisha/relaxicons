const { reactTemplate } = require('../src/templates/react');
const { vueTemplate } = require('../src/templates/vue');

describe('golden outputs', () => {
  const svg = { attrs: { viewBox: '0 0 24 24' }, children: '<path d="M0" />' };
  test('react golden includes width/height props and export', () => {
    const code = reactTemplate('lucide:gold', svg, { typescript: false });
    expect(code).toMatch(/export function GoldIcon/);
    expect(code).toMatch(/width=\{size\} height=\{size\}/);
  });
  test('vue golden includes name and template', () => {
    const code = vueTemplate('lucide:gold', svg);
    expect(code).toMatch(/name: 'GoldIcon'/);
    expect(code).toMatch(/<template>/);
  });
});
