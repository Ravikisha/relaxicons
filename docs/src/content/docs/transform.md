---
title: Transform Pipeline
description: How SVGs are normalized before generation.
---

# Transform Pipeline

Relaxicons fetches raw SVG, then processes it to make theme-friendly components.

## Steps
1. Remove `width` and `height` attributes to allow flexible sizing.
2. Ensure `fill="currentColor"` or `stroke="currentColor"` is applied for color inheritance.
3. Strip extraneous `data-` attributes that don't affect rendering.
4. Preserve `viewBox` for scaling.
Optional: If `optimizeSvg` is enabled in config and `svgo` is installed, the raw SVG is optimized with SVGO before transformation. Provide an object to pass custom SVGO options.

## Result Structure
Internal representation:

```js
{
  attrs: { viewBox: '0 0 24 24', fill: 'none' },
  children: '<path ... />'
}
```

This gets fed into the specific framework template.

## Customization
You can modify transform logic in `src/utils/transformSvg.js`.

## Testing
Jest tests (`tests/transformSvg.test.js`) assert attribute normalization.
