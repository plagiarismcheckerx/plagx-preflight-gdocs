/**
 * Plagx Draft Preflight for Google Docs.
 *
 * The server side only reads the open document (or the selection) as plain text and
 * selects text when you click an issue. The checks run in the sidebar, in your browser.
 * Nothing is stored or sent anywhere.
 *
 * Scopes: documents.currentonly (this document only) and script.container.ui (the sidebar).
 */

/** Adds the menu when a document is opened. */
function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Check draft', 'showSidebar')
    .addToUi();
}

/** Runs onOpen right after the add-on is installed. */
function onInstall(e) {
  onOpen(e);
}

/** Opens the sidebar. */
function showSidebar() {
  const html = HtmlService.createTemplateFromFile('Sidebar')
    .evaluate()
    .setTitle('Plagx Draft Preflight');
  DocumentApp.getUi().showSidebar(html);
}

/** Includes another HTML file's content in a template. */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/**
 * Plain text of one body element: headings become "# Heading", tables become one
 * paragraph per non-empty cell, everything else is its text. Returns a list of paragraphs.
 */
function elementParagraphs_(element) {
  const type = element.getType();
  const T = DocumentApp.ElementType;
  if (type === T.PARAGRAPH) {
    const text = element.asParagraph().getText().trim();
    if (!text) return [];
    const heading = element.asParagraph().getHeading();
    return [heading && heading !== DocumentApp.ParagraphHeading.NORMAL ? `# ${text}` : text];
  }
  if (type === T.LIST_ITEM) {
    const text = element.asListItem().getText().trim();
    return text ? [text] : [];
  }
  if (type === T.TABLE) {
    const out = [];
    const table = element.asTable();
    for (let r = 0; r < table.getNumRows(); r++) {
      const row = table.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) {
        const text = row.getCell(c).getText().trim();
        if (text) out.push(text);
      }
    }
    return out;
  }
  return [];
}

/** Paragraph text of the whole document body, joined with blank lines. */
function getDocumentText() {
  const body = DocumentApp.getActiveDocument().getBody();
  const paragraphs = [];
  for (let i = 0; i < body.getNumChildren(); i++) {
    paragraphs.push(...elementParagraphs_(body.getChild(i)));
  }
  return paragraphs.join('\n\n');
}

/** Text of the current selection, or '' if nothing is selected. */
function getSelectionText() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) return '';
  const paragraphs = [];
  for (const range of selection.getRangeElements()) {
    const element = range.getElement();
    if (range.isPartial() && element.editAsText) {
      const text = element.asText().getText().slice(range.getStartOffset(), range.getEndOffsetInclusive() + 1).trim();
      if (text) paragraphs.push(text);
    } else {
      paragraphs.push(...elementParagraphs_(element));
    }
  }
  return paragraphs.join('\n\n');
}

/** Escapes text for findText(), which takes a regular expression. */
function escapeRegex_(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Selects the `occurrence`-th (0-based) match of `snippet` in the body and scrolls to it.
 * Returns true if it was found.
 */
function selectText(snippet, occurrence) {
  const needle = String(snippet || '').split('\n')[0].trim();
  if (!needle || needle.length > 500) return false;
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const pattern = escapeRegex_(needle);
  let found = body.findText(pattern);
  for (let i = 0; found && i < (occurrence || 0); i++) found = body.findText(pattern, found);
  if (!found) found = body.findText(pattern);
  if (!found) return false;
  const range = doc.newRange().addElement(found.getElement(), found.getStartOffset(), found.getEndOffsetInclusive()).build();
  doc.setSelection(range);
  return true;
}
