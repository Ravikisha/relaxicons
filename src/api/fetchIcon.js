const fetch = require('node-fetch');

/**
 * Parse an identifier like "lucide:home" into { collection, name }.
 * Accepts forms with slash or colon: "lucide/home" or "lucide:home".
 */
function parseId(id) {
  if (typeof id !== 'string') throw new Error('Icon id must be a string');
  const parts = id.includes(':') ? id.split(':') : id.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid icon identifier. Use collection:name (e.g. lucide:home)');
  }
  return { collection: parts[0], name: parts[1] };
}

/**
 * Fetch raw SVG from Iconify API.
 * @param {string} id collection:name
 * @returns {Promise<string>} raw SVG string
 */
async function fetchIcon(id) {
  // Offline fixture mode used by tests & integration to avoid network flakiness.
  // Offline fixture mode for integration tests
  if (process.env.RELAXICONS_OFFLINE === '1') {
    const { collection, name } = parseId(id);
    if (collection === 'lucide' && name === 'home') {
      return '<svg viewBox="0 0 10 10"><path d="M0"/></svg>';
    }
    throw new Error(`Icon not found: ${collection}:${name}`);
  }
  const { collection, name } = parseId(id);
  const url = `https://api.iconify.design/${encodeURIComponent(collection)}/${encodeURIComponent(name)}.svg`;
  const res = await fetch(url, { headers: { 'User-Agent': 'relaxicons-cli/1.0' } });
  if (res.status === 404) {
    throw new Error(`Icon not found: ${collection}:${name}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch icon (${res.status} ${res.statusText})`);
  }
  const svg = await res.text();
  if (!svg.startsWith('<svg')) {
    throw new Error('Unexpected response: not an SVG');
  }
  return svg;
}

module.exports = { fetchIcon, parseId };
