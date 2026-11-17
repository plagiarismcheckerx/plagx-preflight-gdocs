import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = (name) => readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8');

// A small stand-in for DocumentApp: a body of paragraphs, list items and a table.
const T = { PARAGRAPH: 'PARAGRAPH', LIST_ITEM: 'LIST_ITEM', TABLE: 'TABLE', OTHER: 'OTHER' };
const H = { NORMAL: 'NORMAL', HEADING1: 'HEADING1', TITLE: 'TITLE' };
const para = (text, heading = H.NORMAL) => ({ getType: () => T.PARAGRAPH, asParagraph: () => ({ getText: () => text, getHeading: () => heading }), editAsText: () => {}, asText: () => ({ getText: () => text }) });
const item = (text) => ({ getType: () => T.LIST_ITEM, asListItem: () => ({ getText: () => text }) });
const table = (rows) => ({
  getType: () => T.TABLE,
  asTable: () => ({ getNumRows: () => rows.length, getRow: (r) => ({ getNumCells: () => rows[r].length, getCell: (c) => ({ getText: () => rows[r][c] }) }) }),
});

function load(children, { selection = null } = {}) {
  const calls = [];
  // findText walks matches across the joined paragraph texts.
  const matches = (pattern) => {
    const re = new RegExp(pattern, 'g');
    const out = [];
    children.forEach((child, index) => {
      const text = child.getType() === T.PARAGRAPH ? child.asParagraph().getText() : child.getType() === T.LIST_ITEM ? child.asListItem().getText() : '';
      for (const m of text.matchAll(re)) out.push({ index, start: m.index, end: m.index + m[0].length - 1 });
    });
    return out;
  };
  const body = {
    getNumChildren: () => children.length,
    getChild: (i) => children[i],
    findText(pattern, from) {
      const all = matches(pattern);
      const i = from ? all.findIndex((m) => m.index === from.m.index && m.start === from.m.start) + 1 : 0;
      const m = all[i];
      return m ? { m, getElement: () => children[m.index], getStartOffset: () => m.start, getEndOffsetInclusive: () => m.end } : null;
    },
  };
  const doc = {
    getBody: () => body,
    getSelection: () => selection,
    newRange: () => {
      const r = { addElement: (el, s, e) => { r.args = [children.indexOf(el), s, e]; return r; }, build: () => r.args };
      return r;
    },
    setSelection: (range) => calls.push(range),
  };
  const context = { DocumentApp: { ElementType: T, ParagraphHeading: H, getActiveDocument: () => doc }, calls };
  vm.createContext(context);
  vm.runInContext(src('Code.js'), context);
  return context;
}

test('document text: headings marked, lists and table cells as paragraphs, empty lines skipped', () => {
  const ctx = load([
    para('My essay', H.TITLE), para('Intro text (Smith, 2020).'), para('  '), item('First point'),
    table([['Cell A', ''], ['Cell B', 'Cell C']]), para('References', H.HEADING1), para('Smith, J. (2020). A book.'),
    { getType: () => T.OTHER },
  ]);
  assert.equal(ctx.getDocumentText(), [
    '# My essay', 'Intro text (Smith, 2020).', 'First point', 'Cell A', 'Cell B', 'Cell C', '# References', 'Smith, J. (2020). A book.',
  ].join('\n\n'));
});

test('selection text: partial ranges are cut, whole elements kept, no selection is empty', () => {
  const p1 = para('Hello there world');
  const selection = {
    getRangeElements: () => [
      { getElement: () => p1, isPartial: () => true, getStartOffset: () => 6, getEndOffsetInclusive: () => 10 },
      { getElement: () => item('A list item'), isPartial: () => false },
    ],
  };
  assert.equal(load([p1], { selection }).getSelectionText(), 'there\n\nA list item');
  assert.equal(load([p1]).getSelectionText(), '');
});

test('selectText selects the right occurrence and escapes regex characters', () => {
  const ctx = load([para('It is is fine.'), para('Yes is is (really).')]);
  assert.equal(ctx.selectText('is is', 1), true);
  assert.deepEqual(ctx.calls.at(-1), [1, 4, 8]);
  assert.equal(ctx.selectText('(really)', 0), true);
  assert.deepEqual(ctx.calls.at(-1), [1, 10, 17]);
  assert.equal(ctx.selectText('is is', 5), true); // falls back to the first match
  assert.deepEqual(ctx.calls.at(-1), [0, 3, 7]);
  assert.equal(ctx.selectText('missing', 0), false);
  assert.equal(ctx.selectText('', 0), false);
});

test('the bundled library in Lib.html exposes checkDraft', () => {
  const script = src('Lib.html').replace(/^<script>|<\/script>\s*$/g, '');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`${script}; this.PlagxPreflight = PlagxPreflight;`, ctx);
  const result = ctx.PlagxPreflight.checkDraft('# Intro\n\nThis is is a test (Smith, 2020).\n\n# References\n\nLee, K. (2019). Planning.');
  const codes = result.issues.map((i) => i.code);
  assert.ok(codes.includes('repeated-word'));
  assert.ok(codes.includes('citation-no-reference'));
});

test('the sidebar includes every file it references', () => {
  for (const name of src('Sidebar.html').matchAll(/include\('(\w+)'\)/g)) {
    assert.ok(readFileSync(new URL(`../src/${name[1]}.html`, import.meta.url), 'utf8').length > 0, name[1]);
  }
});
