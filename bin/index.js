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
const { transformSvg } = require('../src/utils/transformSvg');
const { reactTemplate } = require('../src/templates/react');
const { vueTemplate } = require('../src/templates/vue');
const { laravelTemplate } = require('../src/templates/laravel');
const { angularTemplate } = require('../src/templates/angular');
const { toPascalCase, toKebabCase } = require('../src/utils/naming');
const path = require('path');
const pkg = require('../package.json');
const detectFramework = require('../src/utils/detectFramework');
const getConfig = require('../src/utils/getConfig');

const program = new Command();
program
  .name('relaxicons')
  .description('Work with Relaxicons (init project, add icons, etc.)')
  .version(pkg.version);

// INIT COMMAND
// INIT COMMAND
program
  .command('init')
  .description('Initialize relaxicons configuration (creates icon.config.json)')
  .option('-f, --force', 'Overwrite existing config/file structure')
  .action(async (opts) => {
    const spinner = ora('Detecting project framework...').start();
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
            process.exit(1);
          },
        });
      }

      const configPath = path.join(process.cwd(), 'icon.config.json');
      if (fs.existsSync(configPath) && !opts.force) {
        console.log(chalk.red('icon.config.json already exists. Use --force to overwrite.'));
        process.exitCode = 1;
        return;
      }
      await fs.writeFile(
        configPath,
        JSON.stringify(
          {
            framework: answers.framework,
            iconPath: answers.iconPath,
            typescript: !!answers.typescript,
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
      spinner.fail('Failed to initialize configuration');
      console.error(chalk.red(err.message));
      process.exitCode = 1;
    }
  });

// LIST COMMAND
program
  .command('list <collection>')
  .description('List icons in a collection (optionally filter)')
  .option('--filter <text>', 'Filter icons containing text')
  .action(async (collection, opts) => {
    const spinner = ora(`Loading collection ${collection}...`).start();
    try {
      const icons = await fetchCollection(collection);
      spinner.stop();
      let list = icons;
      if (opts.filter) {
        const needle = opts.filter.toLowerCase();
        list = list.filter(i => i.toLowerCase().includes(needle));
      }
      if (!list.length) {
        console.log(chalk.yellow('No icons found matching criteria.'));
        return;
      }
      const max = 50;
      const display = list.slice(0, max);
      display.forEach(i => console.log(i));
      if (list.length > max) {
        console.log(chalk.gray(`...and ${list.length - max} more`));
      }
      console.log(chalk.green(`Total: ${list.length}`));
    } catch (e) {
      spinner.fail('Failed to load collection');
      console.error(chalk.red(e.message));
      process.exitCode = 1;
    }
  });

// ADD COMMAND
program
  .command('add <iconId>')
  .description('Add an icon from Iconify (collection:name) and generate framework component')
  .option('-f, --framework <fw>', 'Override framework (react/vue/angular/laravel)')
  .option('--raw', 'Save raw cleaned SVG instead of framework component')
  .option('--force', 'Overwrite existing file if present')
  .action(async (iconId, opts) => {
    const spinner = ora(`Fetching ${iconId}...`).start();
    try {
      let config;
      try {
        config = getConfig();
      } catch (e) {
        spinner.fail('No configuration');
        if (e.code === 'NO_CONFIG') {
          console.error(chalk.red('icon.config.json missing. Run "relaxicons init" first.'));
        } else {
          console.error(chalk.red(e.message));
        }
        process.exitCode = 1;
        return;
      }
      const framework = (opts.framework || config.framework || 'unknown').toLowerCase();
      const targetDir = path.resolve(process.cwd(), config.iconPath);
      await fs.ensureDir(targetDir);

      // Fetch raw SVG
      let rawSvg;
      try {
        rawSvg = await fetchIcon(iconId);
      } catch (e) {
        if (/Icon not found/.test(e.message)) {
          spinner.fail('Icon not found');
          const collection = iconId.split(/[:/]/)[0];
          try {
            const icons = await fetchCollection(collection);
            const namePart = iconId.split(/[:/]/)[1];
            const suggestions = suggestIcons(namePart, icons, 5);
            if (suggestions.length) {
              console.log(chalk.yellow(`Did you mean: ${suggestions.join(', ')}?`));
            } else {
              console.log(chalk.yellow('No close matches found in collection.'));
            }
          } catch (ec) {
            console.log(chalk.gray('Unable to load collection for suggestions:'), ec.message);
          }
          process.exitCode = 1;
          return;
        }
        throw e;
      }
      spinner.text = 'Transforming SVG...';
      const processed = transformSvg(rawSvg);

      // Determine base name and component naming
      const baseName = iconId.split(/[:/]/)[1] || iconId;
      const pascal = toPascalCase(baseName); // e.g. ArrowRight
      const kebab = toKebabCase(pascal); // e.g. arrow-right

      // Generate code based on framework
      spinner.text = `Generating ${framework} component...`;
      let code; let filename;
      const useTS = !!config.typescript;
      if (opts.raw) {
        code = rawSvg; // optionally could use processed.children only
        filename = kebab + '.svg';
      } else {
        switch (framework) {
          case 'next':
          case 'vite-react':
          case 'react':
            code = reactTemplate(iconId, processed);
            filename = pascal + 'Icon' + (useTS ? '.tsx' : '.jsx');
            break;
          case 'vite-vue':
          case 'vue':
            code = vueTemplate(iconId, processed);
            filename = pascal + 'Icon.vue';
            break;
          case 'angular':
            code = angularTemplate(iconId, processed);
            filename = pascal + 'Icon.ts';
            break;
          case 'laravel':
            code = laravelTemplate(iconId, processed);
            filename = kebab + '.blade.php';
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

      await fs.writeFile(filePath, finalCode, 'utf8');

      // Barrel export (React/Vue only)
  if (!opts.raw && ['react', 'next', 'vite-react', 'vite-vue', 'vue'].includes(framework)) {
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
          await fs.appendFile(indexFile, exportLine, 'utf8');
        }
      }
      spinner.succeed(`Icon ${pascal} added`);
      console.log(chalk.green(`✔ Icon ${pascal} added to ${path.relative(process.cwd(), targetDir)}`));
      console.log(chalk.gray(`File: ${path.relative(process.cwd(), filePath)}`));
    } catch (err) {
      spinner.fail('Failed to add icon');
      console.error(chalk.red(err.message));
      process.exitCode = 1;
    }
  });

// If no args, show help
if (process.argv.length <= 2) {
  program.outputHelp();
} else {
  program.parseAsync(process.argv);
}
