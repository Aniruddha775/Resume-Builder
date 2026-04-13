# Rese — AI Resume Builder

## Before writing any code

Read `DESIGN.md` first. It contains the complete design document, data model, ATS scoring algorithm, tech stack decisions, and implementation roadmap. Every architectural decision has already been made. Follow it.

## Project Overview

Rese is an open source AI-powered resume builder with live ATS scoring and a master resume + per-job variant workflow. See DESIGN.md for full context.

## Tech Stack

- Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- Tiptap for the resume editor
- react-pdf for live PDF preview
- Custom two-stage ATS scoring engine (LLM keyword extraction + local deterministic scoring)
- PostgreSQL via Prisma (Milestone 2)
- NextAuth.js or Clerk for auth (Milestone 2)

## Implementation Order

Do NOT skip ahead. Build in this order:

1. **Milestone 1a:** Scaffold Next.js, three-panel layout, JD input with keyword extraction
2. **Milestone 1b:** Resume editor with Tiptap, structured sections, live PDF preview
3. **Milestone 1c:** ATS scoring engine (keyword matching, formatting checks, live score)
4. **Milestone 1d:** AI suggestion layer (inline suggestions for missing keywords)
5. **Milestone 1e:** First template, PDF export, deploy to Vercel
6. **Milestone 2a:** Backend, auth, database, save/load
7. **Milestone 2b:** Master resume + variant system, dashboard
8. **Milestone 2c:** More templates, resume import
9. **Milestone 2d:** Polish, docs, open source launch

## Key Architectural Rules

- ATS scoring is 100% local and deterministic. No LLM calls in the scoring loop.
- LLM is used only for: (1) one-time keyword extraction from job descriptions, (2) async suggestion generation on user request.
- Milestone 1 has no backend. All data in localStorage.
- PDF export must be ATS-friendly: single column, text-selectable, standard headings, no images.
- Variants use JSON Merge Patch (RFC 7396) on top of a frozen master snapshot.
- The app must work without an API key (manual editor + PDF export). AI features degrade gracefully.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Rese**

Rese is an open source AI-powered resume builder that combines beautiful UI, genuinely smart AI, and live ATS scoring with a unique master resume + per-job variants workflow. Users paste a job description, edit their resume in a three-panel editor with real-time ATS score feedback, and export clean ATS-friendly PDFs. Nobody in the open source space offers this specific combination.

**Core Value:** Live ATS scoring that updates as you type, powered by a two-stage engine (one-time LLM keyword extraction + local deterministic scoring), making resume optimization feel like a game instead of a chore.

### Constraints

