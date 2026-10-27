# QA Scout

[![Português (Brasil)](https://img.shields.io/badge/Portugu%C3%AAs%20%28Brasil%29-296F82?style=for-the-badge)](README.md) [![Português (Portugal)](https://img.shields.io/badge/Portugu%C3%AAs%20%28Portugal%29-296F82?style=for-the-badge)](README.pt-PT.md) [![English](https://img.shields.io/badge/English-3DF5A7?style=for-the-badge)](README.en.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-296F82?style=for-the-badge)](README.es.md)

**Explore with a mission. Come back with evidence.**

QA Scout is a companion for session-based exploratory testing (SBTM). You write the charter, start the timer, log what you find at the pace of exploration and, at the end, walk away with a report ready for the team.

🔗 **Open it:** https://azevedothamirest.github.io/qa-scout/

[![Tests](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml?query=event%3Apull_request)

> **Open beta.** First time? Follow the [tutorial](docs/tutorial.md) (about 10 minutes, in Portuguese). Tried it? [Tell us how it went](https://github.com/azevedothamirest/qa-scout/issues/new/choose): bugs, ideas and criticism are very welcome.

## Why it exists

Exploratory testing is often invisible work: it finds the most interesting bugs but leaves little trace. QA Scout gives it structure without turning it into a script, and turns the session into evidence that Product and Dev can read.

## Features

- **Charter in Elisabeth Hendrickson's model:** *Explore ___ with ___ to discover ___*, plus area, environment and a free duration in minutes.
- **Timer with pause**, progress bar and overtime warning.
- **Typed notes:** bug, question, idea, risk and observation, each with the exact minute of the session.
  - `Alt+1` to `Alt+5` switch the type, `Ctrl+Enter` saves.
  - Command prefixes: `/bug`, `/question`, `/idea`, `/risk`, `/obs`.
  - Screenshots pasted with `Ctrl+V` or attached, compressed automatically.
- **Heuristics:** 18 cards with tours inspired by James Whittaker and everyday cases (masked fields, accents, currency, time zones).
- **Debriefing:** time split into Test, Bug and Setup (TBS), areas covered and next sessions.
- **Automatic capture** in the test browser: clicks, filled fields and visited pages become observations with a screenshot. You confirm, edit (text and type) or delete each one; only reviewed notes go into the report.
- **Console and network errors** become notes to review: JavaScript errors and connection failures or 5xx arrive as bugs; `console.error` and 4xx as risks.
- **Steps to reproduce** in one click: when you edit a note, QA Scout builds the list from the clicks, fields and pages that came before it.
- **`Alt+Shift+M`** in the system under test marks the moment with a screenshot without leaving the screen. **`Alt+1` to `Alt+5`** do the same with the type already set (bug, question, idea, risk, observation).
- **Capture on from the start** in the extension: the tab of the system under test is followed as soon as the session starts; other tabs join with **Follow the current tab**.
- **Report** in Markdown to paste into Jira, GitHub, Notion or Slack, **Copy bugs only** to open tickets, and PDF export from the browser.
- **Copy bug** ready for Jira or GitHub: title, environment, browser, page, steps to reproduce, actual and expected result, and the console and network errors from the same minute.
- **Session backup** in JSON: download and import from the history (repeated sessions are ignored).
- **Light and dark theme**, with a toggle.
- **Four languages:** Brazilian Portuguese, European Portuguese, English and Spanish, from the globe in the header. On the first visit it follows the browser language; your choice is saved, and the automatic capture writes notes in the same language.
- **Searchable history** by area, charter or note content.

## Chrome extension

QA Scout runs in Chrome's side panel, next to the system under test:

1. Install it from the **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** and click the QA Scout icon to open the panel.
2. Start the session and, on the page of the system under test, click **Follow the current tab**. The first time, Chrome asks for access to sites: the tab screenshot needs it, and nothing is requested at install. Tabs opened from it join too.
3. Explore: clicks, fields, pages, errors and network failures in those tabs become notes to review. Other tabs are not recorded.

Because it is a new extension, Chrome with **Enhanced protection** may show "Proceed with caution" at install. It is the standard warning for developers new to the store and fades over time; click **Continue to install**.

To try a version not yet published: run `npm run pacote`, unzip the `.zip` from `dist/`, open `chrome://extensions`, turn on **Developer mode** and click **Load unpacked**. The publishing steps are in [`docs/chrome-web-store.md`](docs/chrome-web-store.md).

## Test browser: one command and done

Nothing to install in your Chrome. With Node installed:

```bash
npx github:azevedothamirest/qa-scout https://address-of-the-system-under-test
```

Or, with the project cloned: `npm install` and then `npm run navegador -- https://address-of-the-system-under-test`.

It opens a separate test browser, with the QA Scout panel in a window on the left and the system on the right. There, **every tab is followed**: start the session and explore, clicks become observations with a screenshot (at most 1 per second, with the clicked point marked). The value typed into fields is never read or stored, and a paused session records nothing. Your everyday Chrome is not touched. The profile lives in `~/.qa-scout/perfil` and keeps logins between sessions. The first time, the command downloads Chromium on its own.

## Explore with Claude (MCP)

QA Scout has an [MCP](https://modelcontextprotocol.io) server so **Claude can run the exploratory session with you**: you give the mission, it opens the test browser, reads the screen, clicks, fills in, logs what it finds and hands back the report. The capture records everything as it would for you, and the session stays in the history for review.

**It runs in your computer's terminal**, in Claude Code or Claude Desktop (Node.js 18+). It does not work on claude.ai in the browser or inside the extension, which only explains how to use it in the **MCP** tab.

```bash
claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp
claude mcp list   # qa-scout connected
```

Then ask as you would write a charter, with address and time:

> Use QA Scout for a 20-minute exploratory session on https://staging.mystore.com: explore the checkout, with coupons and card payments, to discover wrong charges. Log what you find and show me the report.

Use only test environments and test data: Claude reads the text of the pages it visits, while the session and screenshots stay on your computer. Claude Desktop setup, more request examples, tools, privacy and troubleshooting: **[MCP guide](docs/mcp.md)** (in Portuguese).

## Privacy

Full policy: [`privacidade.en.html`](privacidade.en.html).

Everything is saved in the user's browser: `localStorage` on the web version and the local storage of the extension and test browser. No server, no account, no data sent anywhere.

## Running locally

```bash
npm install
npm start          # http://localhost:4173
```

No framework and no build: what is in the repository is what runs. `npm run pacote` builds the `.zip` for the Chrome Web Store.

## Project structure

```
index.html          page structure (site, extension panel and test browser)
app.css             look: color tokens, components and report printing
app.js              the application, in plain JavaScript
i18n.js, i18n/      languages: language switch and dictionaries (pt-PT, en, es)
_locales/           extension name and description in each language
privacidade*.html   privacy policy (GitHub Pages), one file per language
manifest.json       Chrome extension manifest (Manifest V3)
extensao/           automatic capture (service worker, content script, page script)
icones/             extension icons
bin/qa-scout.js     command that opens the test browser
bin/mcp.js          MCP server for Claude to run the session (qa-scout mcp)
scripts/            development utilities (packaging for the store)
tests/              Playwright e2e tests and the fake store used in them
docs/               tutorial, scope and roadmap, Chrome Web Store material
```

Want to contribute? See the [contribution guide](CONTRIBUTING.md) (in Portuguese).

## Tests

The e2e suite uses **Playwright** and runs on every pull request on GitHub Actions (the regression suite), in three profiles: desktop, mobile (Pixel 7) and test browser (real Chromium with the capture loaded).

```bash
npx playwright install chromium
npm test
npm run test:report
```

## Next steps

- [ ] Open a bug in Jira or Azure DevOps straight from the note
- [ ] Session summary and scenario suggestions with AI
- [ ] Accumulated metrics by area
- [ ] Pair sessions

---

Made by [Thamires Azevedo](https://azevedothamirest.github.io) · Senior QA · [@qa.thami](https://www.instagram.com/qa.thami/)
