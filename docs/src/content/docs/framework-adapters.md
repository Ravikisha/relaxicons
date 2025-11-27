---
title: Framework Adapters
description: How Relaxicons renders icons for each framework.
---

# Framework Adapters

Relaxicons generates idiomatic components for different ecosystems.

## React (Vite / Next.js / RSC)
- Functional component using JSX/TSX.
- Standard props: `size`, `color`, `strokeWidth`, `className` with defaults.
- RSC-safe variant available via `--framework next-rsc`.
- Named export: `HomeIcon`.

## Vue
- Single File Component `<template>`.
- Binds `$attrs` and maps `size`, `color`, `strokeWidth`, `class`/`className`.

## Angular
- Standalone component with `@Component` decorator.
- `@Input()` properties: `size`, `color`, `strokeWidth`, `className`.
- Selector derived from kebab-case id: `icon-home`.

## Laravel (Blade)
- Blade file with PHP variables for attributes.
- Include via `@include('icons.home')`.

## Svelte
- `.svelte` component with exported props `size`, `color`, `strokeWidth`, `className`.

## Solid
- JSX component; props include `size`, `color`, `strokeWidth`, `class` and are split/spread via `splitProps`.

## Web Components
- Custom element with Shadow DOM. Attributes: `size`, `color`, `stroke-width`, `class`.

## Raw SVG
Use `--raw` to write optimized SVG instead of a component wrapper.

```bash
relaxicons add lucide:home --raw
```

## Attribute Normalization
The transformer removes explicit width/height and sets fill/stroke to `currentColor` for easy theming.

## Extensibility
Custom templates: set `templatesDir` in `relaxicons.config.json` to point to your template directory. Supported engines: `.hbs` (Handlebars), `.ejs` (EJS), or `.js` (module exporting a function(context) => string). Files are resolved by framework id, e.g. `react.hbs`, `vue.ejs`, `angular.js`, `webc.hbs`.
