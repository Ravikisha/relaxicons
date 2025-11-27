---
title: Troubleshooting
description: Common issues and solutions for Relaxicons CLI and docs.
---

# Troubleshooting

Common issues and solutions.

## Live collections list not loading

- Symptom: The "All Collections" page shows an error or remains empty.
- Cause: Network error, offline mode, or API rate limits.
- Fixes:
	- Check connectivity and retry.
	- Use the CLI fallback: `relaxicons collections --limit 50` or `--json`.
	- If building the docs locally, run `npm run preview` inside `docs/` and open the served URL (some browsers block file:// fetches).

## Rate limit or fetch failures

- Use `relaxicons update-cache` to prefill caches when online.
- The CLI caches Iconify responses with ETag/TTL; if requests fail, try again after a short wait.

## Offline usage

- Set `RELAXICONS_OFFLINE=1` to use stubbed fixtures in tests and limited commands.
- In offline mode, `collections` returns a small fixed set and `icons` may be limited.

## Config validation (Ajv)

- Validation is optional. If Ajv isn't installed, Relaxicons will skip JSON Schema validation.
- To enable validation explicitly, install Ajv in your project and run commands again.

## Windows or path issues

- Paths are normalized internally; if you still see issues, prefer forward slashes in `iconPath`.
- Ensure Node 18+ and correct permissions in your project directories.

## Prettier formatting skipped

- If Prettier isn't installed or a parser is unavailable, generation continues without formatting.
- You can format later with your editor or a project-level Prettier.

