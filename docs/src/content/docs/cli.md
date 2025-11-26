---
title: CLI Reference
description: Full list of Relaxicons commands and options.
---

# CLI Reference

## Commands

### init
Create a new `icon.config.json` interactively.

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
- `--force`: Overwrite an existing icon file.

### list
List icons from a collection.

```bash
relaxicons list --filter lucide
```

Options:
- `--filter <collection>`: Collection prefix (e.g. `lucide`).

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

### Batch add (shell expansion)
```bash
for icon in home star bell; do relaxicons add lucide:$icon; done
```

### Listing with grep
```bash
relaxicons list --filter lucide | grep clock
```

## Example Commands Cheatsheet

| Task | Command |
|------|---------|
| Init config | `relaxicons init` |
| Add React icon | `relaxicons add lucide:home` |
| Add Vue icon | `relaxicons add lucide:home --framework vue` |
| Raw SVG | `relaxicons add lucide:home --raw` |
| Force overwrite | `relaxicons add lucide:home --force` |
| List collection | `relaxicons list --filter lucide` |
| Suggest similar | `relaxicons add lucide:hoem` |
