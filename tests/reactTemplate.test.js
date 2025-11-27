const { reactTemplate } = require('../src/templates/react');

describe('reactTemplate', () => {
	test('generates component with PascalCase name and exports', () => {
		const svg = { attrs: { viewBox: '0 0 10 10' }, children: '<path d="M0" />' };
		const code = reactTemplate('lucide:home', svg);
		expect(code).toMatch(/function HomeIcon/);
		expect(code).toMatch(/export function HomeIcon/);
		expect(code).toMatch(/export default HomeIcon/);
		const svg2 = { attrs: { viewBox: '0 0 10 10', 'stroke-width': '2' }, children: '<path d="M0" />' };
		const code2 = reactTemplate('lucide:star', svg2);
		expect(code2).toMatch(/strokeWidth="2"/);
	});
});

