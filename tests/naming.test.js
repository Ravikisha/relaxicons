const { toPascalCase, toKebabCase } = require('../src/utils/naming');

describe('naming utils', () => {
  test('toPascalCase converts kebab/underscore', () => {
    expect(toPascalCase('arrow-right')).toBe('ArrowRight');
    expect(toPascalCase('arrow_right')).toBe('ArrowRight');
    expect(toPascalCase('multi-part-name')).toBe('MultiPartName');
  });
  test('toKebabCase converts Pascal/mixed', () => {
    expect(toKebabCase('ArrowRight')).toBe('arrow-right');
    expect(toKebabCase('MultiPartName')).toBe('multi-part-name');
    expect(toKebabCase('already-kebab')).toBe('already-kebab');
    expect(toKebabCase('SomeXMLParser')).toBe('some-xml-parser');
    expect(toKebabCase('some--THING__Else')).toBe('some-thing-else');
  });

  test('round trip Pascal -> kebab -> Pascal', () => {
    const original = 'AnotherIconName';
    const kebab = toKebabCase(original);
    expect(kebab).toBe('another-icon-name');
    expect(toPascalCase(kebab)).toBe('AnotherIconName');
  });
});
