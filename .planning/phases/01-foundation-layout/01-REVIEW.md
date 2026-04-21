---
phase: 01-foundation-layout
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 31
files_reviewed_list:
  - src/__tests__/setup.ts
  - src/__tests__/storage.test.ts
  - src/__tests__/store.test.ts
  - src/__tests__/types.test.ts
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/layout/app-header.tsx
  - src/components/layout/desktop-layout.tsx
  - src/components/layout/editor-layout.tsx
  - src/components/layout/mobile-layout.tsx
  - src/components/layout/panel-placeholder.tsx
  - src/hooks/use-hydration.ts
  - src/hooks/use-media-query.ts
  - src/lib/storage/adapter.ts
  - src/lib/storage/local-storage.ts
  - src/lib/store/index.ts
  - src/lib/store/slices/job-description-slice.ts
  - src/lib/store/slices/keywords-slice.ts
  - src/lib/store/slices/resume-slice.ts
  - src/lib/store/slices/score-slice.ts
  - src/lib/store/slices/ui-slice.ts
  - src/lib/utils.ts
  - src/types/job-description.ts
  - src/types/resume.ts
  - src/types/score.ts
  - src/types/storage.ts
  - vitest.config.ts
  - next.config.ts
  - eslint.config.mjs
  - package.json
findings:
  critical: 0
  warning: 4
  info: 5
  total: 9
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 31
**Status:** issues_found

## Summary

This phase establishes the project foundation: TypeScript types with Zod schemas, a localStorage storage adapter, a Zustand store with immer middleware, and the three-panel layout with responsive desktop/mobile switching. The overall code quality is high. Types are well-structured, Zod schemas are thorough, the storage adapter has solid error handling, and the tests are comprehensive.

Four warnings and five info items were found. No critical (security or crash) issues exist. The most impactful findings are: a silent data-loss window in `updateBullet` when `bulletIndex` is out of range; a layout flash on first render caused by `EditorLayout` returning `null` during hydration; and missing persistence of the `zustand/persist` middleware order in the store, which causes the middleware stack type to be mismatched.

---

## Warnings

### WR-01: `updateBullet` silently overwrites with `undefined` on out-of-range bullet index

**File:** `src/lib/store/slices/resume-slice.ts:25-27`
**Issue:** When `bulletIndex` is beyond the current array length, `immer` will write `undefined` into the sparse slot (e.g., `bullets[99] = text`). The array becomes sparse and Zod will later fail validation when the resume is read back from localStorage, silently discarding the resume. The `expIndex` guard checks the experience entry exists but there is no corresponding guard for `bulletIndex`.
**Fix:**
```typescript
updateBullet: (expIndex, bulletIndex, text) =>
  set((state) => {
    const exp = state.resume?.sections.experience[expIndex]
    if (exp && bulletIndex >= 0 && bulletIndex < exp.bullets.length) {
      exp.bullets[bulletIndex] = text
    }
  }),
```

---

### WR-02: Layout flash — `EditorLayout` returns `null` during initial render

**File:** `src/components/layout/editor-layout.tsx:8`
**Issue:** `useMediaQuery` returns `undefined` until the first `useEffect` fires. `EditorLayout` returns `null` during this window, causing the entire content area to be blank on first paint. On slow connections or devices, this is a visible flash of empty content. The `useHydration` hook exists in the codebase but is unused here.
**Fix:** Return a skeleton/loading state instead of `null`, or default to the desktop layout server-side and let the client correct it:
```typescript
// Option A: default to DesktopLayout before hydration (avoids blank flash on most screens)
if (isDesktop === undefined) return <DesktopLayout />

// Option B: render a full-height placeholder matching the panel structure
if (isDesktop === undefined) {
  return <div className="h-full animate-pulse bg-muted" aria-hidden="true" />
}
```

---

### WR-03: `zustand/persist` middleware not listed in the Immer middleware tuple

**File:** `src/lib/store/index.ts:22-46` and all slice files
**Issue:** The store is created with `devtools(persist(immer(...)))`. The `StateCreator` type parameter in every slice declares the middleware tuple as `[['zustand/immer', never], ['zustand/devtools', never]]`, but `zustand/persist` is absent from this tuple. This means TypeScript does not enforce the correct type constraints on the slice creators — the type check is silently incomplete. While this does not cause a runtime error today, it will surface as confusing type errors when `get` or `set` is used in ways that depend on persist's type augmentation.
**Fix:** Add `['zustand/persist', unknown]` to each slice's middleware tuple, in the order the middlewares are applied (outermost first):
```typescript
export const createResumeSlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', unknown], ['zustand/immer', never]],
  [],
  ResumeSlice
> = (set) => ({ ... })
```
Apply the same change to all five slice files.

