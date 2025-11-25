const { toPascalCase } = require('../utils/naming');

// Convert kebab-case attributes to camelCase for JSX, plus special cases
function jsxAttrName(name) {
  if (name === 'class') return 'className';
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function svgAttrsToJsx(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${jsxAttrName(k)}="${v}"`)
    .join(' ');
}

/**
 * Generate React component code.
 * @param {string} iconName raw id (e.g., lucide:home)
 * @param {{attrs:Object, children:string}} svg processed svg
 */
function reactTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + 'Icon';
  const attrString = svgAttrsToJsx(svg.attrs);
  return `import React from 'react';\n\nexport function ${componentName}(props) {\n  return (\n    <svg ${attrString} {...props}>\n      ${svg.children}\n    </svg>\n  );\n}\n\nexport default ${componentName};\n`;
}

module.exports = { reactTemplate };
