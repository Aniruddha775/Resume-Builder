# Phase 1: Foundation & Layout - Research

**Researched:** 2026-04-13
**Domain:** Next.js 16 project scaffold, responsive panel layout, Zustand state management, TypeScript data models, localStorage persistence
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield scaffold of a Next.js 16 App Router project with three well-defined deliverables: (1) a responsive three-panel layout using react-resizable-panels with desktop side-by-side and mobile tabbed views, (2) a Zustand 5 store with domain slices and immer middleware for deeply nested resume state, and (3) TypeScript types + Zod schemas for all data models with a localStorage storage adapter. No editor, scoring, or AI features are in scope.

The standard stack is well-established and all libraries are current. The main technical risks are: SSR hydration mismatches when using Zustand's persist middleware with Next.js, a known shadcn/ui resizable component compatibility issue with react-resizable-panels v4 (requires verification at install time), and getting the Tailwind CSS v4 CSS-first configuration correct (no tailwind.config.js). pnpm is specified in CLAUDE.md as the package manager but is NOT installed on this machine -- it must be installed first.

**Primary recommendation:** Scaffold with `create-next-app`, install pnpm first via `npm install -g pnpm`, use shadcn's resizable component (verify v4 compatibility at install time), build Zustand store with immer+persist+devtools middleware stack, and define all types as Zod schemas with inferred TypeScript types.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Weighted panel proportions -- ~25-30% JD panel, ~40-45% editor panel, ~25-30% score panel. Editor gets the most space since users spend most time there.
- **D-02:** Resizable dividers using `react-resizable-panels`. Users can drag to adjust proportions.
- **D-03:** Tabbed navigation on mobile/tablet -- three tabs (JD, Editor, Score) with the editor as default active tab. No vertical stacking. Each tab shows one panel at full width.
- **D-04:** Breakpoint: desktop (3-panel side-by-side) vs tablet/mobile (tabbed). Exact breakpoint at Claude's discretion.
- **D-05:** Light mode only for Phase 1. Clean, minimal, professional aesthetic (think Linear/Notion). Dark mode deferred.
- **D-06:** Neutral gray chrome. Color reserved for functional indicators -- green for matched keywords, red for missing keywords.
- **D-07:** Professional tone -- users are building resumes, not using a toy.
- **D-08:** Instructional text in each panel -- clear labels that communicate each panel's purpose.
- **D-09:** No sample/mock resume data and no skeleton loading states -- just clean instructional placeholders.

### Claude's Discretion
- Exact breakpoint pixel values for desktop vs tablet/mobile
- Panel minimum/maximum width constraints for resizable dividers
- Zustand slice internal structure and cross-slice communication patterns
- Storage adapter interface design (sync vs async, migration strategy)
- TypeScript type field-level details beyond what DESIGN.md specifies
- shadcn/ui component selection for tabs, layout primitives
- Exact spacing, typography scale, and color palette values

### Deferred Ideas (OUT OF SCOPE)
- Dark mode -- future polish phase
- Keyboard shortcuts for panel switching -- consider in Phase 4 (accessibility)

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FNDN-01 | Project scaffolded with Next.js 16, TypeScript, Tailwind CSS v4 | Standard Stack section covers exact versions, create-next-app flags, and Tailwind v4 CSS-first config |
| FNDN-02 | Three-panel layout renders responsively (JD input / editor / score panel) | Architecture Patterns section covers react-resizable-panels setup, shadcn resizable, breakpoint strategy, and tabbed mobile layout |
| FNDN-03 | Zustand store initialized with domain slices (resume, jobDescription, keywords, score, ui) | Architecture Patterns section covers slice pattern with immer+persist+devtools middleware, SSR hydration strategy |
| FNDN-04 | Storage adapter interface defined with localStorage implementation | Architecture Patterns section covers async adapter interface design with Zod-validated reads and schema versioning |
| FNDN-05 | TypeScript types defined for all data models (Resume, JobDescription, KeywordSet, Keyword, ScoreResult) | Code Examples section provides Zod schema definitions matching DESIGN.md data model with inferred types |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package manager:** pnpm 9.x (CLAUDE.md specifies pnpm; must install first since not available on machine)
- **Framework:** Next.js 16.2.x with App Router, Turbopack default bundler
- **React:** 19.x (required by Next.js 16)
- **TypeScript:** 5.7+
- **Styling:** Tailwind CSS 4.2.x -- CSS-first config, NO tailwind.config.js
- **State:** Zustand 5.x with immer middleware
- **Validation:** Zod 4.x
- **UI primitives:** shadcn/ui (CLI v4) with Radix UI, lucide-react icons
- **No webpack config:** Turbopack is default, custom webpack config is ignored
- **No tRPC:** Next.js Server Actions + API routes are sufficient
- **No Redux/RTK:** Zustand is the state management choice
- **No styled-components/CSS Modules:** Tailwind covers all styling
- **Implementation order:** Phase 1 first, no skipping ahead

