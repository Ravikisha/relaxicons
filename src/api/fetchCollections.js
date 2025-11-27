const fetch = require('node-fetch');
const { getJSONWithCache } = require('../utils/cache');

/**
 * Fetch list of available collection prefixes from Iconify.
 * Returns array of prefix strings.
 */
async function fetchCollections({ fields } = {}) {
  if (process.env.RELAXICONS_OFFLINE === '1') {
    if (fields && (fields.includes('title') || fields.includes('count'))) {
      return [{ name: 'lucide', title: 'Lucide', count: 3 }];
    }
    return ['lucide'];
  }
  const url = 'https://api.iconify.design/collections';
  const json = await getJSONWithCache({ url, key: 'collections.json' });
  const prefixes = Object.keys(json);
  if (!fields || fields.length === 0 || (fields.length === 1 && fields[0] === 'name')) return prefixes;
  const set = new Set(fields);
  const ret = prefixes.map((p) => {
    const meta = json[p] || {};
    const o = { name: p };
    if (set.has('title')) o.title = meta.name || p;
  if (set.has('count')) o.count = (typeof meta.total === 'number' ? meta.total : meta.totalIcons);
    return o;
  });
  return ret;
}

module.exports = { fetchCollections };
