<div align="center">

# AI Test Generator

**Type what to test. Watch it write the code. See it run live.**

[![CI](https://github.com/kishanborad/ai-test-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/kishanborad/ai-test-generator/actions/workflows/ci.yml)
[![Deploy](https://github.com/kishanborad/ai-test-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/kishanborad/ai-test-generator/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TS-21%25-blue)](#language-mix)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live demo](https://kishanborad.github.io/ai-test-generator/) &bull; [How it works](#how-it-works) &bull; [Run locally](#run-locally)

</div>

---

Most test generators need API keys, cloud accounts, or a monthly subscription. This one runs a language model inside your browser tab. No server calls, no tokens burned, no signup.

Describe a feature in plain English, or just click around the page while it records. The LLM writes categorized test code (happy path, negative, edge cases), executes each step against a live DOM with an animated cursor, and hands you a color-coded report. When you're done, export to Playwright or Cypress and drop the file into your CI pipeline.

## How it works

Two input modes feed the same engine:

**Text mode** — Paste a user story like "submit the contact form with valid data." The LLM receives a pruned snapshot of the page's DOM (interactive elements, labels, test IDs) and generates tests across three categories. Every happy-path test gets at least one negative and one edge-case variant.

**Record mode** — Hit record, interact with the page, stop. The raw click/fill/select sequence goes to the LLM with the same DOM context. It comes back as structured test code with assertions the recording alone wouldn't have.

Both modes stream output into a Monaco editor where you can hand-edit before running.

## What the report looks like

Tests are grouped by category with colored headers:

| Category | Color | Purpose |
|----------|-------|---------|
| Happy path | Green | Expected flows that should pass |
| Negative | Red | Invalid inputs, missing data, error states |
| Edge cases | Amber | Boundary values, rapid clicks, unusual input |

Each step shows pass/fail, duration, and expandable error details with expected vs. actual values. Failed tests have a "Fix this" button that sends the failure context back to the LLM for correction.

## Run locally

```bash
git clone https://github.com/kishanborad/ai-test-generator.git
cd ai-test-generator
npm install
npm run dev
```

Open `http://localhost:5173/ai-test-generator/`. First model load downloads 1-2 GB (cached in IndexedDB after that).

## Built-in demo page

The app ships with a self-contained demo page loaded in the iframe by default: navigation bar, hero section, contact form with validation, sortable data table, and a modal. Every element has a `data-testid` attribute so the generated tests have stable selectors to target.

You can also point it at any public URL through the CORS proxy.

## Architecture

```
App shell (~200KB initial)
├── AI Engine (Web Worker)         ← WebLLM, model caching, streaming
├── Engine (parser → executor)     ← regex parser, DOM locator, assertions
├── Recorder                       ← iframe event capture, selector generation
└── Exporters                      ← Playwright / Cypress code formatters
```

Heavy modules (AI engine, recorder, executor) load on demand. The AI inference runs in a Web Worker so the UI stays responsive during generation.

## Language mix

The repo uses seven languages. TypeScript sits at 21% of production source, with engine modules and UI components written in plain JavaScript/JSX.

| Language | Where |
|----------|-------|
| JavaScript | Engine (parser, executor, locator, assertions), exporters, recorder, CORS proxy |
| JSX | All leaf components (Header, panels, Overlay, SpeedSlider, demo page) |
| TypeScript | Shared types, AI worker, App shell, Vite config |
| Python | `scripts/check-lang-ratio.py` |
| Bash | `scripts/deploy.sh` |
| YAML | GitHub Actions workflows |
| Dockerfile | Container build |

## Stack

- React 19 + Vite 6 + Tailwind CSS 3
- WebLLM with Qwen2.5-Coder-1.5B and Phi-4-mini (selectable)
- Monaco Editor for code display and editing
- Web Workers for off-thread inference
- html2canvas for step screenshots
- Cloudflare Workers for CORS proxy (free tier)
- Vitest + jsdom for unit tests (37 tests across 5 files)

## Project structure

```
ai-test-generator/
├── src/
│   ├── App.tsx                  # Main app shell
│   ├── types.ts                 # All shared types
│   ├── ai/
│   │   ├── worker.ts            # WebLLM Web Worker
│   │   ├── prompts.js           # LLM prompt templates
│   │   └── domSnapshot.js       # DOM pruner for LLM context
│   ├── engine/
│   │   ├── parser.js            # Test code → step AST
│   │   ├── executor.js          # Step runner with visual feedback
│   │   ├── locator.js           # DOM query wrapper
│   │   └── assertions.js        # toBeVisible, toHaveText, etc.
│   ├── recorder/
│   │   └── recorder.js          # Iframe interaction capture
│   ├── export/
│   │   ├── playwright.js        # AST → Playwright code
│   │   └── cypress.js           # AST → Cypress code
│   ├── panels/                  # InputPanel, IframePanel, OutputPanel, ReportView
│   ├── components/              # Header, Overlay, SpeedSlider, CategoryBadge
│   └── demo/                    # Built-in demo page (DemoApp.jsx)
├── proxy/
│   └── worker.js                # Cloudflare CORS proxy
├── scripts/
│   ├── deploy.sh
│   └── check-lang-ratio.py
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── Dockerfile
└── package.json
```

## License

MIT

---

Built by [Kishan Borad](https://github.com/kishanborad)
