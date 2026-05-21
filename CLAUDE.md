# Static Site Generator — Claude Instructions

## Project Overview
A Node.js static site generator that builds a blog from markdown files.
- **Entry point:** `npm run build`
- **Dev server:** `npm run dev` (via `scripts/dev.ts`)
- **Language:** TypeScript (strict mode)
- **Output:** `dist/` — static HTML files, never edit manually

---

## Project Structure

```
blog/
├── assets/              # Static assets — copied to dist/ at build time
│   ├── excalidraw/      # SVG diagrams, inlined at build time
│   ├── icons/
│   └── images/
├── content/             # Markdown source files
│   ├── about.md
│   ├── privacy.md
│   └── *.md             # Blog posts
├── dist/                # Build output — never edit manually
├── scripts/             # TypeScript build pipeline
│   ├── types.ts         # Shared types — no logic
│   ├── markdown-parser.ts
│   ├── html-generator.ts
│   ├── template-renderer.ts   # To be extracted from build.ts
│   ├── build.ts         # Orchestration only
│   └── dev.ts           # Dev server / watch mode
├── src/                 # HTML templates — not TypeScript, do not move
│   ├── base.html
│   ├── homepage.html
│   ├── article.html
│   ├── page.html
│   ├── post-card.html
│   └── styles.css
├── CLAUDE.md
├── tsconfig.json
└── package.json
```

---

## Architecture — Keep Modules Single-Responsibility

| File | Responsibility |
|---|---|
| `scripts/types.ts` | Shared types and interfaces only — no logic |
| `scripts/markdown-parser.ts` | Parse frontmatter and markdown content into `Post` objects |
| `scripts/html-generator.ts` | Convert markdown strings to HTML |
| `scripts/template-renderer.ts` | `{{var}}` template engine (`#if`, `#each`, simple vars) |
| `scripts/build.ts` | Orchestration only — wires modules together, no business logic |
| `scripts/dev.ts` | Dev server and watch mode — no build logic |
| `src/` | HTML templates — never import or require these from TypeScript |
| `dist/` | Build output — never edit manually |

**Rules:**
- New features get new modules in `scripts/`; wire them in `build.ts`
- Do not add business logic to `build.ts` or `dev.ts`
- Do not collapse modules — if unsure where something belongs, ask
- `src/` is for HTML templates only — do not add `.ts` files there

---

## TypeScript Configuration

- **Strict mode is required:** `"strict": true` in `tsconfig.json` — never disable it or add `@ts-ignore` without a comment explaining why
- Target: Node.js (`"module": "commonjs"`, `"target": "ES2020"` or later)
- Compile output goes to `dist/` or a separate `compiled/` dir — not mixed with HTML templates in `src/`
- No implicit `any` — every parameter and return type must be explicit
- Prefer `interface` for object shapes, `type` for unions and aliases

---

## Core Types (defined in `scripts/types.ts`)

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

---

## When Adding Features

1. Define or update types in `scripts/types.ts` first
2. Create a new module in `scripts/` if the feature is a distinct concern
3. Write the function signature and JSDoc before the implementation
4. Wire it into `build.ts` last
5. Note any new quirks or edge cases in the **Known Quirks** section above

---

## Changelog

_Track significant decisions and changes here so context is not lost between sessions._

- **Initial setup:** Migrated from JavaScript to TypeScript strict mode
- **Structure confirmed:** `scripts/` for build pipeline, `src/` for HTML templates, `dist/` for output
- **Pending:** Extract template renderer from `build.ts` into `scripts/template-renderer.ts`