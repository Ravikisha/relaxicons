const { laravelTemplate } = require('../src/templates/laravel');

describe('laravelTemplate', () => {
	test('generates blade with comment and attributes', () => {
		const svg = { attrs: { viewBox: '0 0 10 10', fill: 'currentColor' }, children: '<path d="M0" />' };
		const code = laravelTemplate('lucide:home', svg);
		expect(code).toMatch(/HomeIcon/);
		expect(code).toMatch(/<svg/);
		expect(code).toMatch(/\{\{ \$attributes \}\}/);
	});
});

