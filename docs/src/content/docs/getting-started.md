---
title: Getting Started
description: Install and initialize Relaxicons.
---

# Getting Started

## Install

```bash
npm install -g relaxicons
```

Install your app framework if needed:

```bash
# React / Next.js
npm i react react-dom
npm i next   # optional, for Next.js

# Vue
npm i vue

# Angular
npm i @angular/core

# Svelte
npm i svelte

# Solid
npm i solid-js

# Web Components
# no extra install required
```

## Initialize Config

Run the init command to create `relaxicons.config.json`.

```bash
relaxicons init
```

You'll be prompted for:
- Framework (auto-detected suggestions)
- Output directory for generated components
- TypeScript preference

Resulting minimal config:

```jsonc
{
  "framework": "react",
  "outDir": "src/components/icons",
  "typescript": true
}
```

## Add Your First Icon

```bash
relaxicons add lucide:home
```

This will:
1. Fetch raw SVG from Iconify.
2. Transform attributes (remove width/height, set fill/stroke to currentColor).
3. Generate a React component file (e.g. `HomeIcon.tsx`).
4. Append export to barrel index.

## Listing & Suggestions

List icons in a collection and narrow with a filter:

```bash
relaxicons icons lucide --filter home
relaxicons collections --filter luc
```

If you mistype an icon name, Relaxicons shows close suggestions.

## Next

Dive into the [CLI Reference](/cli/) or explore the [Icon Explorer](/icon-explorer/).
