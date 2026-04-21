---
phase: 01-foundation-layout
plan: 02
subsystem: data
tags: [zod, zustand, typescript, localStorage, immer]

requires:
  - phase: 01-01
    provides: Next.js 16 scaffold with Vitest, TypeScript, Tailwind, shadcn/ui initialized

provides:
  - Zod schemas and inferred TypeScript types for Resume, JobDescription, Score, StorageAdapter
  - Zustand store with five domain slices (resume, jobDescription, keywords, score, ui) + immer/persist/devtools middleware
  - localStorage StorageAdapter with Zod-validated reads, key prefix 'rese:', schema versioning, export/import

affects: [03-job-description-ats-scoring, 02-resume-editor-pdf, 05-auth-persistent-storage]

tech-stack:
  added: [zustand@5, immer@10, zod@4]
  patterns:
    - StateCreator slice pattern with middleware mutator generics
    - Zod safeParse on all localStorage reads (never trust stored data)
    - Factory function (createStorageAdapter) for storage backend swappability

key-files:
  created:
    - src/types/resume.ts
    - src/types/job-description.ts
    - src/types/score.ts
    - src/types/storage.ts
    - src/lib/store/index.ts
    - src/lib/store/slices/resume-slice.ts
    - src/lib/store/slices/job-description-slice.ts
    - src/lib/store/slices/keywords-slice.ts
    - src/lib/store/slices/score-slice.ts
    - src/lib/store/slices/ui-slice.ts
    - src/lib/storage/adapter.ts
    - src/lib/storage/local-storage.ts
    - src/hooks/use-hydration.ts
    - src/__tests__/types.test.ts
    - src/__tests__/store.test.ts
    - src/__tests__/storage.test.ts
  modified: []

key-decisions:
  - "immer imported from 'zustand/middleware/immer' not 'zustand/middleware' (Zustand v5 breaking change)"
  - "persist partialize excludes score (derived) and ui (session-only); keywords persisted to avoid re-extraction on reload"
  - "ExperienceSchema uses .refine() to enforce current === (endDate === null) invariant"
  - "matchedIn field uses ResumeSectionSchema enum not bare z.string()"
  - "importAll guards JSON.parse with try/catch and throws typed error on malformed input"

patterns-established:
  - "Pattern: All localStorage reads go through Zod safeParse — corrupt data returns null with console.warn, never crashes"
  - "Pattern: StorageAdapter factory pattern — swap to DatabaseAdapter in Phase 5 by changing createStorageAdapter()"
  - "Pattern: Zustand store reset in beforeEach via useAppStore.setState() — no component rendering needed for state tests"

requirements-completed: [FNDN-03, FNDN-04, FNDN-05]

duration: 45min
completed: 2026-04-21
---

# Phase 01 Plan 02: Data Layer Summary

**Established the full typed data backbone: Zod schemas for all entities, five-slice Zustand store with immer persistence, and a Zod-validated localStorage adapter — 55 tests passing with zero regressions.**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-04-21
- **Tasks:** 3/3 completed
- **Files modified:** 16 created, 0 modified

## Accomplishments

- **Types layer**: Zod 4 schemas for Resume (with `.refine()` enforcing current/endDate invariant), JobDescription (extractedKeywords nullable), ScoreResult (totalScore 0–100, breakdown with 5 weighted categories), and StorageAdapter interface. All schemas export both schema and `z.infer<>` type. `ResumeSectionSchema` enum constrains `matchedIn` to actual section names.

- **State layer**: Zustand 5 store with `devtools → persist → immer` middleware stack. Five slices (resume, jobDescription, keywords, score, ui). `persist` partializes to resume/jobDescription/keywords only; score and ui are session state. `useHydration` hook for SSR safety.

- **Storage layer**: `LocalStorageAdapter` implementing all 11 `StorageAdapter` methods. All reads go through Zod safeParse with console.warn on failure. All `JSON.parse` wrapped in try/catch. `importAll` validates the incoming JSON string. `setSchemaVersion` guards against non-integer input.

## Test Coverage

- `types.test.ts`: 18 tests (Zod schema validation, nullable/optional distinctions, enum validation, score range, refine invariant)
- `store.test.ts`: 19 tests (all five slices, initial state, mutations, immer deep update)
- `storage.test.ts`: 16 tests (roundtrip CRUD, corrupt data rejection, export/import, schema versioning, malformed JSON)
- **Total: 55 tests, all passing**
