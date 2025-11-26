const { fetchIcon } = require('../src/api/fetchIcon');
const { fetchCollection } = require('../src/api/fetchCollection');

// Ensure tests run with offline fixture mode
beforeAll(() => {
  process.env.RELAXICONS_OFFLINE = '1';
});

afterAll(() => {
  delete process.env.RELAXICONS_OFFLINE;
});

describe('offline fixture mode', () => {
  test('fetchIcon returns fixture svg', async () => {
    const svg = await fetchIcon('lucide:home');
    expect(svg).toMatch(/<svg/);
  });

  test('fetchIcon throws for unknown icon', async () => {
    await expect(fetchIcon('lucide:unknown')).rejects.toThrow(/Icon not found/);
  });

  test('fetchCollection returns fixture list', async () => {
    const list = await fetchCollection('lucide');
    expect(list).toEqual(['home','star','bell']);
  });

  test('fetchCollection throws for bad collection', async () => {
    await expect(fetchCollection('bad')).rejects.toThrow(/Collection not found/);
  });
});