## Standard Stack

### Core (Phase 1 only)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | Framework | [VERIFIED: npm registry] Latest stable, Turbopack default, App Router stable |
| React | 19.2.5 | UI library | [VERIFIED: npm registry] Required by Next.js 16 |
| react-dom | 19.2.5 | DOM rendering | [VERIFIED: npm registry] Paired with React |
| TypeScript | 6.0.2 | Type safety | [VERIFIED: npm registry] Latest stable, exceeds Zod 4 minimum of TS 5.5 |
| Tailwind CSS | 4.2.2 | Styling | [VERIFIED: npm registry] CSS-first config, @theme directive, no JS config file |
| @tailwindcss/postcss | 4.2.2 | PostCSS plugin | [VERIFIED: npm registry] Required for Next.js integration with Tailwind v4 |
| Zustand | 5.0.12 | Client state | [VERIFIED: npm registry] Store-based, 3KB gzipped, immer middleware for nested state |
| Zod | 4.3.6 | Schema validation | [VERIFIED: npm registry] Defines data model + validates localStorage reads |
| Immer | 11.1.4 | Immutable updates | [VERIFIED: npm registry] Zustand middleware for deeply nested resume state |
| react-resizable-panels | 4.10.0 | Panel layout | [VERIFIED: npm registry] Draggable panel dividers, percentage-based constraints |
| lucide-react | 1.8.0 | Icons | [VERIFIED: npm registry] Ships with shadcn, used for panel placeholder icons |

### shadcn/ui Components (Phase 1)

| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| resizable | Three-panel desktop layout with drag handles | `pnpm dlx shadcn@latest add resizable` |
| tabs | Mobile/tablet tabbed panel navigation | `pnpm dlx shadcn@latest add tabs` |
| separator | Visual dividers between panel sections | `pnpm dlx shadcn@latest add separator` |
| tooltip | Hover hints on panel headers | `pnpm dlx shadcn@latest add tooltip` |

### Dev Dependencies

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | 9.x (install globally) | Package manager | [VERIFIED: CLAUDE.md mandate] 3-4x faster than npm |
| Vitest | 4.1.4 | Unit testing | [VERIFIED: npm registry] Native ESM, 5-10x faster than Jest, Next.js 16 documented |
| @vitejs/plugin-react | 6.0.1 | Vitest React support | [VERIFIED: npm registry] Required for JSX in tests |
| vite-tsconfig-paths | 6.1.1 | Path alias resolution | [VERIFIED: npm registry] Resolves @/ imports in Vitest |
| jsdom | 29.0.2 | DOM environment | [VERIFIED: npm registry] Test environment for component tests |
| @testing-library/react | 16.3.2 | Component testing | [VERIFIED: npm registry] Standard React testing utilities |
| ESLint | 10.2.0 | Linting | [VERIFIED: npm registry] Flat config, no `next lint` in v16 |
| @next/eslint-plugin-next | 16.2.3 | Next.js lint rules | [VERIFIED: npm registry] Matches Next.js version |
| Prettier | 3.8.2 | Formatting | [VERIFIED: npm registry] With tailwindcss plugin for class sorting |
| prettier-plugin-tailwindcss | 0.7.2 | Tailwind class sorting | [VERIFIED: npm registry] Automatic class order in templates |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn resizable | Direct react-resizable-panels | shadcn wraps it with Tailwind styling; use shadcn for consistency |
| Zustand persist | Manual localStorage calls | Persist middleware handles serialization, rehydration, and versioning automatically |
| Zod schemas for types | Plain TypeScript interfaces | Zod provides runtime validation AND compile-time types from one source of truth |
| Immer middleware | Manual spread operators | Resume state is 3-4 levels deep (experience[i].bullets[j]); spreads are error-prone |

**Installation (Phase 1):**

```bash
# Install pnpm first (not available on machine)
npm install -g pnpm

# Scaffold Next.js 16 project
pnpm create next-app@latest rese --typescript --tailwind --eslint --app --src-dir --use-pnpm --import-alias "@/*"

# Core dependencies
pnpm add zustand zod immer react-resizable-panels

# Dev dependencies
pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom prettier prettier-plugin-tailwindcss

# shadcn init (after scaffold)
pnpm dlx shadcn@latest init

# shadcn components
pnpm dlx shadcn@latest add resizable tabs separator tooltip
```

