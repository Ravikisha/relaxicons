---
title: Framework Adapters
description: How Relaxicons renders icons for each framework.
---

# Framework Adapters

Relaxicons generates idiomatic components for different ecosystems.

## React
- Functional component using JSX/TSX.
- Props spread onto root `<svg>`.
- Named export: `HomeIcon`.

## Vue
- Single File Component template `<template>` + `<script setup>`.
- Accepts `v-bind` attributes when used.

## Angular
- Standalone component with `@Component` decorator.
- Selector derived from kebab-case id: `app-home-icon`.

## Laravel (Blade)
- Blade file with PHP variables for attributes.
- Include via `@include('icons.home')`.

## Raw SVG
Use `--raw` to write optimized SVG instead of a component wrapper.

```bash
relaxicons add lucide:home --raw
```

## Attribute Normalization
The transformer removes explicit width/height and sets fill/stroke to `currentColor` for easy theming.

## Extensibility
Custom templates can be added by editing the template files under `src/templates/`.
