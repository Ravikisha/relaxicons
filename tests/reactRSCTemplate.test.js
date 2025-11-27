const { reactRSCTemplate } = require('../src/templates/react-rsc');

describe('reactRSCTemplate', () => {
  test('generates RSC-safe component with props', () => {
    const svg = { attrs: { viewBox: '0 0 10 10' }, children: '<path d="M0" />' };
    const code = reactRSCTemplate('lucide:home', svg);
    expect(code).toMatch(/export function HomeIcon/);
    expect(code).toMatch(/width=\{size\}/);
  });
});
