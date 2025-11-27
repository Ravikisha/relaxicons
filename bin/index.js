#!/usr/bin/env node
// Relaxicons CLI entrypoint
const { Command } = require('commander');
const chalkPkg = require('chalk');
const chalk = chalkPkg.default || chalkPkg; // handle ESM default export
const oraPkg = require('ora');
const ora = oraPkg.default || oraPkg; // handle ESM default export
const prompts = require('prompts');
const fs = require('fs-extra');
const fetch = require('node-fetch'); // kept for other potential uses
const { fetchIcon } = require('../src/api/fetchIcon');
const { fetchCollection, suggestIcons } = require('../src/api/fetchCollection');
const { fetchCollections } = require('../src/api/fetchCollections');
const { transformSvg } = require('../src/utils/transformSvg');
const { reactTemplate } = require('../src/templates/react');
const { vueTemplate } = require('../src/templates/vue');
const { laravelTemplate } = require('../src/templates/laravel');
const { angularTemplate } = require('../src/templates/angular');
const { svelteTemplate } = require('../src/templates/svelte');
const { solidTemplate } = require('../src/templates/solid');
const { webComponentTemplate } = require('../src/templates/webc');
const { reactRSCTemplate } = require('../src/templates/react-rsc');
const { renderCustomTemplate } = require('../src/utils/renderTemplate');
const { optimizeSvgString } = require('../src/utils/optimizeSvg');
const { ensureSortedBarrel } = require('../src/utils/barrel');
const { toPascalCase, toKebabCase } = require('../src/utils/naming');
const path = require('path');
const pkg = require('../package.json');
const os = require('os');
const detectFramework = require('../src/utils/detectFramework');
const getConfig = require('../src/utils/getConfig');
const { safePascal, safeKebab } = require('../src/utils/sanitize');

// Exit codes centralized
const EXIT = Object.freeze({
  OK: 0,
  ERROR: 1,
  CONFIG: 2,
  FETCH: 3,
  DUPLICATE: 4,
});

const program = new Command();
program
  .name('relaxicons')
  .description('Work with Relaxicons (init project, add icons, etc.)')
  .version(pkg.version);

// Global flags
program
  .option('--quiet', 'Suppress non-essential output')
  .option('--no-color', 'Disable colored output')
  .option('--dry-run', 'Show what would happen without writing files');

