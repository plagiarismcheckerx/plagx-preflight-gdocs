# Plagx Draft Preflight for Google Docs

*A free academic writing tool by Plagiarism Checker X.*

**Plagx Draft Preflight is a free, open-source Google Docs add-on that checks your draft before you submit it.** Open the sidebar and check the whole document or a selection for word count and reading time, in-text citations against the reference list, punctuation and basic grammar. Click an issue to jump to it in the document. Use it as an **essay checker**, **word counter**, **citation checker** or **reference list checker** for essays, papers and articles.

- Checks run in the sidebar, in your browser: nothing is stored or sent anywhere
- Reads only the document you have open (`documents.currentonly`); never changes it
- APA and MLA in-text citations
- Same rules as the [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) library

**[Try the live demo →](https://plagiarismcheckerx.github.io/plagx-preflight/)**

## Use

1. Install **Plagx Draft Preflight** from the Google Workspace Marketplace.
2. In a Google Doc, open **Extensions → Plagx Draft Preflight → Check draft**.
3. Choose **Whole document** or **Selected text**, set word limits and citation style if you need them, and click **Check draft**.

Headings, paragraphs, list items and table cells are read in order. The reference list is the text after the first heading named References, Bibliography, Works Cited, Sources or similar; use a Docs heading style (Heading 1–6 or Title) for it, and put each reference in its own paragraph.

## Checks

| Group | Examples |
|---|---|
| Length & structure | Word, sentence and paragraph counts, reading time, word limits, long sentences and paragraphs |
| References | Citations with no entry in the reference list, references that are never cited |
| Punctuation | Unmatched quotes and brackets, double spaces, spacing around punctuation |
| Basic grammar | Repeated words, *a* / *an*, sentence capitals, common word confusions; optional passive-voice hints |

## Privacy

- **Permissions:** `documents.currentonly` (read the open document and select text in it) and `script.container.ui` (show the sidebar).
- **Data:** the text is checked in the sidebar and discarded when you close it. No accounts, tracking or network requests.

See the [privacy policy](PRIVACY.md) and [terms of service](TERMS.md).

## Development

Built with Apps Script and [clasp](https://github.com/google/clasp).

```bash
npm install
npm run build     # bundle plagx-preflight into src/Lib.html
npm test          # document reading, text selection and bundle tests
node scripts/preview.js --run   # preview.html: the sidebar in a normal browser, with sample text
npx clasp login
npx clasp create --type docs --title "Plagx Draft Preflight" --rootDir src   # once
npm run push      # build and upload to Apps Script
```

| Path | What it does |
|---|---|
| `src/Code.js` | Menu, sidebar, reading the document or selection, selecting an issue's text |
| `src/Sidebar.html`, `src/App.html`, `src/Styles.html` | The sidebar |
| `src/Lib.html` | The Plagx Preflight core, bundled from [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) (MIT) |
| `src/appsscript.json` | Apps Script manifest and permissions |

## Plagx Preflight - Free Draft & Grammar Checker

An open-source writing utility for students, researchers and developers. Check length, structure, citations, punctuation and basic grammar before you submit.

Developed by Plagiarism Checker X.

Plagx Preflight gives writing suggestions; it does not detect plagiarism or AI-generated text. For full document checks, explore [Text Similarity Detector](https://plagiarismcheckerx.com/?utm_source=plagx-preflight-gdocs-readme) and its [AI Content Detector](https://plagiarismcheckerx.com/ai-content-detector?utm_source=plagx-preflight-gdocs-readme).

## License

MIT © Plagiarism Checker X
