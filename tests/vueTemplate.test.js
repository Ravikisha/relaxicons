const { vueTemplate } = require('../src/templates/vue');

describe('vueTemplate', () => {
	test('generates SFC with name and kebab-case attributes', () => {
		const svg = { attrs: { viewBox: '0 0 10 10', 'stroke-width': '2' }, children: '<path d="M0" />' };
		const code = vueTemplate('lucide:home', svg);
		expect(code).toMatch(/name: 'HomeIcon'/);
		expect(code).toMatch(/stroke-width="2"/);
		expect(code).toMatch(/<template>/);
	});
});

