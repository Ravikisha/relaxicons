const fetch = require('node-fetch');
const { getJSONWithCache } = require('../utils/cache');

/**
 * Fetch icon collection metadata from Iconify.
 * Returns list of icon names.
 * @param {string} collection
 */
async function fetchCollection(collection) {
  // Offline fixture mode used by tests & integration to avoid network flakiness.
  // Offline fixture mode for integration tests
  if (process.env.RELAXICONS_OFFLINE === '1') {
    if (collection === 'lucide') return ['home', 'star', 'bell'];
    throw new Error(`Collection not found: ${collection}`);
  }
  // Iconify offers https://api.iconify.design/collection?prefix=<prefix>
  const detailUrl = `https://api.iconify.design/collection?prefix=${encodeURIComponent(collection)}`;
  const json = await getJSONWithCache({ url: detailUrl, key: `collection-${collection}.json` });
  if (json.icons && typeof json.icons === 'object') {
    return Object.keys(json.icons);
  }
  return Array.isArray(json.icons) ? json.icons : [];
}

/** Simple fuzzy match scoring */
function suggestIcons(name, icons, limit = 5) {
  const scored = icons.map(icon => {
    const score = similarity(name, icon);
    return { icon, score };
  }).sort((a,b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.icon);
}

function similarity(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  if (a === b) return 1;
  let match = 0;
  for (const ch of a) if (b.includes(ch)) match++;
  return match / Math.max(a.length, b.length);
}

module.exports = { fetchCollection, suggestIcons };
