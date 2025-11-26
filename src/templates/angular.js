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
    `import { Component } from '@angular/core';\n\n@Component({\n  selector: '${selector}',\n  standalone: true,\n  template: \
` +
    "`<svg " +
    attrString +
    '><span style="display:none"></span>' +
    svg.children.replace(/`/g, "\`") +
    "</svg>`" +
    `\n})\nexport class ${componentName} {}\n`
  );
}

module.exports = { angularTemplate };
