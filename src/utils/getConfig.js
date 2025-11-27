const fs = require("fs");
const path = require("path");
let Ajv;
try { Ajv = require("ajv"); } catch { Ajv = null; }

function findConfig(startDir) {
  let dir = startDir;
  while (true) {
    const fp = path.join(dir, "relaxicons.config.json");
    if (fs.existsSync(fp)) return fp;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

module.exports = function getConfig(cwd = process.cwd()) {
  const file = findConfig(cwd);
  if (!file) {
    const err = new Error(
      'Configuration file relaxicons.config.json not found. Run "relaxicons init" first.'
    );
    err.code = "NO_CONFIG";
    throw err;
  }
  try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    // Migrate legacy field: outDir -> iconPath (do not mutate on disk here)
    if (!data.iconPath && data.outDir) data.iconPath = data.outDir;
    // Validate against schema
    const schemaPath = path.join(path.dirname(file), "relaxicons.config.schema.json");
    const localSchema = fs.existsSync(schemaPath)
      ? JSON.parse(fs.readFileSync(schemaPath, "utf8"))
      : null;
    const cfg = JSON.parse(JSON.stringify(data));
    if (Ajv) {
      const ajv = new Ajv({ allErrors: true, useDefaults: true, $data: true });
      let validate;
      if (localSchema) {
        validate = ajv.compile(localSchema);
      } else {
        validate = ajv.compile({ type: "object" });
      }
      const ok = validate(cfg);
      if (!ok) {
        const msg = validate.errors && validate.errors.length
          ? validate.errors.map(e => `${e.instancePath || '/'} ${e.message}`).join(", ")
          : "Invalid configuration";
        const err = new Error("Invalid relaxicons.config.json: " + msg);
        err.code = "BAD_CONFIG";
        throw err;
      }
    }
    // Attach directory for relative resolution
    cfg.__dir = path.dirname(file);
    return cfg;
  } catch (e) {
    if (e.code === "BAD_CONFIG") throw e;
    const err = new Error("Failed to read relaxicons.config.json: " + e.message);
    err.code = "BAD_CONFIG";
    throw err;
  }
};