---

### WR-04: `listResumes` iteration is not safe when items are added/removed during iteration

**File:** `src/lib/storage/local-storage.ts:42-61`
**Issue:** The loop iterates `localStorage` by numeric index (`for (let i = 0; i < localStorage.length; i++)`). `localStorage.key(i)` returns keys in insertion order and the length is stable during a synchronous loop in a single-threaded environment. However, the pattern is fragile: if `localStorage` is ever accessed from a shared worker or if another part of the codebase calls `removeItem` during the loop (impossible today but an easy future regression), iteration will silently skip entries. The same pattern appears in `exportAll`.
**Fix:** Snapshot the keys first, then iterate the snapshot:
```typescript
async listResumes(): Promise<Resume[]> {
  const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
  const resumes: Resume[] = []
  for (const key of keys) {
    if (key?.startsWith(`${STORAGE_PREFIX}resume:`)) {
      const raw = localStorage.getItem(key)
      if (raw) {
        try {
          const parsed = ResumeSchema.safeParse(JSON.parse(raw))
          if (parsed.success) resumes.push(parsed.data)
          else console.warn(`Invalid resume data for key ${key}:`, parsed.error)
        } catch { /* skip corrupt */ }
      }
    }
  }
  return resumes
}
```
Apply the same pattern to `exportAll`.

---

## Info

### IN-01: `useHydration` hook is defined but never imported or used

**File:** `src/hooks/use-hydration.ts`
**Issue:** The hook is present but has no import site anywhere in the reviewed files. It was presumably written in anticipation of `EditorLayout`'s hydration guard (see WR-02) but was not wired up.
**Fix:** Either use it in `EditorLayout` as the hydration guard, or delete it until it has a consumer. Dead exports accumulate and make refactoring harder.

---

### IN-02: `package.json` — `lucide-react` version `^1.8.0` is unusually high

**File:** `package.json:23`
**Issue:** The published lucide-react package is at `0.x` as of the knowledge cutoff. Version `^1.8.0` either reflects a very recent major release or is a typo/mispin. If it is a mispin, the project would fail to install on a clean checkout. Worth confirming the installed version matches what is expected.
**Fix:** Verify with `pnpm list lucide-react` that the resolved version exists on the npm registry and matches the intent. If `0.x` was intended, update the range to `^0.x.y`.

---

### IN-03: `vitest.config.ts` does not set `coverage` provider

**File:** `vitest.config.ts`
**Issue:** The `test:coverage` script in `package.json` runs `vitest run --coverage`, but `vitest.config.ts` has no `coverage` block. Vitest will fall back to its default provider (`v8`) and write to `./coverage` with no exclusions. This works but means uncovered generated files, test files themselves, and config files inflate coverage reports.
**Fix:** Add an explicit coverage config:
```typescript
test: {
  // ... existing config ...
  coverage: {
    provider: 'v8',
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/__tests__/**', 'src/**/*.test.{ts,tsx}'],
  },
},
```

---

### IN-04: `ContactInfoSchema` — `phone` minimum length of 7 is too permissive

**File:** `src/types/resume.ts:6`
**Issue:** `z.string().min(7)` accepts strings as short as `"1234567"` which are not valid phone numbers by any standard (E.164 minimum is 8 digits plus the `+` prefix = 9 characters). A blank phone field saved as spaces also passes. This is a type constraint, not a security issue, but it will allow garbage data to pass schema validation silently.
**Fix:** Use a regex that accepts common formats without being overly strict:
```typescript
phone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'),
```

---

### IN-05: `globals.css` — `@import "shadcn/tailwind.css"` is a bare package import with no version pin

**File:** `src/app/globals.css:3`
**Issue:** This CSS import resolves through the `shadcn` package in `node_modules`. The `shadcn` package is listed as a devDependency (`"shadcn": "^4.2.0"`), so it is available at build time. However, bare CSS imports from `node_modules` via `@import` can silently break when the package name or internal path changes across minor versions without a lockfile update. This is a minor structural concern, not a crash.
**Fix:** No immediate action required if the lockfile is committed and Vercel reads it. Document this dependency in a comment for future maintainers:
```css
/* shadcn/tailwind.css — provided by the `shadcn` devDependency (see package.json) */
@import "shadcn/tailwind.css";
```

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
