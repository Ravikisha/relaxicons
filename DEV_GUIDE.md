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
src/utils/detectFramework.js # Heuristic framework detection
src/utils/getConfig.js # Load icon.config.json
src/templates/        # Framework-specific generators
tests/                # Jest test suites
```

## Data Flow (add command)
1. Parse `iconId` (collection:name)
2. Load config (`icon.config.json`)
3. Fetch raw SVG (`fetchIcon`)
4. Transform SVG (`transformSvg`) => `{ attrs, children }`
5. Select template based on framework
6. Generate code & format (Prettier)
7. Write file & update barrel export

## Adding a New Framework
1. Create `src/templates/<framework>.js` exporting a generator function that returns string code.
2. Update the switch in `bin/index.js` add command to map new framework id.
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

### Mocking Network
`node-fetch` is mocked in related tests by `jest.mock('node-fetch')` and returning custom objects with `status`, `ok`, and `text()` / `json()` methods.

### Error Codes / Handling
Errors set `process.exitCode` in CLI; tests assert on exit status returned by `spawnSync`. Consider adding explicit exit codes for more conditions if needed.

## Formatting
Prettier is applied conditionally on generated code. Parser chosen by extension:
- `.tsx` / `.ts` => `typescript`
- `.jsx` / `.js` => `babel`
- `.vue` => `vue`
- `.php` => `php`

## Potential Improvements
- Local caching for fetched icons
- Config validation schema
- Windows path edge case tests
- E2E snapshot tests for generated components
- Virtualized icon explorer in docs (already partly implemented)

## Release Checklist
- Update version in `package.json`
- Ensure README badges correct
- Run coverage ensure thresholds acceptable
- `npm publish --access public` (if scoped)

## Contributing
Open PRs with tests; avoid breaking generated API. Add new templates with documentation.
