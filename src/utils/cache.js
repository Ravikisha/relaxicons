const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');

function cacheDir() {
  return process.env.RELAXICONS_CACHE_DIR || path.join(os.homedir(), '.cache', 'relaxicons');
}

function keyToPath(key) {
  const safe = key.replace(/[^a-z0-9._-]/gi, '_');
  return path.join(cacheDir(), safe + '.json');
}

async function ensureDir() {
  await fs.ensureDir(cacheDir());
}

async function readCache(key) {
  const file = keyToPath(key);
  if (!(await fs.pathExists(file))) return null;
  try {
    const json = JSON.parse(await fs.readFile(file, 'utf8'));
    return json;
  } catch { return null; }
}

async function writeCache(key, data) {
  await ensureDir();
  const file = keyToPath(key);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

function isFresh(ts, ttlMs) {
  return Date.now() - ts < ttlMs;
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  let attempt = 0; let lastErr;
  const delays = [250, 500, 1000];
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, delays[Math.min(attempt, delays.length - 1)]));
      attempt++;
    }
  }
  throw lastErr;
}

async function getJSONWithCache({ url, key, ttlMs = 24 * 60 * 60 * 1000 }) {
  await ensureDir();
  const cached = await readCache(key);
  // Offline mode or fresh cache
  if (process.env.RELAXICONS_OFFLINE === '1') {
    if (cached && cached.data) return cached.data;
    throw new Error('Offline and cache miss for ' + key);
  }

  const headers = { 'User-Agent': 'relaxicons-cli/1.0' };
  if (cached && cached.etag) headers['If-None-Match'] = cached.etag;
  // If fresh and no etag, short circuit
  if (cached && !cached.etag && isFresh(cached.ts || 0, ttlMs)) {
    return cached.data;
  }

  try {
    const res = await fetchWithRetry(url, { headers });
    if (res.status === 304 && cached) {
      // Update timestamp
      await writeCache(key, { ...cached, ts: Date.now() });
      return cached.data;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const etag = res && res.headers && typeof res.headers.get === 'function'
      ? (res.headers.get('etag') || null)
      : (res && res.headers && res.headers.etag) || null;
    const json = await res.json();
    await writeCache(key, { ts: Date.now(), etag, data: json });
    return json;
  } catch (e) {
    // Fallback to stale cache if exists
    if (cached && cached.data) return cached.data;
    throw e;
  }
}

module.exports = {
  cacheDir,
  getJSONWithCache,
  readCache,
  writeCache,
  isFresh,
};
