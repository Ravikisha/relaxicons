const { toPascalCase } = require("../utils/naming");

function laravelTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + "Icon";
  const attrString = Object.entries(svg.attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<?php /* ${componentName} */ ?>\n<svg ${attrString} {{ $attributes }}>\n  ${svg.children}\n</svg>\n`;
}

module.exports = { laravelTemplate };
