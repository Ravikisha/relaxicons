const reserved = new Set([
  'default','class','function','return','export','import','new','switch','case','var','let','const','if','else','try','catch','finally','extends','super'
]);

function prefixIfReserved(name, prefix) {
  if (reserved.has(name)) return prefix + name[0].toUpperCase() + name.slice(1);
  if (/^[0-9]/.test(name)) return prefix + name;
  return name;
}

function safePascal(pascal) {
  return prefixIfReserved(pascal, 'Icon');
}

function safeKebab(kebab) {
  return /^[a-z0-9-]+$/.test(kebab) ? kebab : kebab.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

module.exports = { safePascal, safeKebab };
