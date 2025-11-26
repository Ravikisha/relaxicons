const cheerio = require("cheerio");

/**
 * Clean & normalize SVG:
 * - remove width/height attributes (preserve viewBox)
 * - ensure stroke/fill default to currentColor if not explicitly set
 * - remove any data-* attributes that are not needed
 * - return inner markup + root tag attributes
 * The output is consumed by framework templates and optional --both SVG write.
 */
function transformSvg(raw) {
  const $ = cheerio.load(raw, { xmlMode: true });
  const $svg = $("svg").first();
  if (!$svg.length) throw new Error("No <svg> root found");

  // Remove dimension attributes
  $svg.removeAttr("width");
  $svg.removeAttr("height");

  // Normalize stroke/fill
  const ensureColor = (el) => {
    const $el = $(el);
    if (!$el.attr("stroke") && $el.attr("stroke-width")) {
      $el.attr("stroke", "currentColor");
    }
    if (!$el.attr("fill")) {
      // If fill="none" keep it
      if ($el.attr("fill") === "none") return;
      // Only set if element likely uses fill (paths, circles, etc.)
      const tag = el.tagName.toLowerCase();
      if (
        ["path", "circle", "rect", "polygon", "polyline", "ellipse"].includes(
          tag
        )
      ) {
        $el.attr("fill", "currentColor");
      }
    }
  };

  $svg.find("*").each((_, el) => ensureColor(el));

  // Strip data-* attributes
  $svg.find("[data-name],[data-style]").each((_, el) => {
    const $el = $(el);
    $el.removeAttr("data-name");
    $el.removeAttr("data-style");
  });

  // Collect root attributes
  const attrs = {};
  Object.keys($svg[0].attribs || {}).forEach((key) => {
    if (!["width", "height"].includes(key)) {
      attrs[key] = $svg.attr(key);
    }
  });

  // Inner markup
  const children = $svg.html();
  return { attrs, children };
}

module.exports = { transformSvg };
