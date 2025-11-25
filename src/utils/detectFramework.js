const fs = require('fs');
const path = require('path');

// Detect framework based on presence of config files in project root.
// Returns { id, name, confidence, files: [] }
module.exports = function detectFramework(cwd = process.cwd()) {
  const rootFiles = new Set(fs.readdirSync(cwd));
  const has = (f) => rootFiles.has(f);
  const checks = [];

  // Next.js
  if (has('next.config.js') || has('next.config.mjs') || has('next.config.ts')) {
    checks.push({ id: 'next', name: 'Next.js', confidence: 0.9, files: ['next.config.*'] });
  }

  // Vite-based frameworks (React/Vue/Svelte) indicated by vite.config.* and package.json deps
  if ([...rootFiles].some(f => /^vite\.config\.(js|mjs|ts|cjs)$/.test(f)) && has('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps) {
        if (deps.react) {
          checks.push({ id: 'vite-react', name: 'Vite (React)', confidence: 0.8, files: ['vite.config.*', 'react dependency'] });
        }
        if (deps.vue) {
          checks.push({ id: 'vite-vue', name: 'Vite (Vue)', confidence: 0.8, files: ['vite.config.*', 'vue dependency'] });
        }
        if (deps.svelte) {
          checks.push({ id: 'vite-svelte', name: 'Vite (Svelte)', confidence: 0.8, files: ['vite.config.*', 'svelte dependency'] });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Angular
  if (has('angular.json')) {
    checks.push({ id: 'angular', name: 'Angular', confidence: 0.85, files: ['angular.json'] });
  }

  // Laravel
  if (has('composer.json') && has('artisan')) {
    checks.push({ id: 'laravel', name: 'Laravel', confidence: 0.9, files: ['composer.json', 'artisan'] });
  }

  if (!checks.length) {
    return { id: 'unknown', name: 'Unknown', confidence: 0, files: [] };
  }

  // Choose highest confidence; if tie choose first.
  checks.sort((a, b) => b.confidence - a.confidence);
  return checks[0];
};
