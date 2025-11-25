const { fetchCollection, suggestIcons } = require('../src/api/fetchCollection');
const fetch = require('node-fetch');
jest.mock('node-fetch');

function mockJson(status, json) {
  return { status, ok: status >= 200 && status < 300, statusText: 'X', json: async () => json };
}

describe('fetchCollection', () => {
  test('returns icons array from API', async () => {
  fetch.mockResolvedValueOnce(mockJson(200, { icons: { home: {}, star: {}, bell: {} } }));
  const icons = await fetchCollection('lucide');
  expect(icons).toEqual(['home','star','bell']);
  });

  test('throws on 404', async () => {
    fetch.mockResolvedValueOnce(mockJson(404, {}));
    await expect(fetchCollection('bad')).rejects.toThrow(/Collection not found/);
  });
});

describe('suggestIcons', () => {
  test('returns top similar icons', () => {
    const icons = ['home', 'house', 'hover', 'bell'];
    const suggestions = suggestIcons('hme', icons, 3);
    expect(suggestions.length).toBe(3);
    expect(suggestions).toContain('home');
  });
});