## Architecture Patterns

### Recommended Project Structure

Based on DESIGN.md suggested structure, adapted for Next.js 16 with src directory:

```
src/
  app/
    layout.tsx          # Root layout: Inter font, metadata, ThemeProvider
    page.tsx            # Home page: renders EditorLayout
    globals.css         # Tailwind v4 imports + @theme + shadcn CSS vars
  components/
    layout/
      editor-layout.tsx # Three-panel orchestrator (desktop + mobile)
      app-header.tsx    # Minimal "Rese" header bar
      panel-placeholder.tsx  # Reusable placeholder with icon + text
    ui/                 # shadcn components (auto-generated)
  lib/
    store/
      index.ts          # Combined Zustand store with all middleware
      slices/
        resume-slice.ts
        job-description-slice.ts
        keywords-slice.ts
        score-slice.ts
        ui-slice.ts
    storage/
      adapter.ts        # StorageAdapter interface definition
      local-storage.ts  # localStorage implementation
    utils.ts            # cn() helper (shadcn generates this)
  types/
    resume.ts           # Zod schemas + inferred types for Resume, ContactInfo, Experience, Education, Skills
    job-description.ts  # Zod schemas for JobDescription, KeywordSet, Keyword
    score.ts            # Zod schemas for ScoreResult, ScoreBreakdown
    storage.ts          # StorageAdapter interface type
```

### Pattern 1: Zustand Slices with Immer + Persist + Devtools

**What:** Single combined store with domain slices, using immer for deep updates, persist for localStorage, and devtools for debugging.

**When to use:** Always in this project. All state flows through one store.

**Middleware stacking order (outside-in):** devtools -> persist -> immer -> slices

```typescript
// Source: Zustand docs + community best practices [VERIFIED: GitHub discussions]
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createResumeSlice, type ResumeSlice } from './slices/resume-slice'
import { createJobDescriptionSlice, type JobDescriptionSlice } from './slices/job-description-slice'
import { createKeywordsSlice, type KeywordsSlice } from './slices/keywords-slice'
import { createScoreSlice, type ScoreSlice } from './slices/score-slice'
import { createUISlice, type UISlice } from './slices/ui-slice'

export type AppState = ResumeSlice & JobDescriptionSlice & KeywordsSlice & ScoreSlice & UISlice

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createResumeSlice(...a),
        ...createJobDescriptionSlice(...a),
        ...createKeywordsSlice(...a),
        ...createScoreSlice(...a),
        ...createUISlice(...a),
      })),
      {
        name: 'rese-store',
        version: 1,
        partialize: (state) => ({
          resume: state.resume,
          jobDescription: state.jobDescription,
          keywords: state.keywords,
          // score is derived, not persisted
          // ui state is not persisted
        }),
      }
    ),
    { name: 'Rese Store' }
  )
)
```

**Slice definition pattern:**

```typescript
// Source: Zustand slices pattern [VERIFIED: zustand.docs.pmnd.rs]
import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { Resume } from '@/types/resume'

export interface ResumeSlice {
  resume: Resume | null
  setResume: (resume: Resume) => void
  updateBullet: (expIndex: number, bulletIndex: number, text: string) => void
}

export const createResumeSlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  ResumeSlice
> = (set) => ({
  resume: null,
  setResume: (resume) => set((state) => { state.resume = resume }),
  updateBullet: (expIndex, bulletIndex, text) =>
    set((state) => {
      if (state.resume?.sections.experience[expIndex]) {
        state.resume.sections.experience[expIndex].bullets[bulletIndex] = text
      }
    }),
})
```

### Pattern 2: SSR Hydration Safety for Persisted Zustand State

**What:** Prevent hydration mismatches when Zustand persist middleware rehydrates from localStorage before Next.js SSR completes.

**When to use:** Any component that reads from persisted Zustand state.

**Strategy:** Use a `useHydration` hook that defers rendering of persisted values until after client-side hydration.

```typescript
// Source: Zustand GitHub discussions #1382, #1145 [VERIFIED: GitHub]
import { useEffect, useState } from 'react'

export function useHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

// Usage in component:
function MyComponent() {
  const hydrated = useHydration()
  const resume = useAppStore((s) => s.resume)

  if (!hydrated) {
    return null // or a loading placeholder
  }

  return <div>{resume?.sections.contactInfo.fullName}</div>
}
```

**Alternative (recommended for Phase 1):** Since Phase 1 has placeholder content only and no real data to persist yet, the persist middleware can be configured but the hydration hook is only strictly needed when components start reading persisted data in Phase 2+. However, establishing the pattern now prevents bugs later.

