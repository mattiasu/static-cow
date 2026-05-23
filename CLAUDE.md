# Static Site Generator — Claude Instructions

## Project Overview
A Node.js static site generator that builds a blog from markdown files, served by a Cloudflare Worker.
- **Static build:** `npm run build` — compiles markdown → HTML into `dist/`
- **Static dev server:** `npm run dev` (via `build/dev.ts`) — watches and rebuilds static files only; no Worker, no D1
- **Full dev (Worker + assets):** `npx wrangler dev` — runs the Worker locally with D1 bindings and serves `dist/` as assets; requires `npm run build` first or in watch mode alongside
- **Deploy:** `npx wrangler deploy`
- **Language:** TypeScript (strict mode)
- **Output:** `dist/` — static HTML files, never edit manually

---

## Project Structure

```
blog/
├── build/               # Node.js build pipeline — runs at build time
│   ├── types.ts         # Shared types — no logic
│   ├── markdown-parser.ts
│   ├── html-generator.ts
│   ├── pipeline.ts      # Orchestration — wires all modules together
│   ├── search-indexer.ts
│   ├── search-bundler.ts
│   ├── sitemap-generator.ts
│   ├── css-minifier.ts
│   ├── build.ts         # Entry point only — sets dirs, calls runPipeline
│   └── dev.ts           # Dev server / watch mode
├── content/             # Markdown source files
│   ├── about.md
│   ├── privacy.md
│   └── *.md             # Blog posts
├── db/
│   └── schema.sql       # D1 schema — apply with wrangler d1 execute
├── dist/                # Build output — never edit manually
├── functions/           # Cloudflare Worker — runs server-side, not Node
│   ├── api/
│   │   ├── subscribe.ts # POST /api/subscribe — D1 insert with duplicate check
│   │   └── notify.ts    # POST /api/notify — send newsletter via Resend API
│   └── index.ts         # Worker entry point — routing + Env interface
├── web/                 # Browser-facing source — HTML templates, styles, scripts, and static assets
│   ├── assets/
│   │   ├── excalidraw/  # SVG diagrams, inlined at build time
│   │   ├── icons/
│   │   └── images/
│   ├── base.html
│   ├── homepage.html
│   ├── article.html
│   ├── page.html
│   ├── post-card.html
│   ├── search.ts        # Browser-side search script — bundled by esbuild, not Node
│   └── styles.css
├── CLAUDE.md
├── tsconfig.json
└── package.json
```

---

## Architecture — Keep Modules Single-Responsibility

| File | Responsibility |
|---|---|
| `build/types.ts` | Shared types and interfaces only — no logic |
| `build/markdown-parser.ts` | Parse frontmatter and markdown content into `Post` objects |
| `build/html-generator.ts` | Convert markdown strings to HTML; contains `renderTemplate` (pending extraction) |
| `build/pipeline.ts` | Orchestration — wires all build modules together; owns `SITE_URL` |
| `build/search-indexer.ts` | Strips markdown and writes `dist/search-index.json` |
| `build/search-bundler.ts` | Bundles `web/search.ts` into `dist/search.js` via esbuild |
| `build/sitemap-generator.ts` | Generates `dist/sitemap.xml` |
| `build/css-minifier.ts` | Minifies `web/styles.css` into `dist/styles.css` via clean-css |
| `build/build.ts` | Entry point only — sets up `Dirs`, calls `runPipeline` |
| `build/dev.ts` | Dev server and watch mode — no build logic |
| `web/search.ts` | Browser-side search script — compiled by esbuild, not Node; only `.ts` file permitted in `web/` |
| `web/` | HTML templates and static assets — never import or require these from TypeScript |
| `functions/index.ts` | Worker entry point — request routing and `Env` interface definition |
| `functions/api/subscribe.ts` | POST /api/subscribe — email validation, D1 insert, duplicate check |
| `functions/api/notify.ts` | POST /api/notify — auth token gate, D1 query, Resend batch send |
| `db/schema.sql` | D1 table definitions — apply with `wrangler d1 execute` |
| `dist/` | Build output — never edit manually |

**Rules:**
- New static build features get new modules in `build/`; wire them in `pipeline.ts`
- New API endpoints go in `functions/api/`; add routing in `functions/index.ts`
- Do not add business logic to `build.ts` or `dev.ts`
- Do not collapse modules — if unsure where something belongs, ask
- `web/` is for HTML templates, static assets, and browser scripts only — `web/search.ts` is the only `.ts` file permitted there (it targets the browser, not Node)
- `functions/` targets the Workers runtime — do not import Node built-ins there

---

## TypeScript Configuration

- **Strict mode is required:** `"strict": true` in `tsconfig.json` — never disable it or add `@ts-ignore` without a comment explaining why
- Target: Node.js (`"module": "commonjs"`, `"target": "ES2020"` or later)
- Compile output goes to `dist/` or a separate `compiled/` dir — not mixed with HTML templates in `web/`
- No implicit `any` — every parameter and return type must be explicit
- Prefer `interface` for object shapes, `type` for unions and aliases

---

## Core Types (defined in `build/types.ts`)

