const { toPascalCase } = require('../utils/naming');

function svelteTemplate(iconName, svg) {
  const baseName = iconName.split(/[:/]/)[1] || iconName;
  const componentName = toPascalCase(baseName) + 'Icon';
  // Svelte uses class and props passed via spread
  const attrString = Object.entries(svg.attrs).map(([k,v]) => `${k}="${v}"`).join(' ');
  return `<script>export let size='1em'; export let color='currentColor'; export let strokeWidth; export let className='';</script>\n<svg ${attrString} width={size} height={size} fill={color} stroke-width={strokeWidth} class={className} {...$$restProps}>${svg.children}</svg>`;
}

module.exports = { svelteTemplate };
