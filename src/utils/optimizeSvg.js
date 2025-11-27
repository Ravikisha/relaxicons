// Optional SVGO optimization. If svgo isn't installed, we skip gracefully.
function optimizeSvgString(svg, options) {
  let svgo;
  try { svgo = require('svgo'); } catch { return svg; }
  const { optimize } = svgo;
  try {
    const res = optimize(svg, { multipass: true, ...options });
    return res && res.data ? res.data : svg;
  } catch {
    return svg;
  }
}

module.exports = { optimizeSvgString };
