const { toPascalCase } = require("../utils/naming");

function vueTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + "Icon";
  // Attributes remain kebab-case in Vue template
  const attrString = Object.entries(svg.attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<template>\n  <svg ${attrString} :width="$attrs.size || '1em'" :height="$attrs.size || '1em'" :fill="$attrs.color || 'currentColor'" :stroke-width="$attrs.strokeWidth" :class="$attrs.class || $attrs.className" v-bind="$attrs">\n    ${svg.children}\n  </svg>\n</template>\n\n<script>\nexport default {\n  name: '${componentName}'\n};\n</script>\n`;
}

module.exports = { vueTemplate };
