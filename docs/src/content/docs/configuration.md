---
title: Configuration
description: Tweak Relaxicons behavior via relaxicons.config.json.
---

# Configuration

`relaxicons.config.json` controls generation output.

Example:

```jsonc
{
  "framework": "react",
  "outDir": "src/components/icons",
  "typescript": true,
  "collection": "lucide",
  "templatesDir": "./relaxicons-templates",
  "optimizeSvg": true
}
```

Fields:
- `framework`: `react` | `vue` | `angular` | `laravel` | `svelte` | `solid` | `webc` | `next` | `next-rsc` (template chosen).
- `outDir`: Relative path for component files.
- `typescript`: Generate `.tsx` / `.ts` for React/Angular.
- `collection`: Default icon collection for suggestions & `list`.
- `templatesDir`: Optional custom templates directory. Files named by framework id, extension `.hbs` | `.ejs` | `.js`.
- `optimizeSvg`: `true`/`false` or SVGO options object. Requires `svgo` installed.

## Detection
If `framework` is omitted, Relaxicons attempts to detect:
- Next.js: React
- `angular.json`: Angular
- `artisan` file: Laravel
- `vite.config.*`: Inspect dependencies to guess React/Vue

## Overriding per-command
Use `--framework` with `add` to override temporarily.

```bash
relaxicons add lucide:smile --framework vue
```

## Moving Output
If you change `outDir`, existing icons are not moved automatically. Manually move or regenerate with `--force`.

## Validation Errors
Relaxicons throws coded errors. Invalid config prints a clear message and exit code `2`.
