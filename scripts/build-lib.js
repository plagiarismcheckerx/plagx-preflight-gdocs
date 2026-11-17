// Bundles plagx-preflight into src/Lib.html (window.PlagxPreflight) for the sidebar,
// since Apps Script HTML can't load ES modules from npm.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('../node_modules/plagx-preflight/package.json', import.meta.url)));
const result = await build({
  entryPoints: [new URL('../node_modules/plagx-preflight/src/index.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')],
  bundle: true,
  format: 'iife',
  globalName: 'PlagxPreflight',
  target: 'es2020',
  write: false,
  legalComments: 'none',
});
const code = result.outputFiles[0].text.replace(/<\/script/gi, '<\/script');
writeFileSync(new URL('../src/Lib.html', import.meta.url),
  `<script>\n// plagx-preflight ${version} (MIT, https://github.com/plagiarismcheckerx/plagx-preflight), bundled by scripts/build-lib.js.\n${code}</script>\n`);
console.log(`src/Lib.html: plagx-preflight ${version}, ${code.length} bytes`);
