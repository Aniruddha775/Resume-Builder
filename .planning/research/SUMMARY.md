# Research Summary

**Project:** Rese (AI Resume Builder)
**Researched:** 2026-04-10

## Stack Recommendation

Key changes from original DESIGN.md assumptions:

| Original | Updated | Why |
|----------|---------|-----|
| Next.js 14+ | **Next.js 16.2.x** | Current stable. Turbopack default, React 19 required. Greenfield = no migration pain. |
| Tiptap (unversioned) | **Tiptap v3 (3.22.x)** | Stable. JSX component, SSR support (critical for Next.js), markdown I/O. |
| "OpenAI/Claude API" directly | **Vercel AI SDK v6** | BYOK across providers without N integrations. `generateObject()` with Zod schemas. |
| Clerk or NextAuth | **Better Auth v1.6.x** | Open source, self-hosted, aligns with "truly free" ethos. Passkeys, 2FA, OAuth built in. |
| Prisma or Drizzle | **Drizzle ORM** | 7.4KB bundle (vs ~200KB Prisma), better for serverless cold starts, SQL-like control for JSON Merge Patch. |
| No state management specified | **Zustand with slices** | Selective subscriptions prevent editor re-render when only score changes. |
| Tailwind (unversioned) | **Tailwind CSS v4** | CSS-first config (`@theme` directive). No `tailwind.config.js`. |

## Table Stakes Features

Must ship in M1 or Rese feels incomplete vs competitors:
- Resume editor with structured sections
- At least 1 polished ATS-safe template
- PDF export (free, no paywall, no watermark)
- AI-powered content generation (keyword extraction, bullet rewrites)
- Live ATS score feedback

## Differentiating Features

What makes Rese worth existing:
- **Live ATS scoring** — only Rezi (paid, $29/mo) offers this. No open source tool does.
- **Master resume + per-job variants** — genuine gap in open source. Teal (paid) has version management but no open source tool does structured variant workflow.
- **Truly free** — free PDF export is the community trust signal. #1 user complaint about competitors is paywall bait-and-switch.

## Architecture Highlights

- **Zustand slices pattern**: resume, jobDescription, keywords, score, ui slices with selective subscriptions
- **One-directional Tiptap data flow**: Editor -> Store only. Never store -> editor (causes cursor jumps, undo corruption)
- **Imperative PDF rendering**: `pdf().toBlob()` with 800ms debounce, displayed in iframe. Not in React tree (blocks 100-500ms)
- **Two-stage ATS scoring**: LLM extracts keywords once (2-5s), local deterministic scoring on every edit (<5ms)
- **Storage adapter pattern**: Interface in M1 (localStorage), swap to Drizzle in M2 without UI changes
- **Build order**: Types+Store -> Layout -> Editor+PDF+Scoring (parallel) -> JD+AI -> Integration

## Critical Warnings

1. **Tiptap SSR**: Set `immediatelyRender: false` and `shouldRerenderOnTransaction: true` day one or face hydration errors with Next.js
2. **Bidirectional editor binding**: Most common Tiptap mistake. Will cause cursor jumps and infinite loops. One-directional only.
3. **PDF rendering in React tree**: Blocks main thread 100-500ms. Must use imperative API.
4. **Tailwind v4 config**: No `tailwind.config.js` (v3 pattern). Use `@theme` directive in CSS.
5. **AI SDK integration early**: Use Vercel AI SDK from phase 1, not direct OpenAI calls. Avoids rewrite for BYOK.

## Roadmap Implications

- M1 has zero backend dependencies (Zustand + localStorage + client-side PDF + AI SDK with user keys)
- Editor, PDF preview, and scoring engine can be built in parallel once types + store are in place
- AI suggestion layer depends on both scoring (needs KeywordSet) and editor (needs Tiptap commands)
- Multi-variant system (M2) is highest-risk component due to three-way merge complexity
- Template count (1 in M1) is fine — quality over quantity validated by OpenResume's success with 1 template

---
*Research synthesis for: Rese*
*Synthesized: 2026-04-10*
