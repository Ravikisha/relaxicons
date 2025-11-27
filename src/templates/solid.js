const { toPascalCase } = require('../utils/naming');

function solidTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + 'Icon';
  const attrString = Object.entries(svg.attrs).map(([k,v]) => `${k}="${v}"`).join(' ');
  return `import { splitProps } from 'solid-js';\nexport function ${componentName}(allProps) {\n  const [props, rest] = splitProps(allProps, ['size','color','strokeWidth','class']);\n  const size = props.size || '1em';\n  const color = props.color || 'currentColor';\n  return (<svg ${attrString} width={size} height={size} fill={color} stroke-width={props.strokeWidth} class={props.class} {...rest}>${svg.children}</svg>);\n}\nexport default ${componentName};\n`;
}

module.exports = { solidTemplate };