### Pattern 3: Storage Adapter Interface

**What:** Abstract storage behind an async interface so localStorage (M1) can be swapped for database (M2) without changing consuming code.

**When to use:** All data persistence operations.

**Design decision: Use async interface.** Even though localStorage is synchronous, the adapter interface should be async (returning Promises) because the database adapter in M2 will be async. This prevents a breaking interface change later.

```typescript
// Source: Architecture decision [ASSUMED - recommended pattern]
import type { Resume } from '@/types/resume'
import type { JobDescription } from '@/types/job-description'

export interface StorageAdapter {
  // Resume operations
  getResume(id: string): Promise<Resume | null>
  saveResume(resume: Resume): Promise<void>
  deleteResume(id: string): Promise<void>
  listResumes(): Promise<Resume[]>

  // Job description operations
  getJobDescription(id: string): Promise<JobDescription | null>
  saveJobDescription(jd: JobDescription): Promise<void>
  deleteJobDescription(id: string): Promise<void>

  // Bulk operations
  exportAll(): Promise<string>  // JSON string for backup
  importAll(data: string): Promise<void>

  // Schema version for migrations
  getSchemaVersion(): Promise<number>
  setSchemaVersion(version: number): Promise<void>
}
```

### Pattern 4: Responsive Layout with Conditional Rendering

**What:** Desktop shows react-resizable-panels side-by-side; mobile/tablet shows shadcn Tabs with one panel at a time.

**When to use:** The main editor layout component.

**Breakpoint:** 1024px (Tailwind `lg:` prefix) [from UI-SPEC]

```typescript
// Source: UI-SPEC layout contract [VERIFIED: 01-UI-SPEC.md]
'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { DesktopLayout } from './desktop-layout'
import { MobileLayout } from './mobile-layout'

export function EditorLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Avoid SSR mismatch: render nothing until client determines viewport
  if (isDesktop === undefined) return null

  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}
```

**Note:** A custom `useMediaQuery` hook is needed. This is a standard pattern -- approximately 10 lines of code using `window.matchMedia` with a `useState` + `useEffect` pattern. Do NOT use a library for this.

### Anti-Patterns to Avoid

