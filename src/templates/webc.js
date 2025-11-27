const { toPascalCase } = require('../utils/naming');

function webComponentTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const className = toPascalCase(baseName) + 'Icon';
  const tag = 'icon-' + baseName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  const attrString = Object.entries(svg.attrs).map(([k,v]) => `${k}="${v}"`).join(' ');
  const tpl = `<svg ${attrString}>${svg.children}</svg>`;
    const tplEsc = tpl.replace(/'/g, "\\'");
    return `export class ${className} extends HTMLElement {\n  static tag = '${tag}';\n  static get observedAttributes() { return ['size','color','stroke-width','class']; }\n  constructor() { super(); this.attachShadow({ mode: 'open' }); }\n  connectedCallback() { this.render(); }\n  attributeChangedCallback() { this.render(); }\n  render() {\n    const size = this.getAttribute('size') || '1em';\n    const color = this.getAttribute('color') || 'currentColor';\n    const strokeWidth = this.getAttribute('stroke-width') || '';\n    const className = this.getAttribute('class') || '';\n    const svg = '${tplEsc}';\n    const injected = svg.replace('<svg', '<svg width="' + size + '" height="' + size + '" fill="' + color + '" stroke-width="' + strokeWidth + '" class="' + className + '"');\n    this.shadowRoot.innerHTML = injected;\n  }\n}\ncustomElements.define(${className}.tag, ${className});\n`;
}

module.exports = { webComponentTemplate };
