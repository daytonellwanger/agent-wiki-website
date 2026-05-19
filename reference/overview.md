# Overview

## Goal

A website that renders the agent-wiki markdown collection as a navigable, multi-page wiki. Each `.md` file becomes its own page. Inter-document links work. A persistent left sidebar lists all pages organized by section.

## Tech Stack

**Next.js** with static generation.

Rationale: gives full control over layout, routing, and markdown processing without the conventions of an opinionated docs framework like Docusaurus. Static generation means no server required — the output is a folder of HTML files that can be hosted anywhere.

## Content Source

The markdown files live in the `agent-wiki` repo. The website reads them at build time via relative filesystem paths (e.g., `../agent-wiki`). No copying or symlinking — the source repo is the source of truth.

Directory structure of agent-wiki:
```
agent-wiki/
  index.md
  overview.md
  concepts/
  tools/
  opinions/
  questions/
  log.md
```

## Routing

Each `.md` file maps to a URL path derived from its path relative to the agent-wiki root:

| File | URL |
|------|-----|
| `index.md` | `/` |
| `overview.md` | `/overview` |
| `concepts/agentic-loop.md` | `/concepts/agentic-loop` |
| `tools/mcp.md` | `/tools/mcp` |

Implemented via a single dynamic route: `app/[[...slug]]/page.tsx`. At build time, [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) walks the filesystem and emits one entry per `.md` file.

## Link Resolution

Markdown files use relative links like `[Memory](concepts/memory.md)` and `[log.md](log.md)`. A small remark plugin visits every `link` node in the AST and rewrites `.md` hrefs to root-relative URL paths (stripping the extension, prepending `/`). This runs inside the existing remark pipeline — no additional dependencies beyond `unist-util-visit`, which remark already pulls in transitively. No changes are needed to the source markdown files.

## Navigation Sidebar

Built at build time by scanning the agent-wiki directory tree. Sections correspond to top-level subdirectories; their order matches the order they appear in `index.md` (Concepts, Tools, Opinions, Questions). Top-level files (index, overview, log) appear above the sections.

Page titles come from the first `# Heading` in the file (or the filename as a fallback).

The sidebar is split into two components to satisfy Next.js Server/Client constraints:
- `Sidebar.tsx` — Server Component. Reads the filesystem, builds the nav tree, passes it as props to `SidebarNav`.
- `SidebarNav.tsx` — Client Component (`'use client'`). Receives the nav tree as props and uses `usePathname()` to highlight the active page.

This keeps filesystem access on the server while allowing the active-link highlight to react to the current URL.

## Component Structure

```
app/
  layout.tsx          — root layout: sidebar + content area side-by-side
  [[...slug]]/
    page.tsx          — loads and renders the markdown for the current slug
lib/
  content.ts          — filesystem helpers: list all pages, read a page, build nav tree
  markdown.ts         — markdown-to-HTML pipeline (remark + link-rewriting plugin)
components/
  Sidebar.tsx         — Server Component; builds nav tree, passes to SidebarNav
  SidebarNav.tsx      — Client Component; renders nav tree, highlights active page via usePathname()
  MarkdownContent.tsx — renders the HTML string, applies prose styles
```

## Syntax Highlighting

Code blocks are highlighted using `shiki`. It runs at build time inside the remark pipeline — a `remark-shiki` (or equivalent) step replaces fenced code blocks with pre-colored HTML before the page is emitted. No JavaScript is sent to the browser for highlighting.

## Styling

Tailwind CSS with the `@tailwindcss/typography` plugin (`prose` class) for markdown content. The layout is a fixed-width sidebar (e.g., 260px) with a scrollable content area filling the rest of the viewport.

## Build & Hosting

`next build` produces a static export (`output: 'export'` in `next.config.ts`). The result is a plain `out/` directory. Can be hosted on GitHub Pages, Netlify, Vercel, or any static host with no configuration.

## Key Constraints

- **No runtime** — everything is static. No API routes, no server components that fetch at request time.
- **Source stays clean** — the agent-wiki repo is read-only from the website's perspective.
