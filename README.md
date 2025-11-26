# Relaxicons

<p align="center">
  <img src="./logo.png" alt="Relaxicons logo" width="160" />
</p>

> Fetch any Iconify icon and generate ready-to-use components for React, Vue, Angular, and Laravel.

<div align="center">

[![npm version](https://img.shields.io/npm/v/relaxicons.svg?style=flat&color=blue)](https://www.npmjs.com/package/relaxicons)
[![CI](https://github.com/relaxicons/relaxicons/actions/workflows/ci.yml/badge.svg)](https://github.com/relaxicons/relaxicons/actions)
[![Codecov](https://codecov.io/gh/relaxicons/relaxicons/branch/main/graph/badge.svg)](https://codecov.io/gh/relaxicons/relaxicons)
[![Docs](https://img.shields.io/badge/docs-online-purple.svg)](https://relaxicons.github.io/relaxicons)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](#license)
[![Node](https://img.shields.io/badge/node-%3E=18.0.0-forest.svg)](https://nodejs.org)

</div>

## Features
- Fetch icons by `collection:name`
- Fuzzy suggestions if an icon name is off by a few characters
- Transform SVG for theming (remove width/height, apply `currentColor`)
- Multi-framework templates (React, Vue, Angular, Laravel Blade)
- Raw SVG output option
- Barrel export auto-maintenance
- Pretty formatting via Prettier

## Documentation
Full docs & guides: https://relaxicons.github.io/relaxicons

## Install
```bash
npm install -g relaxicons
```

Check version:
```bash
relaxicons --version
```

## Quick Start
```bash
relaxicons init           # detects framework & creates icon.config.json
relaxicons add lucide:home # generates HomeIcon component
```

## Configuration (`icon.config.json`)
```jsonc
{
  "framework": "react",      // react | vue | angular | laravel | unknown
  "iconPath": "src/components/icons",
  "typescript": true,         // enable TS output where applicable
  "generatedAt": "2025-11-25T00:00:00.000Z"
}
```
Regenerate with `--force`:
```bash
relaxicons init --force
```

## Commands
| Command | Description |
|---------|-------------|
| `relaxicons init` | Create config interactively |
| `relaxicons add <collection:name>` | Fetch & generate component |
| `relaxicons list <collection>` | List icon names from collection |

### Options
| Flag | Purpose |
|------|---------|
| `--framework <fw>` | Override configured framework for single add |
| `--raw` | Output optimized SVG file only |
| `--force` | Overwrite existing file or config |
| `--filter <text>` | Filter icons when listing |

### Examples
```bash
relaxicons add lucide:alarm-clock
relaxicons add lucide:alarm-clock --framework vue
relaxicons add lucide:alarm-clock --raw
relaxicons list lucide --filter clock
```

### Suggestions
If an icon isn't found you get a hint:
```
Icon not found
Did you mean: alarm-clock, alarm-check, alarm-off?
```

## Generated Files
React example:
```tsx
export function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="..." />
    </svg>
  );
}
```
Barrel export auto-appends:
```js
export * from './HomeIcon';
```

## Raw Mode
```bash
relaxicons add lucide:home --raw # writes home.svg
```

## Angular Example
```ts
@Component({
  selector: 'icon-home',
  standalone: true,
  template: `<svg viewBox="0 0 24 24"><path d="..."/></svg>`
})
export class HomeIcon {}
```

## Laravel Blade Example
```php
<?php /* HomeIcon */ ?>
<svg viewBox="0 0 24 24" {{ $attributes }}>
  <path d="..." />
</svg>
```

## Troubleshooting
| Issue | Fix |
|-------|-----|
| `icon.config.json not found` | Run `relaxicons init` first |
| Duplicate file warning | Use `--force` to overwrite |
| Invalid icon id format | Use `collection:name` like `lucide:home` |
| Network errors | Verify collection/icon exists on Iconify |

## Development
See [DEV_GUIDE.md](./DEV_GUIDE.md) for architecture & contributing.
Run tests:
```bash
npm test
npm run coverage
```

## Roadmap
- Local caching layer
- More frameworks (Svelte, Solid)
- Batch add command
- JSON manifest output for generated icons

## License
ISC © 2025 Relaxicons Contributors
