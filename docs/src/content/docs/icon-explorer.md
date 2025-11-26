---
title: Icon Explorer
description: Browse an icon collection and copy CLI commands.
---

import IconGrid from '../../components/IconGrid.astro';

# Icon Explorer

Browse multiple collections. Use search to fuzzy match substrings; optional filters restrict to starts/ends-with your query. Click Copy to get the CLI command.

<IconGrid collections={["lucide","tabler","solar","mdi"]} defaultCollection="lucide" limit={250} />

## Tips

- Combine search + starts-with for prefix scoping (e.g. `alert`).
- Switch collections to compare naming patterns.
- Output command copies in format: `relaxicons add <collection>:<icon>`.
