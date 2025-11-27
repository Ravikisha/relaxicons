const { webComponentTemplate } = require('../src/templates/webc');

describe('webComponentTemplate', () => {
  test('generates custom element class and defines it', () => {
    const svg = { attrs: { viewBox: '0 0 10 10' }, children: '<path d="M0" />' };
    const code = webComponentTemplate('lucide:bell', svg);
    expect(code).toMatch(/extends HTMLElement/);
    expect(code).toMatch(/customElements\.define/);
  });
});
