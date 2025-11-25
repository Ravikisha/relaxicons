function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ') // replace separators with space
    .split(' ') // split
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toKebabCase(str) {
  return str
    // Split lower->Upper boundaries
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Split sequences of capitals followed by a lowercase (XMLParser -> XML-Parser)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // Normalize non-alphanumerics
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = { toPascalCase, toKebabCase };
