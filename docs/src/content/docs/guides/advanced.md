---
title: "Advanced: Custom Templates & CI"
description: Build your own templates and automate regeneration in CI.
---

# Advanced: Custom Templates & CI

## Custom Templates

Set `templatesDir` in `relaxicons.config.json` to a folder that contains files named by framework id:

- `react.hbs`, `vue.ejs`, `angular.js`, `svelte.hbs`, `solid.js`, `webc.js`, `next-rsc.hbs`

Supported engines:
- Handlebars (`.hbs`), EJS (`.ejs`), or JS module exporting `function(context): string`.

Context fields available:
- `iconId`, `baseName`, `pascal`, `kebab`, `svg: { attrs, children }`, `typescript`.

Tip: Use `svg.attrs` to preserve `viewBox` and map attributes your way.

## SVGO Optimization

Enable `optimizeSvg` in config to run SVGO before transformation. Provide an object to pass options. Disable per-run with `--no-svgo`.

## CI Automation

Use `relaxicons regenerate -m relaxicons.manifest` in CI to refresh generated icons. A GitHub Action example is included at `.github/workflows/relaxicons-regenerate.yml`.

Manifest formats:
- Newline-separated list of `collection:name`
- JSON array `["lucide:home", "lucide:star"]`

Best Practices:
- Pin Node 18+ in CI
- Warm cache with `relaxicons update-cache` for faster runs
- Commit generated changes as part of your pipeline

## Monorepo & Multi-package Generation

Add a top-level `relaxicons.config.json` and discover per-package settings by running the CLI in each package. If you document a `packages` array in your schema, you can script generation by invoking `relaxicons regenerate` per package in a workspace script.

## JSON Schema Validation

Relaxicons can validate `relaxicons.config.json` when Ajv is available. If Ajv is not installed, validation is skipped gracefully. To enable:

- Install Ajv in your project
- Ensure your config matches `relaxicons.config.schema.json`

## Name Sanitization & Paths

Icon names are sanitized into safe PascalCase and kebab-case. If you see collisions, adjust names or use custom templates. Paths are normalized to work cross-platform.

## Performance Tips

- Use `--concurrency` with `regenerate` to speed up CI runs
- Run `update-cache` before large batches to reduce external fetches
- Disable formatting in CI if needed; Prettier is best-effort

title: "Advanced: Custom Templates & CI"
description: Build your own templates and automate regeneration in CI.
---

# Advanced: Custom Templates & CI

## Custom Templates

Set `templatesDir` in `relaxicons.config.json` to a folder that contains files named by framework id:

- `react.hbs`, `vue.ejs`, `angular.js`, `svelte.hbs`, `solid.js`, `webc.js`, `next-rsc.hbs`

Supported engines:
- Handlebars (`.hbs`), EJS (`.ejs`), or JS module exporting `function(context): string`.

Context fields available:
- `iconId`, `baseName`, `pascal`, `kebab`, `svg: { attrs, children }`, `typescript`.

Tip: Use `svg.attrs` to preserve `viewBox` and map attributes your way.

## SVGO Optimization

Enable `optimizeSvg` in config to run SVGO before transformation. Provide an object to pass options. Disable per-run with `--no-svgo`.

## CI Automation

Use `relaxicons regenerate -m relaxicons.manifest` in CI to refresh generated icons. A GitHub Action example is included at `.github/workflows/relaxicons-regenerate.yml`.

Manifest formats:
- Newline-separated list of `collection:name`
- JSON array `["lucide:home", "lucide:star"]`

Best Practices:
- Pin Node 18+ in CI
- Warm cache with `relaxicons update-cache` for faster runs
- Commit generated changes as part of your pipeline

## Monorepo & Multi-package Generation

Add a top-level `relaxicons.config.json` and discover per-package settings by running the CLI in each package. If you document a `packages` array in your schema, you can script generation by invoking `relaxicons regenerate` per package in a workspace script.

## JSON Schema Validation

Relaxicons can validate `relaxicons.config.json` when Ajv is available. If Ajv is not installed, validation is skipped gracefully. To enable:

- Install Ajv in your project
- Ensure your config matches `relaxicons.config.schema.json`

## Name Sanitization & Paths

Icon names are sanitized into safe PascalCase and kebab-case. If you see collisions, adjust names or use custom templates. Paths are normalized to work cross-platform.

## Performance Tips

- Use `--concurrency` with `regenerate` to speed up CI runs
- Run `update-cache` before large batches to reduce external fetches
- Disable formatting in CI if needed; Prettier is best-effort