- **License**: MIT or similar — must be truly open source
- **Cost**: Zero paywall on core features (editor, scoring, PDF export). No bait-and-switch pricing.
- **AI API**: User brings own API key for v1 (BYOK). Hosted option with credits deferred to monetization phase.
- **ATS honesty**: No fake "95% guaranteed" claims. Score reflects real keyword matching and formatting compliance.
- **Tech stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Tiptap editor, react-pdf. See DESIGN.md for full stack.
- **Accessibility**: WCAG 2.1 AA compliance. Keyboard navigable, screen reader friendly.
- **Milestone 1 = no backend**: All data in localStorage. Backend added in Milestone 2.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why This, Why Now |
|------------|---------|---------|-------------------|
| **Next.js** | 16.2.x | Full-stack framework | The standard React framework in 2026. v16 ships Turbopack as default bundler (10x faster HMR, 2-5x faster builds), stable App Router, React 19 required. SSR for SEO on landing/marketing pages, API routes for LLM proxy in Milestone 2. Greenfield = start on latest, no migration cost. |
| **React** | 19.x | UI library | Required by Next.js 16. Brings useActionState (replaces useFormState), improved Suspense, Server Components stable. |
| **TypeScript** | 5.7+ | Type safety | Non-negotiable for a project with structured resume data, Zod schemas, and LLM response validation. Next.js 16 has first-class TS support. |
| **Tailwind CSS** | 4.2.x | Styling | v4 is a ground-up rewrite with CSS-first config (no more tailwind.config.js), native cascade layers, ~35% faster builds. Webpack plugin in 4.2 means Turbopack compatibility is clean. The ecosystem standard for utility-first CSS in 2026. |
| **Tiptap** | 3.x (3.22+) | Rich text resume editor | The right choice and now better than when originally proposed. v3 adds declarative `<Tiptap>` JSX component, markdown I/O, improved SSR (critical for Next.js), and content migrations. Extensible with custom extensions for inline AI decorations, keyword highlighting, and structured resume sections. ProseMirror foundation means full control over document schema. |
| **Zustand** | 5.0.x | Client state management | 3KB gzipped, no boilerplate, store-based model fits Rese perfectly: one store for resume state, one for ATS score, one for JD keywords. Centralized approach is right for interconnected state (editing a bullet must trigger score recomputation). Zustand over Jotai because resume state is deeply connected, not independent atoms. |
| **Zod** | 4.3.x | Schema validation | TypeScript-first runtime validation. Defines resume data model once, validates localStorage reads, validates LLM API responses via zodResponseFormat. 2x faster than v3. The standard in the ecosystem -- works with AI SDK, React Hook Form, and tRPC. |
### AI Integration
| Technology | Version | Purpose | Why This, Why Now |
|------------|---------|---------|-------------------|
| **Vercel AI SDK** | 6.x (`ai` package) | LLM provider abstraction | The critical decision. Do NOT call OpenAI/Claude SDKs directly. AI SDK 6 provides a single `generateObject()` / `generateText()` API that works with OpenAI, Claude, Gemini, Mistral, Groq -- user picks their provider, you write code once. Structured output with Zod schemas built in. Streaming support for suggestion generation. This is what makes BYOK viable across multiple providers without maintaining N different integrations. |
| **@ai-sdk/openai** | latest | OpenAI provider | Install alongside core `ai` package. Provider for GPT-4o, GPT-4o-mini. |
| **@ai-sdk/anthropic** | latest | Anthropic provider | Provider for Claude Sonnet/Haiku. Users choose their preferred LLM. |
### PDF Stack
| Technology | Version | Purpose | Why This, Why Now |
|------------|---------|---------|-------------------|
| **@react-pdf/renderer** | 4.4.x | PDF generation + export | Generates PDFs programmatically from React components. Produces real PDF primitives (not HTML-to-PDF conversion), so text is genuinely selectable and parseable by ATS systems. You define resume templates as React components with `<Document>`, `<Page>`, `<View>`, `<Text>` -- same mental model as building UI. This is the PDF *creation* library. |
| **react-pdf** | 10.4.x | PDF preview display | Renders PDF blobs in the browser for the live preview panel. Takes the output from @react-pdf/renderer and displays it. This is the PDF *viewing* library. Different package, complementary purpose. |
| **unpdf** | latest | PDF text extraction (M2) | For resume import in Milestone 2. Modern replacement for pdf-parse (which is unmaintained). Works in Node.js and edge runtimes. Wraps pdf.js with a clean API. PDF parsing is inherently lossy for resumes -- this is best-effort import with manual correction UI. |
### Database + Auth (Milestone 2)
| Technology | Version | Purpose | Why This, Why Now |
|------------|---------|---------|-------------------|
| **Drizzle ORM** | 0.45.x | Database ORM | Over Prisma. ~7.4KB gzipped (vs Prisma's much larger client), zero runtime dependencies, dramatically faster cold starts on Vercel serverless. SQL-like TypeScript API means you write queries that map directly to SQL -- no magic query engine. For Rese's relatively simple relational model (users, resumes, variants, job descriptions), Drizzle's lightweight approach is the right fit. Prisma 7 closed the performance gap but Drizzle remains better for serverless/edge. |
| **drizzle-kit** | latest | Migrations + studio | Schema introspection, migration generation, visual database browser. Companion tool for Drizzle ORM. |
| **PostgreSQL** | 16+ | Database | Standard relational database. JSON/JSONB columns for resume sections and variant overrides (JSON Merge Patch). Full-text search for future features. Use Neon (serverless Postgres) for deployment -- free tier, HTTP-based driver works on edge, scales to zero. |
| **@neondatabase/serverless** | latest | Postgres driver | Neon's serverless driver for Drizzle. Works over HTTP (no persistent connections needed), compatible with Vercel Edge Functions. |
| **Better Auth** | 1.6.x | Authentication | Over Clerk (vendor lock-in, cost at scale) and Auth.js/NextAuth v5 (missing built-in 2FA, passkeys, RBAC). Better Auth is open source, self-hosted, TypeScript-first, with built-in passkeys, magic links, OAuth, email/password, rate limiting, and multi-tenancy -- all out of the box. Zero vendor lock-in aligns with Rese's open source ethos. Free regardless of user count. CLI generates Drizzle-compatible schema. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui** | latest (CLI v4) | UI component primitives | Buttons, dialogs, dropdowns, tabs, tooltips, progress bars, input fields. Copy-paste components built on Radix UI + Tailwind. Not a dependency -- components are owned in your codebase. Use for all standard UI elements outside the Tiptap editor. |
| **lucide-react** | latest | Icons | Ships with shadcn/ui. Consistent icon set for UI elements, score indicators, keyword chips. |
| **sonner** | latest | Toast notifications | Lightweight toast library. For autosave confirmations, API errors, export success. Ships as shadcn/ui integration. |
| **nuqs** | latest | URL state management | Type-safe URL search params for Next.js App Router. Use for shareable editor state (selected template, panel layout) without React state. |
| **fuse.js** | 7.x | Fuzzy text matching | For the keyword alias matching in the ATS scoring engine. Lightweight fuzzy search that handles "JavaScript" matching "JS", "React.js" matching "React". Runs client-side in <1ms per match. Supplement with the static keyword-aliases.json dictionary. |
| **json-merge-patch** | latest | RFC 7396 implementation | For the variant override system in Milestone 2. Standard implementation of JSON Merge Patch rather than rolling your own. |
| **immer** | 10.x | Immutable state updates | Zustand middleware for updating deeply nested resume state (editing a bullet inside experience[2].bullets[1]) without spread-operator hell. |
| **react-resizable-panels** | latest | Panel layout | For the three-panel editor layout with draggable dividers. Users can resize JD panel / editor / score panel to their preference. |
### Dev Tools
| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| **pnpm** | 9.x | Package manager | 3.7x faster installs than npm for a Next.js project. Content-addressable storage saves ~70% disk space. Vercel, Prisma, Vue core team all use pnpm. The 2026 standard for new projects. |
| **Vitest** | 4.1.x | Unit + integration testing | 5-10x faster than Jest, native ESM and TypeScript, Jest-compatible API. Next.js 16 officially documents Vitest setup. Use for testing the ATS scoring engine (deterministic, pure functions = easy to test), Zod schemas, state management logic. |
| **@playwright/test** | 1.59.x | E2E testing | For testing the full editor flow: paste JD, verify keywords appear, edit resume, verify score updates, export PDF. Cross-browser testing of the three-panel layout. Next.js 16 officially documents Playwright setup. |
| **Testing Library** | latest | Component testing | @testing-library/react for testing Tiptap editor interactions, score panel rendering, keyword chip display. Use with Vitest. |
| **ESLint** | 9.x | Linting | Flat config format (eslint.config.js). Next.js 16 removed `next lint` -- run ESLint directly. Use @next/eslint-plugin-next for Next.js-specific rules. |
| **Prettier** | 3.x | Code formatting | With prettier-plugin-tailwindcss for automatic Tailwind class sorting. |
| **Turbopack** | (built into Next.js 16) | Bundler | Default in Next.js 16. No configuration needed for new projects. 10x faster HMR than webpack. Do NOT add custom webpack config -- it will be ignored by Turbopack. |
## Installation
### Milestone 1 (Core Editor -- No Backend)
# Initialize project
# Core dependencies
# AI SDK (provider-agnostic LLM integration)
# Tiptap extensions (add as needed)
# shadcn/ui (installs components into your codebase)
# Dev dependencies
### Milestone 2 Additions (Backend, Auth, Database)
# Database
# Auth
# PDF import
# Variant system
## Alternatives Considered
| Category | Recommended | Alternative | Why Not the Alternative |
|----------|-------------|-------------|------------------------|
| Framework | Next.js 16 | Remix / Vite SPA | Next.js is the ecosystem default. Remix has smaller community. Pure SPA loses SSR for SEO. Next.js API routes eliminate need for separate backend. |
| Editor | Tiptap 3 | Slate.js | Slate has a steeper learning curve, less stable API (frequent breaking changes), and weaker extension ecosystem. Tiptap's ProseMirror foundation is more battle-tested for structured content like resumes. |
| Editor | Tiptap 3 | Lexical (Meta) | Lexical is powerful but optimized for social media text (comments, posts). Resume editing needs structured sections with enforced schema -- ProseMirror/Tiptap's document model handles this better. |
| PDF Generation | @react-pdf/renderer | Puppeteer/Playwright HTML-to-PDF | Requires headless browser (200MB+ server-side), cannot run client-side, produces HTML-wrapped PDF that may confuse ATS parsers. @react-pdf/renderer generates native PDF primitives. |
| PDF Generation | @react-pdf/renderer | jsPDF | Lower-level API, no React component model, manual coordinate positioning. @react-pdf/renderer's declarative JSX is far more maintainable for resume templates. |
| State | Zustand | Redux Toolkit | Redux is overkill for Rese's state complexity. Zustand is 1/10th the boilerplate, 3KB vs 10KB+, and the store model maps cleanly to Rese's domains (resume, score, JD). |
| State | Zustand | Jotai | Jotai's atomic model is better for independent state pieces. Resume state is deeply interconnected (edit bullet -> recompute score -> update UI). Zustand's centralized store fits this pattern. |
| ORM | Drizzle | Prisma 7 | Prisma 7 eliminated the Rust engine (good), but still ships a larger client (~200KB+), has slower cold starts on serverless, and abstracts away SQL. Drizzle's SQL-like API gives explicit control needed for JSON Merge Patch operations on variants. |
| Auth | Better Auth | Clerk | Clerk is a SaaS product ($0.02/MAU after 10K users). Rese is open source -- self-hosters should not need a Clerk account. Better Auth is free, self-hosted, and feature-complete. |
| Auth | Better Auth | Auth.js (NextAuth v5) | Auth.js lacks built-in 2FA, passkeys, RBAC, rate limiting. Better Auth has all of these out of the box. Auth.js has the larger ecosystem but fewer built-in features. |
| AI | AI SDK | Direct OpenAI/Claude SDKs | BYOK means users bring keys for different providers. Without AI SDK, you maintain N provider integrations. AI SDK provides one interface for all providers -- this is the architectural enabler for BYOK. |
| Package Manager | pnpm | npm | npm works but is 3-4x slower for installs. pnpm is the 2026 standard for new projects. Vercel supports pnpm natively. |
| Testing | Vitest | Jest | Jest requires complex config for ESM/TypeScript. Vitest is 5-10x faster, native ESM, zero config with Vite/Turbopack projects. Jest-compatible API means the switch is painless. |
| PDF Parsing | unpdf | pdf-parse | pdf-parse is unmaintained (last meaningful update years ago). unpdf is actively maintained, works on edge runtimes, wraps the same pdf.js core with a modern API. |
## What NOT to Use
| Technology | Why Not |
|------------|---------|
| **Webpack** | Next.js 16 defaults to Turbopack. Custom webpack config is ignored when Turbopack runs. Do not add webpack-specific configuration. |
| **Create React App** | Deprecated. Officially dead since 2023. |
| **Styled Components / CSS Modules** | Tailwind CSS 4 covers all styling needs. Adding a second styling system creates inconsistency. Tailwind's utility approach is especially good for responsive three-panel layouts. |
| **Redux / Redux Toolkit** | Overkill. Rese has 3-4 state domains. Zustand handles this with 90% less boilerplate. |
| **Puppeteer / Playwright for PDF** | Server-side only, 200MB+ headless browser, ATS parseability issues. Use @react-pdf/renderer for generation. Reserve Playwright for E2E *testing* only. |
| **tRPC** | Rese's API surface is small (LLM proxy, auth, CRUD). Next.js Server Actions + API routes are sufficient. tRPC adds complexity without proportional benefit for this project size. |
| **Mongoose / MongoDB** | Resume data is relational (users -> resumes -> variants -> job descriptions). PostgreSQL + Drizzle is the correct choice. MongoDB would require manual join logic for the variant dashboard. |
| **Firebase** | Vendor lock-in, not self-hostable, violates "truly open source" constraint. |
| **Electron / Tauri** | Desktop app is out of scope. Web-first per DESIGN.md. |
| **pdf-parse** | Unmaintained. Use unpdf instead for Milestone 2 PDF import. |
| **NextAuth v4** | Superseded by Auth.js v5, and both superseded by Better Auth for this use case. |
## Version Compatibility Matrix
| Package | Minimum | Tested With | Notes |
|---------|---------|-------------|-------|
| Node.js | 20.x | 22.x LTS | Next.js 16 requires Node 20+. Use 22 LTS for best compatibility. |
| React | 19.0 | 19.x | Required by Next.js 16. Do not use React 18. |
| TypeScript | 5.5 | 5.7+ | Zod 4 requires TS 5.5+. Use latest stable. |
| Next.js | 16.0 | 16.2.x | Use latest 16.2.x patch. |
| Tailwind CSS | 4.0 | 4.2.x | v4 is CSS-first config. Do not use tailwind.config.js (v3 pattern). |
| Tiptap | 3.0 | 3.22.x | v3 required for SSR support with Next.js. Set `immediatelyRender: false` in useEditor for SSR hydration. |
| Zustand | 5.0 | 5.0.x | v5 drops some v4 middleware -- check immer middleware import path. |
| Zod | 4.0 | 4.3.x | Major version change from v3. Different import paths for some utilities. |
| AI SDK | 6.0 | 6.0.x | v6 introduced agent abstraction. Core `generateObject`/`generateText` API unchanged from v5. |
## Key Configuration Notes
### Next.js 16 Specifics
- **Turbopack is default**: No `--turbopack` flag needed. It just works.
- **No `next lint`**: Removed in v16. Run ESLint directly via `eslint .` script.
- **Async request APIs**: `cookies()`, `headers()`, `params` must be `await`ed. Synchronous access removed.
- **Middleware renamed to Proxy**: If you add edge middleware later, the file is now `proxy.ts`, not `middleware.ts`, and the export is `proxy`, not `middleware`.
- **React 19 required**: `useFormState` replaced by `useActionState`. No React 18 support.
### Tiptap 3 Specifics
- **SSR hydration**: Set `immediatelyRender: false` and `shouldRerenderOnTransaction: true` in `useEditor` config.
- **Import changes**: `BubbleMenu` and `FloatingMenu` import from `@tiptap/react/menus`, not `@tiptap/react`.
- **StarterKit changes**: Underline and Link extensions included by default. `history` option renamed to `undoRedo`.
### Tailwind CSS 4 Specifics
- **No `tailwind.config.js`**: Configuration is CSS-first via `@theme` directive in your CSS file.
- **No PostCSS config needed**: Tailwind 4 runs as a standalone tool or via the webpack/Vite plugin.
- **Class name changes**: Some v3 utility names changed. Use the upgrade tool: `npx @tailwindcss/upgrade`.
## Confidence Assessment
| Area | Confidence | Reasoning |
|------|------------|-----------|
| Next.js 16 | HIGH | Official release, verified via nextjs.org, well-documented migration path. Greenfield project = no migration risk. |
| Tiptap 3 | HIGH | v3 stable release confirmed. React bindings at 3.22.x. SSR support verified in official docs. Correct choice for structured rich text editing. |
| @react-pdf/renderer | HIGH | v4.4.0 actively maintained. React component model for PDF generation is well-established. ATS-friendly output verified by ecosystem usage (Resumify, OpenResume use similar approach). |
| Drizzle over Prisma | MEDIUM-HIGH | Performance advantages verified across multiple sources. Prisma 7 closed the gap but Drizzle still wins on bundle size and serverless cold starts. Edge case: Drizzle 0.x version number may concern some teams, but 900K+ weekly downloads indicate production readiness. |
| Better Auth over Clerk | MEDIUM | Better Auth is newer (v1.6.x) with a smaller ecosystem than Clerk. Feature set is verified and impressive. Risk: less community content, fewer tutorials. Mitigation: good official docs, TypeScript-first API is self-documenting. Aligns with open source constraint. |
| AI SDK for BYOK | HIGH | Vercel AI SDK v6 is the standard multi-provider abstraction. 4.6K+ GitHub stars, actively maintained. Provider packages for OpenAI, Anthropic, Google verified. This is the correct architectural choice for BYOK. |
| Zustand | HIGH | 5.0.x stable, 50K+ GitHub stars, 8M+ weekly downloads. Standard choice for React state management outside Redux. |
| Vitest | HIGH | 4.1.x stable, officially documented in Next.js docs. Clear performance advantage over Jest. No reason to choose Jest for new projects in 2026. |
| pnpm | HIGH | Used by Vercel itself, Vue, Prisma. 3-4x faster than npm. Native Vercel support. |
## Sources
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- Official announcement
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Breaking changes
- [Tiptap v3 Stable Release](https://tiptap.dev/blog/release-notes/tiptap-3-0-is-stable) -- Official release notes
- [Tiptap v2 to v3 Migration](https://tiptap.dev/docs/guides/upgrade-tiptap-v2) -- Breaking changes
- [Tailwind CSS v4.2 Release](https://www.infoq.com/news/2026/04/tailwind-css-4-2-webpack/) -- Webpack plugin, new features
- [Drizzle vs Prisma 2026 Comparison](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) -- Performance analysis
- [Better Auth vs NextAuth vs Clerk](https://supastarter.dev/blog/better-auth-vs-nextauth-vs-clerk) -- Feature comparison
- [AI SDK 6 Release](https://vercel.com/blog/ai-sdk-6) -- Agent abstraction, provider model
- [Vitest vs Jest for Next.js 2026](https://dev.to/whoffagents/vitest-vs-jest-for-nextjs-in-2026-setup-speed-and-when-to-switch-224a) -- Performance benchmarks
- [pnpm vs npm 2026](https://dev.to/pockit_tools/pnpm-vs-npm-vs-yarn-vs-bun-the-2026-package-manager-showdown-51dc) -- Package manager comparison
- [State Management in 2026](https://dev.to/jsgurujobs/state-management-in-2026-zustand-vs-jotai-vs-redux-toolkit-vs-signals-2gge) -- Zustand vs alternatives
- [Zod v4 Release Notes](https://zod.dev/v4) -- New features, performance
- [unpdf GitHub](https://github.com/unjs/unpdf) -- Modern pdf-parse replacement
- [OpenAI Structured Outputs Guide](https://developers.openai.com/api/docs/guides/structured-outputs) -- zodResponseFormat integration
- [ESLint 9 + Next.js 16 Setup](https://chris.lu/web_development/tutorials/next-js-16-linting-setup-eslint-9-flat-config) -- Flat config guide
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
