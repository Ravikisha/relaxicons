const { angularTemplate } = require('../src/templates/angular');

describe('angularTemplate', () => {
	test('generates component with selector and class', () => {
		const svg = { attrs: { viewBox: '0 0 10 10' }, children: '<path d="M0" />' };
		const code = angularTemplate('lucide:home', svg);
		expect(code).toMatch(/selector: 'icon-home'/);
		expect(code).toMatch(/export class HomeIcon/);
		expect(code).toMatch(/<svg/);
	});
});

