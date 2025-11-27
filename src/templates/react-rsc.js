const { toPascalCase } = require('../utils/naming');

function jsxAttrName(name) {
  if (name === 'class') return 'className';
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function svgAttrsToJsx(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${jsxAttrName(k)}="${v}"`)
    .join(' ');
}

function reactRSCTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + 'Icon';
  const attrString = svgAttrsToJsx(svg.attrs);
  return `export function ${componentName}({ size = '1em', color = 'currentColor', strokeWidth, className = '', ...props }) {\n  return (\n    <svg ${attrString} width={size} height={size} fill={color} strokeWidth={strokeWidth} className={className} {...props}>\n      ${svg.children}\n    </svg>\n  );\n}\nexport default ${componentName};\n`;
}

module.exports = { reactRSCTemplate };
