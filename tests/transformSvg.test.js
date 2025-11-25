const { transformSvg } = require('../src/utils/transformSvg');

describe('transformSvg', () => {
  const raw = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 10 10"><path stroke-width="2" d="M0 0h10"/></svg>';
  const rawNoStroke = '<svg viewBox="0 0 10 10"><path d="M0 0h10"/></svg>';

  test('removes width/height', () => {
    const { attrs } = transformSvg(raw);
    expect(attrs.width).toBeUndefined();
    expect(attrs.height).toBeUndefined();
    expect(attrs.viewBox).toBe('0 0 10 10');
  });

  test('adds stroke currentColor when stroke-width present without stroke', () => {
    const result = transformSvg(raw);
    expect(result.children).toMatch(/stroke="currentColor"/);
  });

  test('adds fill currentColor to path when missing', () => {
    const result = transformSvg(rawNoStroke);
    expect(result.children).toMatch(/fill="currentColor"/);
  });

  test('retains fill="none" on elements explicitly set', () => {
    const raw = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none"/><path d="M0 0h10"/></svg>';
    const result = transformSvg(raw);
    expect(result.children).toMatch(/circle[^>]*fill="none"/);
    expect(result.children).toMatch(/path[^>]*fill="currentColor"/);
  });

  test('throws if no root svg present', () => {
    expect(() => transformSvg('<div></div>')).toThrow(/No <svg> root/);
  });
});
