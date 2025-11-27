/**
 * Minimal API wrapper for Iconify endpoints with basic rate-limit handling.
 * JSDoc types for clarity.
 */

/**
 * @typedef {Object} IconifyCollection
 * @property {Object.<string,any>} icons
 * @property {string[]} [uncategorized]
 * @property {Object.<string,string[]>} [categories]
 */

const BASE = 'https://api.iconify.design';

/**
 * Fetch with simple retry/backoff on 429/5xx.
 * @param {string} url
 * @param {number} [retries]
 * @returns {Promise<Response>}
 */
async function fetchRetry(url, retries = 3) {
  let attempt = 0;
  let delay = 300; // ms
  while (true) {
    const res = await fetch(url);
    if (!res.ok && (res.status === 429 || res.status >= 500) && attempt < retries) {
      await new Promise(r => setTimeout(r, delay));
      attempt += 1;
      delay *= 2;
      continue;
    }
    return res;
  }
}

/**
 * Get all collection prefixes.
 * @returns {Promise<string[]>}
 */
async function getCollections() {
  const res = await fetchRetry(`${BASE}/collections`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  const data = await res.json();
  return Object.keys(data);
}

/**
 * Get collection details.
 * @param {string} prefix
 * @returns {Promise<IconifyCollection>}
 */
async function getCollection(prefix) {
  const res = await fetchRetry(`${BASE}/collection?prefix=${prefix}`);
  if (!res.ok) throw new Error('Failed to fetch collection');
  return res.json();
}

/**
 * List icon names from a collection (uncategorized or flattened categories).
 * @param {string} prefix
 * @returns {Promise<string[]>}
 */
async function listIcons(prefix) {
  const data = await getCollection(prefix);
  let names = data.uncategorized || Object.keys(data.icons || {});
  if (!names.length && data.categories) names = Object.values(data.categories).flat();
  return names;
}

/**
 * Fetch raw SVG for icon.
 * @param {string} prefix
 * @param {string} name
 * @returns {Promise<string|null>}
 */
async function getSvg(prefix, name) {
  const res = await fetchRetry(`${BASE}/${prefix}/${name}.svg`);
  if (!res.ok) return null;
  return res.text();
}

module.exports = {
  getCollections,
  getCollection,
  listIcons,
  getSvg,
};
