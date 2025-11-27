const { toPascalCase } = require("../utils/naming");

function angularTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + "Icon";
  const selector =
    "icon-" + baseName.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  const attrString = Object.entries(svg.attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return (
    `import { Component, Input } from '@angular/core';\n\n@Component({\n  selector: '${selector}',\n  standalone: true,\n  template: ` +
    "`<svg " +
    attrString +
    " [attr.width]=\"size\" [attr.height]=\"size\" [attr.fill]=\"color\" [attr.stroke-width]=\"strokeWidth\" [attr.class]=\"className\">" +
    svg.children.replace(/`/g, "\`") +
    "</svg>`" +
    `\n})\nexport class ${componentName} {\n  @Input() size: string | number = '1em';\n  @Input() color: string = 'currentColor';\n  @Input() strokeWidth?: number | string;\n  @Input() className?: string;\n}\n`
  );
}

module.exports = { angularTemplate };
