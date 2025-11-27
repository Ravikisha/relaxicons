const { svelteTemplate } = require('../src/templates/svelte');

describe('svelteTemplate', () => {
  test('generates Svelte component with exported props', () => {
    const svg = { attrs: { viewBox: '0 0 10 10' }, children: '<path d="M0" />' };
    const code = svelteTemplate('lucide:home', svg);
    expect(code).toMatch(/export let size/);
    expect(code).toMatch(/<svg/);
  });
});
