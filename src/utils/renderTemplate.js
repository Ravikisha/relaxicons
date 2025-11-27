const fs = require('fs');
const path = require('path');

// Lazy require to avoid optional deps causing issues if unused
function lazyRequire(name) {
  try { return require(name); } catch { return null; }
}

/**
 * Render a template from a custom templatesDir if available.
 * Supports: .hbs (handlebars), .ejs (ejs), .js (module exporting function(context) => string)
 * Returns null if no matching template file found; callers can fallback to built-ins.
 */
function renderCustomTemplate(templatesDir, framework, context) {
  if (!templatesDir) return null;
  const base = path.resolve(process.cwd(), templatesDir);
  const candidates = [
    path.join(base, `${framework}.hbs`),
    path.join(base, `${framework}.ejs`),
    path.join(base, `${framework}.js`),
  ];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return null;
  if (file.endsWith('.hbs')) {
    const hbs = lazyRequire('handlebars');
    if (!hbs) throw new Error('Missing dependency: handlebars. Install it or use .ejs/.js templates.');
    const tpl = fs.readFileSync(file, 'utf8');
    const compiled = hbs.compile(tpl);
    return compiled(context);
  }
  if (file.endsWith('.ejs')) {
    const ejs = lazyRequire('ejs');
    if (!ejs) throw new Error('Missing dependency: ejs. Install it or use .hbs/.js templates.');
    const tpl = fs.readFileSync(file, 'utf8');
    return ejs.render(tpl, context);
  }
  // .js module
  const mod = require(file);
  if (typeof mod === 'function') return mod(context);
  if (mod && typeof mod.default === 'function') return mod.default(context);
  throw new Error(`Template module ${path.basename(file)} must export a function`);
}

module.exports = { renderCustomTemplate };
