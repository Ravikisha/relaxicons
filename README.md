# Relaxicons

<p align="center">
  <img src="./logo.png" alt="Relaxicons logo" width="160" />
</p>

> Fetch any Iconify icon and generate ready-to-use components for React, Vue, Angular, Laravel, Svelte, Solid, Web Components, and Next.js RSC-safe React.

<div align="center">

[![npm version](https://img.shields.io/npm/v/relaxicons.svg?style=flat&color=blue)](https://www.npmjs.com/package/relaxicons)
[![Docs](https://img.shields.io/badge/docs-online-purple.svg)](https://ravikisha.github.io/relaxicons)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](#license)
[![Node](https://img.shields.io/badge/node-%3E=18.0.0-forest.svg)](https://nodejs.org)

</div>

## Features
- Fetch icons by `collection:name`
- Fuzzy suggestions if an icon name is off by a few characters
- Transform SVG for theming (remove width/height, apply `currentColor`)
- Multi-framework templates (React, Vue, Angular, Laravel Blade, Svelte, Solid, Web Components, Next RSC)
- Raw SVG output option
- Autodetects your framework (Next, Vite React/Vue, Angular, Laravel)
- Barrel export auto-maintenance (alphabetically sorted)
- Pretty formatting via Prettier
 - Optional SVGO optimization
 - Icon Explorer: Favorites & Recent tabs, keyboard shortcuts (arrows + Enter), export selection, copy variants (CMD/SVG/DATA), per-collection stats and a top-icons carousel
 - CLI additions: `stats`, `cache-clear`, improved `doctor`

## Documentation
Full docs & guides: https://ravikisha.github.io/relaxicons

## Install
```bash
npm install -g relaxicons
```

Install framework runtime (choose what you use):

```bash
# React / Next.js
npm i react react-dom
npm i next   # optional if using Next.js

# Vue
npm i vue

# Angular
npm i @angular/core

# Svelte
npm i svelte

# Solid
npm i solid-js

# Web Components
# no additional runtime required
```

Check version:
```bash
relaxicons --version
```

## Quick Start
```bash
relaxicons init           # detects framework & creates relaxicons.config.json
relaxicons add lucide:home # generates HomeIcon component
```

## Configuration (`relaxicons.config.json`)
```jsonc
{
  "framework": "react",      // react | next | next-rsc | vue | angular | laravel | svelte | solid | webc | unknown
  "iconPath": "src/components/icons",
  "typescript": true,         // enable TS output where applicable
  "templatesDir": "./relaxicons-templates", // optional custom templates
  "optimizeSvg": true,
  "generatedAt": "2025-11-25T00:00:00.000Z"
}
```
Regenerate with `--force`:
```bash
relaxicons init --force
```

Validation: a JSON Schema (`relaxicons.config.schema.json`) is included; migrate older configs with `relaxicons migrate-config`.

## Commands
| Command | Description |
|---------|-------------|
| `relaxicons init` | Create config interactively |
| `relaxicons add <collection:name>` | Fetch & generate component |
| `relaxicons collections` | List available collection prefixes |
| `relaxicons icons <collection>` | List icon names from collection |
| `relaxicons search <query>` | Search icons across collections (use --collection to scope) |
| `relaxicons remove <collection:name>` | Remove generated icon and update barrel |
| `relaxicons doctor` | Validate environment and config |
| `relaxicons update-cache` | Refresh local cache (collections and icons) |
| `relaxicons list <collection>` | Deprecated alias for `icons` |
| `relaxicons migrate-config` | Update config to latest schema |
| `relaxicons regenerate -m <manifest>` | CI helper to regenerate icons |

### Options
| Flag | Purpose |
|------|---------|
| `--framework <fw>` | Override configured framework for single add |
| `--raw` | Output optimized SVG file only |
| `--both` | Generate both component and cleaned SVG side-by-side |
| `--force` | Overwrite existing file or config |
| `--filter <text>` | Filter items when listing/searching |
| `--limit <n>` | Limit number printed (default 50) |
| `--json` | JSON output (collections/icons) |
| `--fields <list>` | For collections: choose fields (name,title,count) |
| `--from <file>` | Add icons from a file (newline or comma separated) |
| `--no-svgo` | Disable SVGO optimization |
| `--quiet` | Suppress non-essential output |
| `--no-color` | Disable colored output |
| `--dry-run` | Print actions without writing files |

### Examples
```bash
relaxicons add lucide:alarm-clock
relaxicons add lucide:alarm-clock --framework vue
relaxicons add lucide:alarm-clock --framework svelte
relaxicons add lucide:alarm-clock --framework solid
relaxicons add lucide:alarm-clock --framework webc
relaxicons add lucide:alarm-clock --framework next-rsc
relaxicons add lucide:alarm-clock --raw
relaxicons add lucide:alarm-clock --both
relaxicons icons lucide --filter clock
relaxicons icons lucide --json --limit 10
relaxicons collections --filter luc
relaxicons collections --fields name,title,count --json
relaxicons update-cache
relaxicons search arrow --collection lucide
relaxicons add lucide:home,star,bell
relaxicons add --from icons.txt
relaxicons remove lucide:home
relaxicons doctor
relaxicons stats -c lucide --json
relaxicons search arrow --json --limit 50
relaxicons cache-clear
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
Exports are kept sorted alphabetically.

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
| `relaxicons.config.json not found` | Run `relaxicons init` first |
| Duplicate file warning | Use `--force` to overwrite |
| Invalid icon id format | Use `collection:name` like `lucide:home` |
| Network errors | Verify collection/icon exists on Iconify |
| Rate limits | CLI retries and falls back to cache |
| Stale data | Run `relaxicons update-cache` or clear `~/.cache/relaxicons` |
| Offline | Set `RELAXICONS_OFFLINE=1` (requires warm cache) |

## Development
See [DEV_GUIDE.md](./DEV_GUIDE.md) for architecture & contributing.
Run tests:
```bash
npm test
npm run coverage
```

## CI Automation
Use the `regenerate` command in CI with a manifest of icon IDs:

```bash
relaxicons regenerate -m relaxicons.manifest
```

An example GitHub Action is provided in `.github/workflows/relaxicons-regenerate.yml`.

## Deprecations
`list` is deprecated and will be removed in v2.0. Use `icons <collection>` instead.

## License
ISC © 2025 Relaxicons Contributors
