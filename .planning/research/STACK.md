# Technology Stack

**Project:** Rese -- AI Resume Builder with Live ATS Scoring
**Researched:** 2026-04-10
**Overall Confidence:** HIGH

---

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

**Why AI SDK over direct SDKs:**
The DESIGN.md says "OpenAI / Claude API" but BYOK means users will bring keys for *different* providers. Without AI SDK, you need `if (provider === 'openai') { ... } else if (provider === 'anthropic') { ... }` everywhere. AI SDK eliminates this with a single interface. One `generateObject()` call with a Zod schema works identically across all providers. This is not optional for BYOK -- it is the enabling technology.

### PDF Stack

| Technology | Version | Purpose | Why This, Why Now |
|------------|---------|---------|-------------------|
| **@react-pdf/renderer** | 4.4.x | PDF generation + export | Generates PDFs programmatically from React components. Produces real PDF primitives (not HTML-to-PDF conversion), so text is genuinely selectable and parseable by ATS systems. You define resume templates as React components with `<Document>`, `<Page>`, `<View>`, `<Text>` -- same mental model as building UI. This is the PDF *creation* library. |
| **react-pdf** | 10.4.x | PDF preview display | Renders PDF blobs in the browser for the live preview panel. Takes the output from @react-pdf/renderer and displays it. This is the PDF *viewing* library. Different package, complementary purpose. |
| **unpdf** | latest | PDF text extraction (M2) | For resume import in Milestone 2. Modern replacement for pdf-parse (which is unmaintained). Works in Node.js and edge runtimes. Wraps pdf.js with a clean API. PDF parsing is inherently lossy for resumes -- this is best-effort import with manual correction UI. |

**Why @react-pdf/renderer over HTML-to-PDF (Puppeteer/Playwright):**
HTML-to-PDF requires a headless browser, cannot run client-side, adds 200MB+ to deployment, and produces PDFs that *look* right but may have invisible HTML artifacts that confuse ATS parsers. @react-pdf/renderer generates native PDF text nodes -- what you see is exactly what the ATS parser sees. For a resume builder where ATS parseability is the core value proposition, this is non-negotiable.

### Database + Auth (Milestone 2)

| Technology | Version | Purpose | Why This, Why Now |
|------------|---------|---------|-------------------|
| **Drizzle ORM** | 0.45.x | Database ORM | Over Prisma. ~7.4KB gzipped (vs Prisma's much larger client), zero runtime dependencies, dramatically faster cold starts on Vercel serverless. SQL-like TypeScript API means you write queries that map directly to SQL -- no magic query engine. For Rese's relatively simple relational model (users, resumes, variants, job descriptions), Drizzle's lightweight approach is the right fit. Prisma 7 closed the performance gap but Drizzle remains better for serverless/edge. |
| **drizzle-kit** | latest | Migrations + studio | Schema introspection, migration generation, visual database browser. Companion tool for Drizzle ORM. |
| **PostgreSQL** | 16+ | Database | Standard relational database. JSON/JSONB columns for resume sections and variant overrides (JSON Merge Patch). Full-text search for future features. Use Neon (serverless Postgres) for deployment -- free tier, HTTP-based driver works on edge, scales to zero. |
| **@neondatabase/serverless** | latest | Postgres driver | Neon's serverless driver for Drizzle. Works over HTTP (no persistent connections needed), compatible with Vercel Edge Functions. |
| **Better Auth** | 1.6.x | Authentication | Over Clerk (vendor lock-in, cost at scale) and Auth.js/NextAuth v5 (missing built-in 2FA, passkeys, RBAC). Better Auth is open source, self-hosted, TypeScript-first, with built-in passkeys, magic links, OAuth, email/password, rate limiting, and multi-tenancy -- all out of the box. Zero vendor lock-in aligns with Rese's open source ethos. Free regardless of user count. CLI generates Drizzle-compatible schema. |

**Why Drizzle over Prisma:**
Both are viable in 2026 (Prisma 7 eliminated the Rust engine). Drizzle wins for Rese because: (1) 7.4KB vs ~200KB+ client bundle -- matters for serverless cold starts, (2) SQL-like API gives full control over queries for the variant/merge-patch operations, (3) better edge runtime compatibility, (4) Rese is greenfield so no migration from Prisma needed.

**Why Better Auth over Clerk:**
Rese is MIT-licensed open source. Using Clerk means self-hosters must pay Clerk or replace the auth layer. Better Auth is free, self-hostable, and feature-complete. The DESIGN.md lists "Clerk" but Clerk contradicts the "truly free" constraint for self-hosters.

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

---

## Installation

### Milestone 1 (Core Editor -- No Backend)

```bash
# Initialize project
pnpm create next-app@latest rese --typescript --tailwind --app --turbopack

# Core dependencies
pnpm add zustand immer zod @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @react-pdf/renderer react-pdf fuse.js react-resizable-panels sonner nuqs

# AI SDK (provider-agnostic LLM integration)
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic

# Tiptap extensions (add as needed)
pnpm add @tiptap/extension-placeholder @tiptap/extension-underline \
  @tiptap/extension-highlight @tiptap/extension-color @tiptap/extension-text-style

# shadcn/ui (installs components into your codebase)
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card dialog dropdown-menu input \
  label progress separator tabs tooltip badge

# Dev dependencies
pnpm add -D vitest @vitejs/plugin-react @testing-library/react \
  @testing-library/jest-dom @playwright/test eslint @next/eslint-plugin-next \
  prettier prettier-plugin-tailwindcss @types/react @types/node
```

### Milestone 2 Additions (Backend, Auth, Database)

```bash
# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth
pnpm add better-auth

# PDF import
pnpm add unpdf

# Variant system
pnpm add json-merge-patch
pnpm add -D @types/json-merge-patch
```

---

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

---

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

---

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

---

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

---

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

---

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
