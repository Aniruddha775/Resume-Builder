---
phase: 01-foundation-layout
plan: 03
subsystem: ui
tags: [react, nextjs, tailwind, shadcn, resizable-panels, responsive-layout, accessibility]

requires:
  - phase: 01-01
    provides: Next.js 16 scaffold with shadcn/ui initialized, resizable + tabs components installed

provides:
  - Responsive three-panel layout (desktop: resizable side-by-side; mobile: tabbed navigation)
  - AppHeader with "Rese" brand
  - PanelPlaceholder reusable component
  - useMediaQuery hook (SSR-safe, returns boolean | undefined)
  - Full viewport h-dvh layout shell ready for downstream content

affects: [02-resume-editor-pdf, 03-job-description-ats-scoring]

tech-stack:
  added: []
  patterns:
    - EditorLayout as responsive orchestrator (returns null on SSR, then resolves to desktop or mobile)
    - PanelPlaceholder as Server Component (no 'use client' needed for pure rendering)
    - aria-labelledby + semantic h2 for panel section labeling (avoids duplicate screen reader announcements)

key-files:
  created:
    - src/hooks/use-media-query.ts
    - src/components/layout/panel-placeholder.tsx
    - src/components/layout/app-header.tsx
    - src/components/layout/desktop-layout.tsx
    - src/components/layout/mobile-layout.tsx
    - src/components/layout/editor-layout.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "react-resizable-panels uses orientation='horizontal' not direction='horizontal' in this version"
  - "tabs.tsx wraps base-ui (not Radix) — active state is data-active, not data-[state=active]"
  - "Active tab: data-active:bg-transparent overrides base component's pill style, leaving only border-b-2 indicator"
  - "PanelPlaceholder is a Server Component — no 'use client' needed for pure render components"
  - "Desktop panels use aria-labelledby + h2; mobile panels use aria-labelledby + sr-only h2 (tab label is the visible heading)"

patterns-established:
  - "Pattern: useMediaQuery returns undefined during SSR, EditorLayout returns null — prevents hydration mismatch"
  - "Pattern: h-dvh on root, flex-1 overflow-hidden on main — full viewport without double scrollbars"

requirements-completed: [FNDN-02]

duration: 30min
completed: 2026-04-21
---

# Phase 01 Plan 03: Three-Panel Layout Summary

**Delivered the responsive application shell: resizable three-panel desktop layout (27/46/27) and tabbed mobile navigation, with instructional placeholders, semantic ARIA, and a minimal "Rese" header — 55 tests still passing, build clean.**

## Performance

- **Duration:** ~30 min
- **Completed:** 2026-04-21
- **Tasks:** 2/3 code tasks complete (Task 3 = human visual verification, pending)
- **Files modified:** 7 created, 1 modified

## Accomplishments

- **Desktop layout**: Three `ResizablePanel` at 27/46/27 default proportions (min 15/20/15) with drag handles. `react-resizable-panels` uses `orientation` not `direction` in this version — caught and fixed during implementation.

- **Mobile layout**: shadcn/base-ui `Tabs` with three tabs (Job Description, Editor, Score), defaulting to Editor. Active tab uses bottom-border indicator (`data-active:border-b-2 data-active:border-primary`) with pill background suppressed via `data-active:bg-transparent`.

- **Accessibility**: All panel sections use `aria-labelledby` + semantic `<h2>` (visible on desktop, `sr-only` on mobile where the tab trigger is the visible heading). No duplicate screen reader announcements.

- **SSR safety**: `useMediaQuery` returns `undefined` server-side; `EditorLayout` returns `null` until client resolves. Prevents hydration mismatch.

## Awaiting

Task 3: Human visual verification — run `pnpm dev` and confirm layout in browser.
