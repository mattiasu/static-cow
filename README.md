# addy.se

Personal blog by Mattias Uhlegaard. Thoughts on enterprise architecture, open source, and building things.

## How it works

A custom static site generator built in plain JavaScript — no Hugo, no Jekyll, no framework. Markdown content in, HTML out.

```
content/        → Markdown posts
src/            → HTML templates
assets/         → Images and static files
scripts/        → Build and dev tooling
dist/           → Generated output (not committed)
```

## Running locally

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

Output goes to `dist/`. This is generated. 

## Content

Posts are Markdown files in `content/`. The build pipeline handles parsing, templating, and tag generation.

## Notes

Built with an AI-assisted workflow using Claude. The content, architecture decisions, and writing are mine — Claude is the pair programmer.

© Mattias Uhlegard. All rights reserved.
