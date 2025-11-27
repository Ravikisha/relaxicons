const { fetchCollections } = require('../src/api/fetchCollections');
const fetch = require('node-fetch');
jest.mock('node-fetch');
const fs = require('fs-extra');
const path = require('path');

function mockJson(status, json) {
	return { status, ok: status >= 200 && status < 300, statusText: 'X', headers: { get: () => null }, json: async () => json };
}

describe('fetchCollections', () => {
	let oldCacheEnv;
	let tempCacheDir;
	beforeEach(() => {
		oldCacheEnv = process.env.RELAXICONS_CACHE_DIR;
		tempCacheDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rlx-cache-'));
		process.env.RELAXICONS_CACHE_DIR = tempCacheDir;
	});
	afterEach(() => {
		if (oldCacheEnv === undefined) delete process.env.RELAXICONS_CACHE_DIR; else process.env.RELAXICONS_CACHE_DIR = oldCacheEnv;
		fs.removeSync(tempCacheDir);
	});
	test('returns prefixes from API response keys', async () => {
		fetch.mockResolvedValueOnce(mockJson(200, { lucide: { name: 'Lucide' }, mdi: { name: 'Material Design Icons' } }));
		const cols = await fetchCollections();
		expect(cols).toEqual(expect.arrayContaining(['lucide','mdi']));
	});

			test('throws on failure', async () => {
				// ensure no prior cache file exists for collections.json in temp dir
				// then simulate HTTP 500
				fetch.mockResolvedValueOnce(mockJson(500, {}));
				await expect(fetchCollections()).rejects.toThrow(/HTTP 500/);
			});

		test('returns objects with fields when requested', async () => {
			fetch.mockResolvedValueOnce(mockJson(200, { lucide: { name: 'Lucide', total: 3 } }));
			const cols = await fetchCollections({ fields: ['name','title','count'] });
			expect(cols[0]).toEqual({ name: 'lucide', title: 'Lucide', count: 3 });
		});
});

