const { toPascalCase } = require("../utils/naming");

// Convert kebab-case attributes to camelCase for JSX, plus special cases
function jsxAttrName(name) {
  if (name === "class") return "className";
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function svgAttrsToJsx(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${jsxAttrName(k)}="${v}"`)
    .join(" ");
}

/**
 * Generate React component code with standardized props.
 * @param {string} iconName raw id (e.g., lucide:home)
 * @param {{attrs:Object, children:string}} svg processed svg
 * @param {{ typescript?: boolean }=} options controls TS typings
 */
function reactTemplate(iconName, svg, options = {}) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + "Icon";
  const attrString = svgAttrsToJsx(svg.attrs);
  const tsInterface = options.typescript
    ? `export type IconProps = { size?: string | number; color?: string; strokeWidth?: number | string; className?: string } & React.SVGProps<SVGSVGElement>;\n`
    : '';
  const fnSig = options.typescript
    ? `({ size = '1em', color = 'currentColor', strokeWidth, className = '', ...props }: IconProps)`
    : `({ size = '1em', color = 'currentColor', strokeWidth, className = '', ...props })`;
  return `import React from 'react';\n\n${tsInterface}export function ${componentName}${fnSig} {\n  return (\n    <svg ${attrString} width={size} height={size} fill={color} strokeWidth={strokeWidth} className={className} {...props}>\n      ${svg.children}\n    </svg>\n  );\n}\n\nexport default ${componentName};\n`;
}

module.exports = { reactTemplate };
