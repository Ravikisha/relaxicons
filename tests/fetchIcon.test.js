const { fetchIcon, parseId } = require('../src/api/fetchIcon');
const fetch = require('node-fetch');
jest.mock('node-fetch');

function mockResponse(status, body) {
  return { status, ok: status >= 200 && status < 300, statusText: 'X', text: async () => body };
}

describe('fetchIcon', () => {
  test('parseId splits correctly', () => {
    expect(parseId('lucide:home')).toEqual({ collection: 'lucide', name: 'home' });
    expect(parseId('lucide/home')).toEqual({ collection: 'lucide', name: 'home' });
  });

  test('throws for invalid id', () => {
    expect(() => parseId('bad')).toThrow(/Invalid icon identifier/);
  });

  test('fetches svg', async () => {
    fetch.mockResolvedValueOnce(mockResponse(200, '<svg></svg>'));
    const svg = await fetchIcon('lucide:home');
    expect(svg).toBe('<svg></svg>');
  });

  test('throws on 404', async () => {
    fetch.mockResolvedValueOnce(mockResponse(404, 'Not found'));
    await expect(fetchIcon('lucide:missing')).rejects.toThrow(/Icon not found/);
  });

  test('throws on non-svg', async () => {
    fetch.mockResolvedValueOnce(mockResponse(200, 'html')); 
    await expect(fetchIcon('lucide:home')).rejects.toThrow(/not an SVG/);
  });
});