- **Do NOT use `tailwind.config.js`:** Tailwind v4 uses CSS-first config via `@theme` directive. Creating a JS config file will cause confusion and may be ignored. [VERIFIED: Tailwind v4 docs]
- **Do NOT use `next lint`:** Removed in Next.js 16. Run ESLint directly via `eslint .` in package.json scripts. [VERIFIED: Next.js 16 upgrade guide]
- **Do NOT call `cookies()` or `headers()` synchronously:** These are async in Next.js 16 and must be awaited. [VERIFIED: Next.js 16 blog]
- **Do NOT use `middleware.ts`:** Renamed to `proxy.ts` with `proxy` export in Next.js 16. Not needed in Phase 1 but important to know for M2. [VERIFIED: Next.js 16 upgrade guide]
- **Do NOT use `useFormState`:** Replaced by `useActionState` in React 19. [VERIFIED: Next.js 16 blog]
- **Do NOT add custom webpack config:** Turbopack is default in Next.js 16 and ignores webpack config. [VERIFIED: CLAUDE.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resizable panels | CSS resize or custom drag handlers | react-resizable-panels (via shadcn resizable) | Handles min/max constraints, keyboard a11y, persistence, and cross-browser edge cases |
| Tabbed navigation | Custom tab state management | shadcn Tabs (Radix UI) | ARIA-compliant tab panels, keyboard navigation, focus management built in |
| Deep immutable updates | Spread operator chains for nested objects | Immer (via Zustand middleware) | Resume state is 3-4 levels deep; manual spreads are verbose and error-prone |
| Runtime validation | Manual if/typeof checks on localStorage data | Zod schemas with safeParse | Handles schema evolution, provides typed error messages, single source of truth for types |
| Media query detection | window.innerWidth polling or resize listeners | matchMedia API with useEffect hook | matchMedia is event-driven (no polling), handles SSR safely with initial undefined state |
| CSS utility classes | Custom CSS for spacing, colors, layout | Tailwind CSS v4 utilities | Consistent design tokens, responsive prefixes, eliminates naming bikeshedding |

**Key insight:** Phase 1 establishes patterns that all downstream phases depend on. Getting the store shape, type definitions, and storage adapter right now prevents refactoring in Phases 2-7.

## Common Pitfalls

### Pitfall 1: Tailwind CSS v4 Configuration Mismatch

**What goes wrong:** Developer creates a `tailwind.config.js` file (v3 pattern) or uses `@tailwind base; @tailwind components; @tailwind utilities;` directives.
**Why it happens:** Nearly all tutorials and training data reference v3 patterns. Tailwind v4 is a ground-up rewrite with CSS-first config.
**How to avoid:** Use `@import "tailwindcss";` as a single import in globals.css. Use `@theme { }` directive for custom values. No JS config file. [VERIFIED: Tailwind v4 docs]
**Warning signs:** Tailwind classes not applying, "unknown at-rule" warnings in IDE, or a tailwind.config.js file appearing in the project root.

### Pitfall 2: SSR Hydration Mismatch with Zustand Persist

**What goes wrong:** React hydration error because server renders with initial state while client has persisted localStorage data.
**Why it happens:** Zustand persist middleware rehydrates synchronously from localStorage before Next.js finishes hydration, causing a mismatch.
**How to avoid:** Use `skipHydration: true` in persist config OR use a `useHydration` hook that renders default state on first render, then swaps to persisted state after useEffect. [VERIFIED: Zustand GitHub #1382]
**Warning signs:** "Text content did not match" errors in dev console, content flashing on page load.

### Pitfall 3: shadcn Resizable + react-resizable-panels v4 Export Names

**What goes wrong:** TypeScript errors after `npx shadcn@latest add resizable` because the generated code uses old v2/v3 export names (PanelGroup, PanelResizeHandle) that were renamed in v4 (Group, Panel, Separator).
**Why it happens:** shadcn CLI may generate code targeting an older API while installing the latest v4 package. This was a known issue in early 2026. [VERIFIED: GitHub shadcn-ui/ui #9136, #9200]
**How to avoid:** After adding the resizable component, check the generated file in `src/components/ui/resizable.tsx`. If it imports `PanelGroup` from react-resizable-panels and TypeScript errors, update imports to match v4 API. The shadcn team has fixed this in recent CLI versions but verify at install time.
**Warning signs:** TypeScript compilation errors immediately after installing the resizable component.

### Pitfall 4: Next.js 16 create-next-app Generates AGENTS.md

**What goes wrong:** `create-next-app --yes` generates an `AGENTS.md` file that may conflict with project instructions in CLAUDE.md.
**Why it happens:** Next.js 16 defaults include AGENTS.md to guide AI coding assistants. [VERIFIED: Next.js 16 docs]
**How to avoid:** Review the generated AGENTS.md after scaffolding. It may contain useful Next.js 16 patterns. Do not delete it without reading -- it may have current API guidance. But CLAUDE.md takes precedence for project-level decisions.
**Warning signs:** Conflicting instructions between AGENTS.md and CLAUDE.md.

### Pitfall 5: Zustand v5 Import Path Changes

**What goes wrong:** Importing immer middleware from wrong path causes runtime errors.
**Why it happens:** Zustand v5 changed some middleware import paths from v4.
**How to avoid:** Use `import { immer } from 'zustand/middleware/immer'` (NOT from `zustand/middleware`). Use `import { devtools, persist } from 'zustand/middleware'` for devtools and persist. [VERIFIED: Zustand v5 docs]
**Warning signs:** "Module not found" or "is not a function" errors when setting up the store.

### Pitfall 6: react-resizable-panels Uses Percentage Units by Default

**What goes wrong:** Developer tries to set panel sizes in pixels (e.g., minSize={200}) but the library interprets them as percentages.
**Why it happens:** Default units are percentage (0-100). Pixel units require explicit `units="pixels"` on PanelGroup or string values like "200px". [VERIFIED: react-resizable-panels npm docs]
**How to avoid:** UI-SPEC specifies min widths in pixels (200px, 300px, 200px) but default proportions in percentages (27/46/27). Either use `units="pixels"` on PanelGroup for constraints OR convert pixel minimums to approximate percentages at a reference viewport width. The simpler approach: use percentage-based `minSize` and `defaultSize` props.
**Warning signs:** Panels collapsing unexpectedly or not respecting intended size constraints.

## Code Examples

### Zod Schema Definitions (matching DESIGN.md data model)

```typescript
// src/types/resume.ts
// Source: DESIGN.md data model [VERIFIED: DESIGN.md]
import { z } from 'zod'

export const ContactInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  linkedIn: z.string().optional(),
  website: z.string().url().optional(),
})

export const ExperienceSchema = z.object({
  id: z.string().uuid(),
  company: z.string(),
  title: z.string(),
  startDate: z.string(), // YYYY-MM format
  endDate: z.string().nullable(), // null if current
  current: z.boolean(),
  bullets: z.array(z.string()),
})

export const EducationSchema = z.object({
  id: z.string().uuid(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  graduationDate: z.string(), // YYYY-MM format
  gpa: z.string().optional(),
})

export const SkillsSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

export const ResumeSectionsSchema = z.object({
  contactInfo: ContactInfoSchema,
  summary: z.string(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillsSchema),
})

export const ResumeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sections: ResumeSectionsSchema,
})

// Inferred TypeScript types
export type ContactInfo = z.infer<typeof ContactInfoSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type Skills = z.infer<typeof SkillsSchema>
export type ResumeSections = z.infer<typeof ResumeSectionsSchema>
export type Resume = z.infer<typeof ResumeSchema>
```

```typescript
// src/types/job-description.ts
// Source: DESIGN.md data model [VERIFIED: DESIGN.md]
import { z } from 'zod'

export const KeywordCategorySchema = z.enum(['hard', 'preferred', 'tools', 'soft'])

export const KeywordSchema = z.object({
  term: z.string(),
  category: KeywordCategorySchema,
  matched: z.boolean(),
  matchedIn: z.string().optional(),
})

export const KeywordSetSchema = z.object({
  hardRequirements: z.array(KeywordSchema),
  preferredSkills: z.array(KeywordSchema),
  toolsAndTech: z.array(KeywordSchema),
  softSkills: z.array(KeywordSchema),
})

export const JobDescriptionSchema = z.object({
  id: z.string().uuid(),
  rawText: z.string(),
  pastedAt: z.string().datetime(),
  extractedKeywords: KeywordSetSchema.nullable(), // null until LLM extracts
})

export type KeywordCategory = z.infer<typeof KeywordCategorySchema>
export type Keyword = z.infer<typeof KeywordSchema>
export type KeywordSet = z.infer<typeof KeywordSetSchema>
export type JobDescription = z.infer<typeof JobDescriptionSchema>
```

```typescript
// src/types/score.ts
// Source: DESIGN.md ATS scoring algorithm [VERIFIED: DESIGN.md]
import { z } from 'zod'

export const ScoreCategoryBreakdownSchema = z.object({
  category: z.string(),
  weight: z.number(),
  matched: z.number(),
  total: z.number(),
  percentage: z.number(),
  weightedScore: z.number(),
})

export const ScoreResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  breakdown: z.object({
    hardRequirements: ScoreCategoryBreakdownSchema,
    preferredSkills: ScoreCategoryBreakdownSchema,
    toolsAndTech: ScoreCategoryBreakdownSchema,
    softSkills: ScoreCategoryBreakdownSchema,
    formatting: ScoreCategoryBreakdownSchema,
  }),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  computedAt: z.string().datetime(),
})

export type ScoreCategoryBreakdown = z.infer<typeof ScoreCategoryBreakdownSchema>
export type ScoreResult = z.infer<typeof ScoreResultSchema>
```

### localStorage Adapter with Zod Validation

```typescript
// src/lib/storage/local-storage.ts
// Source: Architecture pattern [ASSUMED - recommended approach]
import type { StorageAdapter } from '@/types/storage'
import type { Resume } from '@/types/resume'
import type { JobDescription } from '@/types/job-description'
import { ResumeSchema } from '@/types/resume'
import { JobDescriptionSchema } from '@/types/job-description'

const STORAGE_PREFIX = 'rese:'
const SCHEMA_VERSION_KEY = `${STORAGE_PREFIX}schema-version`

export class LocalStorageAdapter implements StorageAdapter {
  async getResume(id: string): Promise<Resume | null> {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}resume:${id}`)
    if (!raw) return null
    const parsed = ResumeSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      console.warn('Invalid resume data in localStorage:', parsed.error)
      return null
    }
    return parsed.data
  }

  async saveResume(resume: Resume): Promise<void> {
    localStorage.setItem(
      `${STORAGE_PREFIX}resume:${resume.id}`,
      JSON.stringify(resume)
    )
  }

  async deleteResume(id: string): Promise<void> {
    localStorage.removeItem(`${STORAGE_PREFIX}resume:${id}`)
  }

  async listResumes(): Promise<Resume[]> {
    const resumes: Resume[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${STORAGE_PREFIX}resume:`)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = ResumeSchema.safeParse(JSON.parse(raw))
          if (parsed.success) resumes.push(parsed.data)
        }
      }
    }
    return resumes
  }

  // ... similar for JobDescription operations

  async getSchemaVersion(): Promise<number> {
    const raw = localStorage.getItem(SCHEMA_VERSION_KEY)
    return raw ? parseInt(raw, 10) : 0
  }

  async setSchemaVersion(version: number): Promise<void> {
    localStorage.setItem(SCHEMA_VERSION_KEY, String(version))
  }

  async exportAll(): Promise<string> {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key)
        if (raw) data[key] = JSON.parse(raw)
      }
    }
    return JSON.stringify(data, null, 2)
  }

  async importAll(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString) as Record<string, unknown>
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
  }
}
```

### Vitest Configuration for Next.js 16

```typescript
// vitest.config.ts
// Source: Next.js official docs [VERIFIED: nextjs.org/docs/app/guides/testing/vitest]
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
```

### Tailwind CSS v4 globals.css

```css
/* src/app/globals.css */
/* Source: UI-SPEC + Tailwind v4 docs [VERIFIED: UI-SPEC, tailwindcss.com/blog/tailwindcss-v4] */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-success: oklch(0.723 0.191 142.5);
  --color-warning: oklch(0.768 0.165 54.0);
  --color-danger: oklch(0.577 0.245 27.3);
}

/* shadcn CSS variables are generated by shadcn init and live in :root {} below this */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js (v3) | @theme in CSS (v4) | Tailwind CSS 4.0 (Jan 2025) | No JS config file. All theming in globals.css. |
| @tailwind base/components/utilities | @import "tailwindcss" | Tailwind CSS 4.0 | Single import replaces three directives |
| tailwindcss-animate | tw-animate-css | shadcn CLI v4 (2025) | shadcn init installs tw-animate-css by default |
| middleware.ts | proxy.ts | Next.js 16 (Feb 2026) | File and export renamed; not used in Phase 1 |
| useFormState | useActionState | React 19 / Next.js 16 | Old hook removed entirely |
| next lint | eslint . (direct) | Next.js 16 | next lint command removed; run ESLint directly |
| Zustand v4 middleware imports | Zustand v5 paths | Zustand 5.0 (2025) | immer from 'zustand/middleware/immer' |
| Synchronous cookies()/headers() | Async await cookies() | Next.js 16 | Must await; sync access removed |

**Deprecated/outdated:**
- `tailwind.config.js` -- replaced by CSS-first @theme in v4
- `tailwindcss-animate` -- replaced by `tw-animate-css` in shadcn v4
- `next lint` -- removed in Next.js 16, use ESLint directly
- `middleware.ts` -- renamed to `proxy.ts` in Next.js 16
- `PanelGroup` / `PanelResizeHandle` exports from react-resizable-panels -- renamed to `Group` / `Separator` in v4 (shadcn wrapper handles this)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Storage adapter should use async interface (Promises) even for localStorage, to match future database adapter | Architecture Patterns - Pattern 3 | LOW -- easy to change; async is a superset of sync |
| A2 | `useMediaQuery` custom hook (~10 lines) is sufficient for responsive layout detection | Architecture Patterns - Pattern 4 | LOW -- standard React pattern, well-documented |
| A3 | Zustand persist's `partialize` option correctly filters what gets persisted while keeping full state in memory | Architecture Patterns - Pattern 1 | LOW -- documented in Zustand persist docs |
| A4 | shadcn resizable v4 compatibility issue has been fixed in latest CLI | Common Pitfalls - Pitfall 3 | MEDIUM -- if not fixed, requires manual import correction (5-minute fix) |

## Open Questions

1. **create-next-app `--yes` src directory default**
   - What we know: The `--yes` flag uses defaults. Recent docs suggest src directory is included in defaults.
   - What's unclear: Whether `--yes` automatically selects `--src-dir` or still prompts.
   - Recommendation: Use explicit flags: `--src-dir` to guarantee the src directory structure matching DESIGN.md.

2. **Zustand persist + storage adapter interaction**
   - What we know: Zustand persist has its own localStorage mechanism. The StorageAdapter is a separate abstraction for M2 database swap.
   - What's unclear: Whether both Zustand persist AND the storage adapter should write to localStorage, or if the storage adapter replaces Zustand persist entirely.
   - Recommendation: Use Zustand persist for in-memory state persistence (auto-save on every change). Use the StorageAdapter for explicit save/load operations (export/import, future database). They serve different purposes and can coexist.

3. **AGENTS.md generated by create-next-app**
   - What we know: Next.js 16 generates AGENTS.md with current API patterns.
   - What's unclear: Whether it conflicts with CLAUDE.md.
   - Recommendation: Keep it if useful. CLAUDE.md takes precedence per project instructions.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 | Yes | v24.9.0 | -- (exceeds v20 minimum) |
| npm | Package install | Yes | 11.6.0 | -- |
| pnpm | CLAUDE.md mandate | **No** | -- | Install via `npm install -g pnpm` |
| git | Version control | Yes | 2.50.0 | -- |

**Missing dependencies with no fallback:**
- None (all blockers have install paths)

**Missing dependencies with fallback:**
- **pnpm:** Not installed but trivially installable via `npm install -g pnpm`. Must be installed before `create-next-app` scaffold.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (Wave 0 -- does not exist yet) |
| Quick run command | `pnpm vitest run --reporter=verbose` |
| Full suite command | `pnpm vitest run --coverage` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDN-01 | Next.js app starts without errors | smoke | `pnpm dev` (manual) + `pnpm build` (automated) | No -- Wave 0 |
| FNDN-02 | Three panels render on desktop, tabs on mobile | component | `pnpm vitest run src/components/layout/__tests__/editor-layout.test.tsx` | No -- Wave 0 |
| FNDN-03 | Zustand store slices exist with correct initial state | unit | `pnpm vitest run src/lib/store/__tests__/store.test.ts` | No -- Wave 0 |
| FNDN-04 | Storage adapter reads/writes to localStorage | unit | `pnpm vitest run src/lib/storage/__tests__/local-storage.test.ts` | No -- Wave 0 |
| FNDN-05 | Zod schemas parse valid data, reject invalid data | unit | `pnpm vitest run src/types/__tests__/schemas.test.ts` | No -- Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm vitest run --reporter=verbose`
- **Per wave merge:** `pnpm vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` -- framework config, must be created during scaffold
- [ ] `src/test/setup.ts` -- test setup file importing @testing-library/jest-dom
- [ ] `src/components/layout/__tests__/editor-layout.test.tsx` -- covers FNDN-02
- [ ] `src/lib/store/__tests__/store.test.ts` -- covers FNDN-03
- [ ] `src/lib/storage/__tests__/local-storage.test.ts` -- covers FNDN-04
- [ ] `src/types/__tests__/schemas.test.ts` -- covers FNDN-05
- [ ] Framework install: `pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 1 has no auth (M1 = no backend) |
| V3 Session Management | No | No sessions in Phase 1 |
| V4 Access Control | No | No access control in Phase 1 |
| V5 Input Validation | Yes | Zod schema validation on all localStorage reads |
| V6 Cryptography | No | No secrets or encryption in Phase 1 |

### Known Threat Patterns for Phase 1 Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage data tampering | Tampering | Zod validation on every read; reject invalid data gracefully |
| localStorage quota exhaustion | Denial of Service | Catch QuotaExceededError; warn user with export option (ERRH-03, Phase 4) |
| XSS via resume content rendering | Tampering | React's default JSX escaping; Tiptap sanitizes HTML (Phase 2 concern) |

## Sources

### Primary (HIGH confidence)
- npm registry -- version verification for all packages (Next.js 16.2.3, React 19.2.5, Zustand 5.0.12, Zod 4.3.6, Tailwind 4.2.2, react-resizable-panels 4.10.0, Vitest 4.1.4, etc.)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) -- Turbopack default, proxy.ts rename, React 19 requirement
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Breaking changes, async request APIs
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app flags, defaults
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, @theme directive
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) -- shadcn init, Tailwind v4 support
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) -- tw-animate-css, @theme inline
- [shadcn/ui Resizable docs](https://ui.shadcn.com/docs/components/radix/resizable) -- react-resizable-panels wrapper
- [Zustand slices pattern](https://deepwiki.com/pmndrs/zustand/7.1-slices-pattern) -- Slice pattern documentation
- [Zod v4 docs](https://zod.dev/) -- Schema API, type inference, safeParse
- DESIGN.md -- Data model, ATS scoring algorithm, project structure
- 01-UI-SPEC.md -- Layout contract, typography, color, spacing, component specs
- 01-CONTEXT.md -- User decisions D-01 through D-09

### Secondary (MEDIUM confidence)
- [Zustand GitHub #1382](https://github.com/pmndrs/zustand/discussions/1382) -- SSR hydration fix for persist middleware
- [Zustand GitHub #2527](https://github.com/pmndrs/zustand/discussions/2527) -- Middleware combination patterns
- [shadcn-ui/ui #9136](https://github.com/shadcn-ui/ui/issues/9136) -- react-resizable-panels v4 export name issue
- [react-resizable-panels npm](https://www.npmjs.com/package/react-resizable-panels) -- API for minSize, maxSize, units
- [Next.js Vitest testing guide](https://nextjs.org/docs/app/guides/testing/vitest) -- Official Vitest setup for Next.js

### Tertiary (LOW confidence)
- None -- all findings verified against primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, all libraries are current stable releases
- Architecture: HIGH -- patterns verified against official docs and community best practices, DESIGN.md provides clear data model
- Pitfalls: HIGH -- all pitfalls verified against GitHub issues and official docs with specific issue numbers

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (stable stack, 30 days)
