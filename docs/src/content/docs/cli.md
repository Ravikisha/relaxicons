---
title: CLI Reference
description: Full list of Relaxicons commands and options.
---

# CLI Reference

## Commands

### init
Create a new `relaxicons.config.json` interactively.

```bash
relaxicons init
```

Options:
- `--framework <name>`: Skip prompt and set framework.
- `--force`: Overwrite existing config.

### add <icon-id>
Fetch an Iconify icon and generate a component.

```bash
relaxicons add lucide:alarm-clock
```

Options:
- `--framework <name>`: Override config framework for this icon.
- `--raw`: Output raw optimized SVG (no component wrapping).
- `--both`: Also write cleaned SVG alongside component.
- `--force`: Overwrite an existing icon file.
- `--from <file>`: Read multiple icons from a file.
 - `--no-svgo`: Disable SVGO optimization (if installed).

### collections
List available icon collection prefixes.

```bash
relaxicons collections
relaxicons collections --filter luc
relaxicons collections --json --limit 20
```

Options:
- `--filter <text>`: Filter collection prefixes.
- `--limit <n>`: Limit number printed.
- `--json`: Output JSON array.
- `--fields <list>`: Choose fields (name,title,count).

### icons <collection>
List icons within a collection.

```bash
relaxicons icons lucide
relaxicons icons lucide --filter home
relaxicons icons lucide --json --limit 10
```

Options:
- `--filter <text>`: Filter icon names.
- `--limit <n>`: Limit number printed (default 50).
- `--json`: Output JSON array.

### list <collection> (deprecated alias)
Alias for `icons <collection>`; deprecated and will be removed in v2.0. Use `icons`.

### search <query>
Search icons across all collections, or scope to one.

```bash
relaxicons search arrow
relaxicons search home --collection lucide
relaxicons search star --json --limit 20
```

Options:
- `--collection <prefix>`: Limit to a collection.
- `--limit <n>`: Maximum results to print.
- `--json`: Output JSON.
Note: Results are fetched using cached collection metadata when available.

### remove <icon-id>
Remove a generated icon file and update barrel exports.

```bash
relaxicons remove lucide:home
```

### doctor
Validate config, environment, and API reachability.

```bash
relaxicons doctor
```

### completion [shell]
### update-cache
Refresh local cache for collections and icons to improve offline and faster lookup.

```bash
relaxicons update-cache
```

Caching
The CLI caches Iconify metadata under `~/.cache/relaxicons` (configurable via `RELAXICONS_CACHE_DIR`). Cache uses ETag and TTL; stale cache is used on network failures. Set `RELAXICONS_OFFLINE=1` to force offline mode (errors on cache miss).

Output a basic completion script you can source in your shell.

```bash
relaxicons completion zsh
```

## Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Unhandled error |
| 2 | Config missing or invalid |
| 3 | Icon fetch failed |
| 4 | Duplicate without --force |

## Suggestions
If an icon isn't found, similar names (Levenshtein-lite character overlap) are displayed.

Example:

```bash
relaxicons add lucide:alrm-clock
# => Icon not found. Did you mean: alarm-clock, alarm-check, alarm-off ?
```

## Component Naming
Icon IDs like `alarm-clock` become `AlarmClockIcon` via PascalCase + `Icon` suffix.

## Barrel Export
A barrel `index.ts` (or `.js`) is updated automatically with new exports on each `add`.

## Environment
Works with Node 18+.

## Advanced Usage

### Framework-specific installs
# Troubleshooting

- Caching: If collections or icons seem stale, run `relaxicons update-cache` or delete `~/.cache/relaxicons`.
- Rate limits: The CLI retries and uses cache on failures; try again later or use `RELAXICONS_OFFLINE=1` when cache is warm.
- Offline mode: Set `RELAXICONS_OFFLINE=1` to use cache only (errors on cache miss).

Install the framework runtime in your app if not already present:

```bash
# React / Next.js
npm i react react-dom
npm i next   # if using Next.js

# Vue
npm i vue

# Angular
npm i @angular/core

# Svelte
npm i svelte

# Solid
npm i solid-js

# Web Components
# No framework dependency required
```

### Force overwrite
```bash
relaxicons add lucide:home --force
```
Replaces existing component file and re-appends export (duplicate lines cleaned).

### Raw SVG output
```bash
relaxicons add lucide:star --raw
```
Writes `star.svg` transformed (dimensions stripped, `currentColor` applied) inside `outDir`.

### Temporary framework override
```bash
relaxicons add lucide:bolt --framework vue
```
Generates a Vue SFC even if config framework is React.

Supported values: `react`, `next`, `next-rsc`, `vue`, `angular`, `laravel`, `svelte`, `solid`, `webc`.

### Batch add (shell expansion)
```bash
for icon in home star bell; do relaxicons add lucide:$icon; done
```

### Listing and searching with grep
```bash
relaxicons icons lucide | grep clock
relaxicons search clock | grep lucide
```

## Example Commands Cheatsheet

| Task | Command |
|------|---------|
| Init config | `relaxicons init` |
| Add React icon | `relaxicons add lucide:home` |
| Add Vue icon | `relaxicons add lucide:home --framework vue` |
| Raw SVG | `relaxicons add lucide:home --raw` |
| Force overwrite | `relaxicons add lucide:home --force` |
| List collection icons | `relaxicons icons lucide` |
| List collections | `relaxicons collections` |
| Search icons | `relaxicons search arrow` |
| JSON icons list | `relaxicons icons lucide --json` |
| JSON collections list | `relaxicons collections --json` |
| Remove icon | `relaxicons remove lucide:home` |
| Doctor | `relaxicons doctor` |
| Suggest similar | `relaxicons add lucide:hoem` |
