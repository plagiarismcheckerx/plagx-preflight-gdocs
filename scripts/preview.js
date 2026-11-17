// Builds preview.html: the sidebar with a stand-in google.script.run that returns a sample
// draft, so the UI can be viewed (and screenshotted) in a normal browser.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL(`../src/${name}.html`, import.meta.url), 'utf8');
const SAMPLE = [
  '# The role of sleep in learning',
  'Sleep plays a a central role in how students consolidate new knowledge (Walker, 2017). Research on memory shows that that rest after study improves recall (Stickgold & Walker, 2013).',
  'Students who sleep less than six hours often report lower grades , and an university survey found similar results (Hershner, 2020).',
  '# References',
  'Walker, M. (2017). Why we sleep. Scribner.',
  'Stickgold, R., & Walker, M. (2013). Sleep-dependent memory triage. Nature Neuroscience, 16(2), 139-145.',
  'Okano, K. (2019). Sleep and academic performance. npj Science of Learning, 4(1), 1-5.',
].join('\n\n');
const stub = `<script>
window.google = { script: { get run() {
  const h = {};
  const api = {
    withSuccessHandler(fn) { h.ok = fn; return api; },
    withFailureHandler(fn) { h.fail = fn; return api; },
    getDocumentText() { setTimeout(() => h.ok(${JSON.stringify(SAMPLE)}), 50); },
    getSelectionText() { setTimeout(() => h.ok(''), 50); },
    selectText() { setTimeout(() => h.ok(true), 50); },
  };
  return api;
} } };
</script>`;
const html = read('Sidebar')
  .replace("<?!= include('Styles'); ?>", read('Styles'))
  .replace("<?!= include('Lib'); ?>", stub + read('Lib'))
  .replace("<?!= include('App'); ?>", read('App') + (process.argv.includes('--run') ? '<script>document.getElementById("check").click()</script>' : ''));
writeFileSync(new URL('../preview.html', import.meta.url), html);
console.log('preview.html written');
