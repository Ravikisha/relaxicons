# Relaxicons Developer Guide

## Overview
Relaxicons is a Node.js CLI that fetches SVG icons from Iconify, normalizes them, and outputs framework-specific components (React, Vue, Angular, Laravel) or raw SVGs.

## Code Structure
```
bin/index.js          # CLI commands (init, add, list)
src/api/fetchIcon.js  # Fetch single icon SVG
src/api/fetchCollection.js # Fetch collection metadata + suggestions
src/utils/transformSvg.js  # SVG normalization pipeline
src/utils/naming.js   # Naming utilities
src/utils/cache.js    # ETag/TTL caching and retry/backoff
src/utils/detectFramework.js # Heuristic framework detection
src/utils/getConfig.js # Load relaxicons.config.json
src/templates/        # Framework-specific generators
tests/                # Jest test suites
```

Additional utilities:
```
src/utils/renderTemplate.js  # Custom templates loader (.hbs/.ejs/.js) from templatesDir
src/utils/optimizeSvg.js     # Optional SVGO optimization before transform
src/utils/barrel.js          # Keep barrel exports sorted alphabetically
```

Additional templates:
```
src/templates/svelte.js      # Svelte component generator
src/templates/solid.js       # SolidJS component generator
src/templates/webc.js        # Web Components (custom element) generator
src/templates/react-rsc.js   # React RSC-friendly component generator
```

## Data Flow (add command)
1. Parse `iconId` (collection:name)
2. Load config (`relaxicons.config.json`)
3. Detect framework (heuristics in `detectFramework`) unless overridden via `--framework`
4. Fetch raw SVG (`fetchIcon`)
5. Transform SVG (`transformSvg`) => `{ attrs, children }`
6. Select template based on framework
7. Generate code & format (Prettier)
8. Write file & update barrel export
9. If `--both` provided, also write cleaned SVG alongside the component

## Adding a New Framework
1. Create `src/templates/<framework>.js` exporting a generator function that returns string code.
2. Update the switch in `bin/index.js` add command to map new framework id and extend `detectFramework` if needed.
3. Add tests for template output.
4. Document usage in README.

## Testing
Run all tests:
```bash
npm test
```
With coverage:
```bash
npm run coverage
```

Types of tests:
- Unit: utilities (`naming`, `transformSvg`, `detectFramework`, `getConfig`, `fetchIcon`, `fetchCollection`)
- Integration: CLI commands (init/add/list) using temp directories and mocked network requests.
	- Includes search, batch add, remove, doctor, update-cache, and listing fields.

### Mocking Network
`node-fetch` is mocked in unit tests. Integration tests use `RELAXICONS_OFFLINE=1` to exercise offline fixtures without network.

### Error Codes / Handling
Errors set `process.exitCode` in CLI; tests assert on exit status returned by `spawnSync`. Consider adding explicit exit codes for more conditions if needed.

## Formatting
Prettier is applied conditionally on generated code. Parser chosen by extension:
- `.tsx` / `.ts` => `typescript`
- `.jsx` / `.js` => `babel`
- `.vue` => `vue`
- `.php` => `php`

## Caching Architecture
- Location: `~/.cache/relaxicons` (override with `RELAXICONS_CACHE_DIR`).
- Storage: JSON payloads with `{ ts, etag, data }` envelope.
- Freshness: TTL-based; If-None-Match with ETag for revalidation.
- Retry: Exponential backoff on transient errors.
- Offline: `RELAXICONS_OFFLINE=1` uses cache only; cache miss throws.
- Priming: `relaxicons update-cache` iterates collections and warms icon lists.

## Potential Improvements
- Config validation schema
- Windows path edge case tests
- E2E snapshot tests for generated components
- Virtualized icon explorer in docs (already implemented)
- Snapshot tests for `--both` outputs
- More autodetection markers (e.g., Nuxt, Remix)

## Docs Components Overview
- `IconGrid.astro`: Icon Explorer UI. Client-side; multi-select collections; Favorites & Recent tabs (localStorage keys: `relaxicons:favorites`, `relaxicons:recent`, cache as `relaxicons:cache:<prefix>`); keyboard navigation (arrows + Enter); export selection; copy variants (CMD/SVG/DATA); per-collection stats and a top-icons carousel.
- `CollectionsList.astro`: Live list of Iconify collections.
- `CompareCollections.astro`: Client-side comparator to diff two prefixes (unique/common icons).

## CLI Additions
- `stats`: Count icons per collection or for a specific collection (`-c`).
- `cache-clear`: Placeholder; CLI doesn’t persist cache yet.
- `doctor --verbose`: Environment/config diagnostics and a network check.

## Release Checklist
- Update version in `package.json`
- Ensure README badges correct
- Run coverage ensure thresholds acceptable
- `npm publish --access public` (if scoped)

## Contributing
Open PRs with tests; avoid breaking generated API. Add new templates with documentation.