```ts
export interface Post {
  slug: string;
  title: string;
  date: string;        // Human-readable e.g. "12 May 2025"
  dateShort: string;   // e.g. "May 2025"
  dateISO: string;     // e.g. "2025-05-12"
  readingTime: string; // e.g. "4 min read"
  excerpt: string;
  intro: string;
  tags: string[];
  category: string;
  author: string;
  profileImage: string;
  content: string;     // Raw markdown body
}

export interface TemplateData {
  [key: string]: string | number | string[] | boolean | undefined;
}

export interface SearchEntry {
  slug: string;
  title: string;
  intro: string;
  tags: string[];
  date: string;        // dateShort format
  content: string;     // Markdown-stripped plain text for full-text search
}
```

Do not add properties to `Post` without updating this file and documenting the change in **Changelog**.

---

## Code Style

- JSDoc for **documentation** (describe intent, gotchas, examples)
- TypeScript for **types** (no JSDoc `@param` or `@returns` type annotations — TS handles that)
- Example of correct style:

```ts
/**
 * Converts raw markdown to an HTML string.
 * Does NOT sanitize input — never pass untrusted content directly.
 * Excalidraw images are inlined as raw SVG, not referenced by src.
 */
export function markdownToHtml(markdown: string): string {
  // ...
}
```

---

## Known Quirks — Preserve These Behaviours

- **Excalidraw:** `![excalidraw](file.svg)` inlines the SVG directly into a `<figure class="excalidraw">` — do not change to an `<img>` tag. Files are read from `assets/excalidraw/`
- **List wrapping:** Each contiguous block of `* `/ `- ` lines becomes its own `<ul>`; each contiguous block of `1. ` lines becomes its own `<ol>`. Temporary `data-list` attributes on `<li>` elements keep the two passes separate — removing them would reintroduce the bug where a single `<ul>` swallowed every `<li>` in the document.
- **Template renderer:** Handles `{{var}}`, `{{#if var}}...{{/if}}`, and `{{#each arr}}...{{/each}}` — keep these three cases clearly separated in the code
- **Static pages:** `about.md` and `privacy.md` in `content/` are treated as pages, not posts — they get their own template (`page.html`) and are not included in post listings
- **Search index stripping order:** In `search-indexer.ts`, fenced code blocks and Excalidraw tags must be stripped before other patterns — later regexes would otherwise match content inside those blocks and produce noise in the index
- **CSS minification:** `src/styles.css` is the source of truth; `dist/styles.css` is the minified output written at build time — never edit the dist version directly

---

## When Adding Features

### Static site features
1. Define or update types in `build/types.ts` first
2. Create a new module in `build/` if the feature is a distinct concern
3. Write the function signature and JSDoc before the implementation
4. Wire it into `pipeline.ts` last
5. Note any new quirks or edge cases in the **Known Quirks** section above

### API endpoints (Worker)
1. Create a handler file in `functions/api/` (e.g. `functions/api/contact.ts`)
2. Add the route in `functions/index.ts`
3. Add any new D1/binding to `wrangler.toml` and the `Env` interface in `functions/index.ts`
4. Test with `npx wrangler dev` — `npm run dev` does not run the Worker

## Environment Variables

Variables split between `wrangler.toml` (non-secret config) and Cloudflare secrets (sensitive values).

### `wrangler.toml` bindings (committed)
| Binding | Type | Purpose |
|---|---|---|
| `SUBSCRIBERS_DB` | D1 | Subscriber database |
| `ASSETS` | Assets | Serves `dist/` for all non-API routes |

### Cloudflare secrets (never committed — set via CLI)
| Secret | Command | Purpose |
|---|---|---|
| `RESEND_API_KEY` | `wrangler secret put RESEND_API_KEY` | Resend API authentication |
| `NOTIFY_TOKEN` | `wrangler secret put NOTIFY_TOKEN` | Bearer token protecting POST /api/notify |

---

## Changelog

_Track significant decisions and changes here so context is not lost between sessions._

- **Initial setup:** Migrated from JavaScript to TypeScript strict mode
- **Structure confirmed:** `build/` for build pipeline, `web/` for HTML templates + assets, `dist/` for output
- **Pipeline extracted:** `build.ts` is now a thin entry point; all orchestration moved to `pipeline.ts`
- **Search added:** `search-indexer.ts` builds `dist/search-index.json`; `search-bundler.ts` compiles `web/search.ts` → `dist/search.js` via esbuild; `SearchEntry` type added to `types.ts`
- **Sitemap added:** `sitemap-generator.ts` writes `dist/sitemap.xml` with static + post URLs
- **CSS minification added:** `css-minifier.ts` minifies via clean-css at build time
- **Worker added:** Cloudflare Worker in `functions/` handles API routes; `npx wrangler dev` is the dev command for anything involving the Worker
- **Worker moved:** Worker files relocated to `functions/`; `wrangler.toml` updated to `main = "./functions/index.ts"`
- **D1 migration:** Subscriber storage moved from KV to D1; schema at `db/schema.sql`; handlers reorganised into `functions/api/`; `/api/notify` endpoint added (Resend, batched, token-protected)
- **Pending:** Extract `renderTemplate` from `html-generator.ts` into `build/template-renderer.ts`
- **Restructured:** `scripts/` → `build/`, `src/` → `web/`, `assets/` moved into `web/assets/`