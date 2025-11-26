---
title: FAQ
description: Common questions about Relaxicons.
---

# FAQ

## Which Node versions are supported?
Node 18 and newer.

## Can I regenerate icons if I move folders?
Yes. Update `outDir` and run `relaxicons add <icon>` with `--force` or re-add icons.

## How do I change component naming?
Edit `src/utils/naming.js` functions.

## What if an icon is missing?
Use `relaxicons list --filter <collection>` to confirm. Suggestions appear when an id isn't found.

## Does it cache icons?
Currently fetches each time. Caching roadmap includes local `.relaxicons-cache`.

## Can I add new frameworks?
Add a new template in `src/templates/<framework>.js` and update CLI switch logic.