// INIT COMMAND
program
  .command('init')
  .description('Initialize relaxicons configuration (creates relaxicons.config.json)')
  .option('-f, --force', 'Overwrite existing config/file structure')
  .action(async (opts) => {
  const spinner = (program.opts().quiet ? { start:()=>({}), succeed:()=>{}, fail:()=>{} } : ora('Detecting project framework...')).start?.() || ora('Detecting project framework...').start();
    try {
      const framework = detectFramework();
      spinner.succeed(`Detected: ${framework.name}`);

      const isTTY = process.stdout.isTTY;
      let answers = {
        framework: framework.id,
        iconPath: 'components/ui/icons',
        typescript: fs.existsSync(path.join(process.cwd(), 'tsconfig.json')),
      };

      if (isTTY) {
        answers = await prompts([
          {
            type: 'select',
            name: 'framework',
            message: 'Confirm framework',
            initial: 0,
            choices: [
              { title: framework.name, value: framework.id },
              { title: 'Other / Unknown', value: 'unknown' },
            ],
          },
          {
            type: 'text',
            name: 'iconPath',
            message: 'Where do you want to save icons?',
            initial: 'components/ui/icons',
          },
          {
            type: 'toggle',
            name: 'typescript',
            message: 'Do you use TypeScript?',
            initial: answers.typescript,
            active: 'yes',
            inactive: 'no',
          },
        ], {
          onCancel: () => {
            console.log(chalk.yellow('Init cancelled.'));
            process.exit(EXIT.ERROR);
          },
        });
      }

      const configPath = path.join(process.cwd(), 'relaxicons.config.json');
      if (fs.existsSync(configPath) && !opts.force) {
        console.log(chalk.red('relaxicons.config.json already exists. Use --force to overwrite.'));
  process.exitCode = EXIT.CONFIG;
        return;
      }
      await fs.writeFile(
        configPath,
        JSON.stringify(
          {
            framework: answers.framework,
            iconPath: answers.iconPath,
            typescript: !!answers.typescript,
            schemaVersion: 2,
            generatedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
      // Ensure icon directory exists
      const absoluteIconDir = path.join(process.cwd(), answers.iconPath);
      await fs.ensureDir(absoluteIconDir);
      console.log(chalk.green(`✔ Created ${path.relative(process.cwd(), configPath)}`));
      console.log(chalk.green(`✔ Ensured directory ${answers.iconPath}`));
    } catch (err) {
      if (!program.opts().quiet) spinner.fail('Failed to initialize configuration');
      console.error(chalk.red(err.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// Generic list output helper
function outputList(items, opts = {}, summaryLabel = 'Total') {
  let list = items;
  if (opts.filter) {
    const needle = opts.filter.toLowerCase();
    list = list.filter(i => {
      if (typeof i === 'string') return i.toLowerCase().includes(needle);
      if (i && typeof i === 'object') {
        const s = [i.name, i.title, i.count].filter(Boolean).join(' ');
        return s.toLowerCase().includes(needle);
      }
      return false;
    });
  }
  if (opts.json) {
    console.log(JSON.stringify(list, null, 2));
    console.log(chalk.green(`${summaryLabel}: ${list.length}`));
    return;
  }
  if (!list.length) {
    console.log(chalk.yellow(`No ${summaryLabel.toLowerCase()} found matching criteria.`));
    return;
  }
  const limit = typeof opts.limit === 'number' && opts.limit > 0 ? opts.limit : 50;
  const display = list.slice(0, limit);
  // Column formatting
  const termWidth = process.stdout.columns || 80;
  const colWidth = Math.max(10, Math.min(30, Math.floor(termWidth / 3)));
  for (let i = 0; i < display.length; i += 3) {
    const row = display.slice(i, i + 3)
      .map(entry => {
        let s = entry;
        if (entry && typeof entry === 'object') {
          const name = entry.name || '';
          const title = entry.title ? ` — ${entry.title}` : '';
          const count = typeof entry.count === 'number' ? ` (${entry.count})` : '';
          s = `${name}${title}${count}`;
        }
        if (typeof s !== 'string') s = String(s);
        return (s.length > colWidth ? s.slice(0, colWidth - 1) + '…' : s).padEnd(colWidth);
      })
      .join('');
    console.log(row.trimEnd());
  }
  if (list.length > display.length) {
    console.log(chalk.gray(`...and ${list.length - display.length} more`));
  }
  console.log(chalk.green(`${summaryLabel}: ${list.length}`));
}

// collections command
program
  .command('collections')
  .description('List available icon collection prefixes')
  .option('--filter <text>', 'Filter collections by substring')
  .option('--limit <n>', 'Limit number of collections printed', v => parseInt(v, 10))
  .option('--json', 'Output JSON array')
  .option('--fields <list>', 'Comma separated fields: name,title,count', (v)=>v.split(',').map(s=>s.trim()).filter(Boolean))
  .action(async (opts) => {
  const spinner = (program.opts().quiet ? { start:()=>({}), stop:()=>{} } : ora('Fetching collections...')).start?.() || ora('Fetching collections...').start();
    try {
  const cols = await fetchCollections({ fields: opts.fields });
  spinner.stop?.();
      outputList(cols, opts, 'Collections');
    } catch (e) {
  if (!program.opts().quiet) spinner.fail?.('Failed to load collections');
      console.error(chalk.red(e.message));
  process.exitCode = EXIT.FETCH;
    }
  });

// icons command
program
  .command('icons <collection>')
  .description('List icons in a collection')
  .option('--filter <text>', 'Filter icons containing text')
  .option('--limit <n>', 'Limit number of icons printed', v => parseInt(v, 10))
  .option('--json', 'Output JSON array')
  .option('--qualified', 'Print qualified ids as <collection>:<name>')
  .action(async (collection, opts) => {
    const spinner = (program.opts().quiet ? { start:()=>({}), stop:()=>{} } : ora(`Loading collection ${collection}...`)).start?.() || ora(`Loading collection ${collection}...`).start();
    try {
  const icons = await fetchCollection(collection);
      spinner.stop?.();
  const out = opts.qualified ? icons.map(n => `${collection}:${n}`) : icons;
  outputList(out, opts, 'Icons');
    } catch (e) {
      if (!program.opts().quiet) spinner.fail?.('Failed to load collection');
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.FETCH;
    }
  });

// list alias (deprecated)
program
  .command('list <collection>')
  .description('Alias for icons <collection> (deprecated)')
  .option('--filter <text>', 'Filter icons containing text')
  .option('--limit <n>', 'Limit number of icons printed', v => parseInt(v, 10))
  .option('--json', 'Output JSON array')
  .action(async (collection, opts) => {
    if (!program.opts().quiet) console.log(chalk.gray('[deprecation] use "relaxicons icons <collection>" instead of "list"'));
    const spinner = (program.opts().quiet ? { start:()=>({}), stop:()=>{} } : ora(`Loading collection ${collection}...`)).start?.() || ora(`Loading collection ${collection}...`).start();
    try {
      const icons = await fetchCollection(collection);
      spinner.stop?.();
      outputList(icons, opts, 'Icons');
    } catch (e) {
      if (!program.opts().quiet) spinner.fail?.('Failed to load collection');
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.FETCH;
    }
  });

// MIGRATE command: upgrade config to current schema defaults
program
  .command('migrate-config')
  .description('Migrate relaxicons.config.json to latest schema fields')
  .action(async () => {
    try {
      const cfg = getConfig();
      const configPath = require('path').join(cfg.__dir, 'relaxicons.config.json');
      const next = { schemaVersion: 2, ...cfg };
      delete next.__dir;
      await fs.writeFile(configPath, JSON.stringify(next, null, 2));
      console.log(chalk.green('✔ Config migrated'));
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// SEARCH command: across collections or a single collection
program
  .command('search <query>')
  .description('Search icons across collections or within a collection')
  .option('-c, --collection <prefix>', 'Collection to scope the search')
  .option('--limit <n>', 'Limit number of results', v => parseInt(v, 10))
  .option('--json', 'Output JSON array')
  .action(async (query, opts) => {
    const q = query.toLowerCase();
    try {
      const prefixes = opts.collection ? [opts.collection] : await fetchCollections();
      const results = [];
      for (const p of prefixes) {
        try {
          const icons = await fetchCollection(p);
          icons.filter(n => n.toLowerCase().includes(q)).forEach(n => results.push(`${p}:${n}`));
        } catch (_) { /* ignore missing or fetch errors per collection */ }
      }
      outputList(results, opts, 'Results');
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.FETCH;
    }
  });

// STATS command: counts icons per collection
program
  .command('stats')
  .description('Show icon counts per collection or for a specific collection')
  .option('-c, --collection <prefix>', 'Specific collection to count')
  .option('--limit <n>', 'Limit number of collections when summarizing', v => parseInt(v, 10))
  .option('--json', 'Output JSON')
  .action(async (opts) => {
    try {
      if (opts.collection) {
        const list = await fetchCollection(opts.collection);
        const out = [{ name: opts.collection, count: list.length }];
        outputList(out, { json: opts.json }, 'Stats');
        return;
      }
      const prefixes = await fetchCollections();
      const limit = typeof opts.limit === 'number' && opts.limit > 0 ? opts.limit : 25;
      const sample = prefixes.slice(0, limit);
      const rows = [];
      for (const p of sample) {
        try {
          const list = await fetchCollection(p);
          rows.push({ name: p, count: list.length });
        } catch {
          rows.push({ name: p, count: 0 });
        }
      }
      outputList(rows, { json: opts.json }, 'Stats');
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// CACHE CLEAR command: placeholder (no persistent cache yet)
program
  .command('cache-clear')
  .description('Clear Relaxicons local cache (placeholder)')
  .action(async () => {
    try {
      // Currently no on-disk cache maintained by CLI.
      console.log(chalk.green('No persistent cache to clear.'));
      console.log(chalk.gray('Tip: Clear your npm and OS DNS caches if needed.'));
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// DOCTOR command: environment diagnostics
program
  .command('doctor')
  .description('Diagnose environment and configuration')
  .option('--verbose', 'Print verbose information')
  .action(async (opts) => {
    try {
      const info = {
        node: process.version,
        platform: `${process.platform} ${process.arch}`,
        cwd: process.cwd(),
        pkgVersion: pkg.version,
      };
      let config;
      try {
        config = getConfig();
        info.config = { framework: config.framework, iconPath: config.iconPath, typescript: config.typescript };
        console.log(chalk.green('✔ Configuration loaded'));
      } catch (e) {
        console.log(chalk.yellow('No configuration found. Run "relaxicons init".'));
      }
      // Network check
      try {
        const cols = await fetchCollections({ fields: ['name'] });
        console.log(chalk.green(`✔ Network OK (collections: ${cols.length})`));
      } catch (e) {
        console.log(chalk.red('✖ Network check failed'));
        if (opts.verbose) console.log(chalk.gray(e.message));
      }
      if (opts.verbose) {
        console.log(chalk.gray('Details:'));
        console.log(info);
      }
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// ADD COMMAND
program
  .command('add <iconId>')
  .description('Add an icon from Iconify (collection:name) and generate framework component')
  .option('-f, --framework <fw>', 'Override framework (react/vue/angular/laravel/svelte/solid/webc/next-rsc)')
  .option('--raw', 'Save raw cleaned SVG instead of framework component')
  .option('--both', 'Save cleaned SVG alongside framework component')
  .option('--force', 'Overwrite existing file if present')
  .option('--from <file>', 'Read list of icon ids from file (one per line or comma-separated)')
  .option('--no-svgo', 'Disable SVGO optimization (if svgo installed)')
  .action(async (iconId, opts) => {
    const spinner = (program.opts().quiet ? { start:()=>({}), text:'', succeed:()=>{}, fail:()=>{} } : ora(`Fetching ${iconId}...`)).start?.() || ora(`Fetching ${iconId}...`).start();
    try {
      let config;
      try {
        config = getConfig();
      } catch (e) {
        if (!program.opts().quiet) spinner.fail('No configuration');
        if (e.code === 'NO_CONFIG') {
          console.error(chalk.red('relaxicons.config.json missing. Run "relaxicons init" first.'));
        } else {
          console.error(chalk.red(e.message));
        }
        process.exitCode = EXIT.CONFIG;
        return;
      }
  // Autodetect/override framework
  const framework = (opts.framework || config.framework || 'unknown').toLowerCase();
      const targetDir = path.resolve(process.cwd(), config.iconPath);
      await fs.ensureDir(targetDir);

      // Batch mode support
      let allIds = [];
      if (opts.from) {
        const content = await fs.readFile(path.resolve(process.cwd(), opts.from), 'utf8');
        allIds = content.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
      }
      if (iconId && iconId.includes(':') && iconId.includes(',')) {
        const [prefix, names] = iconId.split(':');
        allIds.push(...names.split(',').map(n => `${prefix}:${n}`));
      } else if (iconId) {
        allIds.push(iconId);
      }

      // Process each id
      const results = [];
  for (const id of allIds) {
        spinner.text = `Fetching ${id}...`;

  // Fetch raw SVG
      let rawSvg;
      try {
        rawSvg = await fetchIcon(id);
      } catch (e) {
        if (/Icon not found/.test(e.message)) {
          spinner.fail('Icon not found');
          const collection = id.split(/[:/]/)[0];
          try {
            const icons = await fetchCollection(collection);
            const namePart = id.split(/[:/]/)[1];
            const suggestions = suggestIcons(namePart, icons, 5);
            if (suggestions.length) {
              console.log(chalk.yellow(`Did you mean: ${suggestions.join(', ')}?`));
            } else {
              // Cross-collection suggestions using cached global index
              try {
                const prefixes = await fetchCollections();
                const cross = [];
                for (const p of prefixes) {
                  try {
                    const list = await fetchCollection(p);
                    const s = suggestIcons(namePart, list, 1)[0];
                    if (s) cross.push(`${p}:${s}`);
                  } catch {}
                }
                if (cross.length) console.log(chalk.yellow(`Similar across collections: ${cross.slice(0,5).join(', ')}`));
                else console.log(chalk.yellow('No close matches found in collection.'));
              } catch { console.log(chalk.yellow('No close matches found in collection.')); }
            }
          } catch (ec) {
            console.log(chalk.gray('Unable to load collection for suggestions:'), ec.message);
          }
          process.exitCode = 1;
          return;
        }
        throw e;
      }
  // Optional SVGO optimization
  let maybeOptimized = rawSvg;
  if (config.optimizeSvg !== false && opts.svgo !== false) {
    // allow object options via config.optimizeSvg
    const options = typeof config.optimizeSvg === 'object' ? config.optimizeSvg : undefined;
    maybeOptimized = optimizeSvgString(rawSvg, options);
  }
  spinner.text = 'Transforming SVG...';
  const processed = transformSvg(maybeOptimized);

      // Determine base name and component naming
  const baseName = id.split(/[:/]/)[1] || id;
  const pascal = safePascal(toPascalCase(baseName)); // e.g. ArrowRight
  const kebab = safeKebab(toKebabCase(pascal)); // e.g. arrow-right

      // Generate code based on framework
      spinner.text = `Generating ${framework} component...`;
  let code; let filename;
      const useTS = !!config.typescript;
  if (opts.raw) {
        code = rawSvg; // optionally could use processed.children only
        filename = kebab + '.svg';
      } else {
        // Try custom templates directory first
        const custom = renderCustomTemplate(config.templatesDir, framework, {
          iconId,
          baseName,
          pascal,
          kebab,
          svg: processed,
          typescript: useTS,
        });
        if (custom) {
          code = custom;
          filename = framework === 'vue' || framework === 'vite-vue' ? pascal + 'Icon.vue' : framework === 'laravel' ? kebab + '.blade.php' : framework === 'webc' ? kebab + '.js' : pascal + 'Icon' + (useTS ? (framework === 'angular' ? '.ts' : '.tsx') : '.jsx');
        } else switch (framework) {
          case 'next':
          case 'next-rsc':
            code = reactRSCTemplate(id, processed);
            filename = pascal + 'Icon' + (useTS ? '.tsx' : '.jsx');
            break;
          case 'vite-react':
          case 'react':
            code = reactTemplate(id, processed, { typescript: useTS });
            filename = pascal + 'Icon' + (useTS ? '.tsx' : '.jsx');
            break;
          case 'vite-vue':
          case 'vue':
            code = vueTemplate(id, processed);
            filename = pascal + 'Icon.vue';
            break;
          case 'angular':
            code = angularTemplate(id, processed);
            filename = pascal + 'Icon.ts';
            break;
          case 'laravel':
            code = laravelTemplate(id, processed);
            filename = kebab + '.blade.php';
            break;
          case 'vite-svelte':
          case 'svelte':
            code = svelteTemplate(id, processed);
            filename = pascal + 'Icon.svelte';
            break;
          case 'solid':
            code = solidTemplate(id, processed);
            filename = pascal + 'Icon.jsx';
            break;
          case 'webc':
          case 'web-components':
            code = webComponentTemplate(id, processed);
            filename = kebab + '.js';
            break;
          default:
            // Fallback: raw svg file
            code = rawSvg;
            filename = kebab + '.svg';
        }
      }

  const filePath = path.join(targetDir, filename);

      // Duplicate check
      if (await fs.pathExists(filePath) && !opts.force) {
        spinner.fail('File already exists');
        console.log(chalk.yellow(`⚠ ${filename} already exists. Use --force to overwrite.`));
        return;
      }

      // Prettier formatting for supported code files
      let finalCode = code;
      try {
        if (/\.(tsx|jsx|js|vue|ts|php)$/.test(filename)) {
          const prettier = require('prettier');
          const parser = filename.endsWith('.vue')
            ? 'vue'
            : filename.endsWith('.php')
            ? 'php'
            : filename.endsWith('.tsx')
            ? 'typescript'
            : filename.endsWith('.ts')
            ? 'typescript'
            : 'babel';
          const maybe = prettier.format(code, { parser, singleQuote: true });
          // Prettier v3 returns a Promise; handle both sync/async
          finalCode = (maybe && typeof maybe.then === 'function') ? await maybe : maybe;
        }
      } catch (e) {
        console.log(chalk.gray('Prettier formatting skipped:'), e.message);
      }

        // Write primary artifact
        if (program.opts().dryRun) {
          console.log(chalk.gray(`[dry-run] write ${path.relative(process.cwd(), filePath)}`));
        } else {
          await fs.writeFile(filePath, finalCode, 'utf8');
        }

      // If --both, also write cleaned SVG next to component
        if (opts.both && !opts.raw) {
        const svgName = kebab + '.svg';
        const svgPath = path.join(targetDir, svgName);
        // Avoid overwrite unless --force
          if (!(await fs.pathExists(svgPath)) || opts.force) {
          // Serialize cleaned SVG using processed attrs/children
          const attrsString = Object.entries(processed.attrs).map(([k,v]) => `${k}="${v}"`).join(' ');
          const cleaned = `<svg ${attrsString}>${processed.children}</svg>`;
            if (program.opts().dryRun) {
              console.log(chalk.gray(`[dry-run] write ${path.relative(process.cwd(), svgPath)}`));
            } else {
              await fs.writeFile(svgPath, cleaned, 'utf8');
            }
        }
        }

      // Barrel export (React/Vue only)
  // Barrel export for component frameworks only
  if (!opts.raw && ['react', 'next', 'next-rsc', 'vite-react', 'vite-vue', 'vue'].includes(framework)) {
        const indexFile = path.join(targetDir, config.typescript ? 'index.ts' : 'index.js');
        const exportLine = framework.includes('vue') || framework === 'vue' || framework === 'vite-vue'
          ? `export { default as ${pascal}Icon } from './${pascal}Icon.vue';\n`
          : `export * from './${pascal}Icon';\n`;
        let append = true;
        if (await fs.pathExists(indexFile)) {
          const existing = await fs.readFile(indexFile, 'utf8');
          if (existing.includes(exportLine.trim())) append = false;
        }
        if (append) {
          if (program.opts().dryRun) {
            console.log(chalk.gray(`[dry-run] append export to ${path.relative(process.cwd(), indexFile)}`));
          } else {
            await fs.appendFile(indexFile, exportLine, 'utf8');
            await ensureSortedBarrel(indexFile);
          }
        }
      }
  results.push({ id, file: filePath });
      }
      if (!program.opts().quiet) spinner.succeed(`Added ${results.length} icon(s)`);
      results.forEach(r => !program.opts().quiet && console.log(chalk.gray(`File: ${path.relative(process.cwd(), r.file)}`)));
    } catch (err) {
      if (!program.opts().quiet) spinner.fail('Failed to add icon');
      console.error(chalk.red(err.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// REGENERATE command: CI helper to generate from a manifest
program
  .command('regenerate')
  .description('Regenerate icons from a manifest file (for CI)')
  .option('-m, --manifest <file>', 'Path to a text/JSON manifest (one icon id per line or array)')
  .option('-c, --concurrency <n>', 'Concurrent fetches (default 4)', v => parseInt(v,10))
  .action(async (opts) => {
    try {
      const cfg = getConfig();
      const manifestPath = opts.manifest || 'relaxicons.manifest';
      const content = await fs.readFile(require('path').resolve(process.cwd(), manifestPath), 'utf8');
      let ids = [];
      try { const parsed = JSON.parse(content); if (Array.isArray(parsed)) ids = parsed; } catch { /* not JSON */ }
      if (!ids.length) ids = content.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      if (!ids.length) { console.log(chalk.yellow('Manifest empty.')); return; }
      const conc = Math.max(1, opts.concurrency || 4);
      // simple rate limit with concurrency window
      const queue = ids.slice();
      const runWorker = async () => {
        while (queue.length) {
          const id = queue.shift();
          // invoke add in-process to reuse current logic
          await program.parseAsync(['node','relaxicons','add', id], { from: 'user' });
        }
      };
      await Promise.all(Array.from({length: conc}, runWorker));
      console.log(chalk.green(`✔ Regenerated ${ids.length} icons`));
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// UPDATE-CACHE command
program
  .command('update-cache')
  .description('Refresh cached collections and icons metadata')
  .action(async () => {
    const spinner = (program.opts().quiet ? { start:()=>({}), succeed:()=>{}, fail:()=>{} } : ora('Updating cache...')).start?.() || ora('Updating cache...').start();
    try {
      const prefixes = await fetchCollections();
      for (const p of prefixes) {
        try { await fetchCollection(p); } catch {}
      }
      spinner.succeed('Cache updated');
    } catch (e) {
      if (!program.opts().quiet) spinner.fail('Cache update failed');
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// REMOVE command
const { removeLineFromFile } = require('../src/utils/files');
program
  .command('remove <iconId>')
  .description('Remove a generated icon file and update barrel')
  .action(async (iconId) => {
    try {
      const config = getConfig();
      const framework = (config.framework || 'unknown').toLowerCase();
      const targetDir = path.resolve(process.cwd(), config.iconPath);
      const baseName = iconId.split(/[:/]/)[1] || iconId;
      const pascal = toPascalCase(baseName);
      const kebab = toKebabCase(pascal);
      const useTS = !!config.typescript;
      const filename = framework.includes('vue') ? `${pascal}Icon.vue`
        : framework === 'laravel' ? `${kebab}.blade.php`
        : framework === 'angular' ? `${pascal}Icon.ts`
        : `${pascal}Icon${useTS ? '.tsx' : '.jsx'}`;
      const filePath = path.join(targetDir, filename);
      if (await fs.pathExists(filePath)) {
        if (program.opts().dryRun) {
          console.log(chalk.gray(`[dry-run] remove ${path.relative(process.cwd(), filePath)}`));
        } else {
          await fs.remove(filePath);
        }
      } else {
        console.log(chalk.yellow('File not found; skipping'));
      }
      // Update barrel
      if (['react', 'next', 'next-rsc', 'vite-react', 'vite-vue', 'vue'].includes(framework)) {
        const indexFile = path.join(targetDir, useTS ? 'index.ts' : 'index.js');
        const lineVue = `export { default as ${pascal}Icon } from './${pascal}Icon.vue';`;
        const lineReact = `export * from './${pascal}Icon';`;
        await removeLineFromFile(indexFile, (l) => l.includes(lineVue) || l.includes(lineReact));
        await ensureSortedBarrel(indexFile);
      }
      console.log(chalk.green(`✔ Removed ${iconId}`));
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exitCode = EXIT.ERROR;
    }
  });

// DOCTOR command
program
  .command('doctor')
  .description('Validate config, environment, paths, and API reachability')
  .action(async () => {
    const issues = [];
    // Node version
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major < 18) issues.push('Node 18+ required');
    // Config
    try { getConfig(); } catch (e) { issues.push(e.message); }
    // API reachability (collections)
    try { await fetchCollections(); } catch (e) { issues.push('Iconify collections API not reachable'); }
    if (issues.length) {
      console.log(chalk.red('Issues found:'));
      issues.forEach(i => console.log(' - ' + i));
      process.exitCode = EXIT.ERROR;
    } else {
      console.log(chalk.green('Environment looks good.'));
    }
  });

// Shell completion output (basic static)
program
  .command('completion [shell]')
  .description('Generate shell completion script (zsh|bash|fish)')
  .action((shell) => {
    const s = (shell || 'zsh').toLowerCase();
    const script = `# relaxicons completion\n# add to your shell rc file\n_relaxtab() { :; }`;
    console.log(script);
  });

// If no args, show help
if (process.argv.length <= 2) {
  program.outputHelp();
} else {
  program.parseAsync(process.argv);
}
