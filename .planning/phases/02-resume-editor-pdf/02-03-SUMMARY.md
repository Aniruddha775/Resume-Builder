---
phase: "02"
plan: "03"
subsystem: pdf
tags: [pdf, preview, export, tdd]
requires: [02-01, 02-02]
provides: [pdf-preview-panel, export-pdf-button]
affects: [editor-layout]
tech-stack:
  added: []
  patterns: [usePDF, useDebouncedValue, iframe-preview]
key-files:
  created:
    - src/components/pdf/pdf-preview.tsx
    - src/components/pdf/export-pdf-button.tsx
    - src/components/pdf/pdf-preview-panel.tsx
    - src/__tests__/pdf/preview-panel.test.tsx
  modified: []
decisions:
  - "iframe for preview instead of PDFViewer — avoids Acrobat styling, works cross-browser"
  - "Export reads store.getState().resume (non-debounced) — avoids 800ms stale snapshot on click"
  - "FALLBACK_RESUME typed as Resume — eliminates any cast, satisfies lint"
  - "Font.register via side-effect import — avoids re-registration on every render"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-22"
  tasks: 3
  files: 4
---

# Phase 02 Plan 03: PDF Preview Panel Summary

Live PDF preview panel with 800ms debounce and one-click export — no watermarks, no paywalls.

## What was built

- `src/components/pdf/pdf-preview.tsx` — `usePDF` hook with `useDebouncedValue(resume, 800)` debounce, `iframe` preview, loading spinner and error fallback states
- `src/components/pdf/export-pdf-button.tsx` — reads `useAppStore.getState().resume` (non-debounced) for export freshness, calls `pdf(<ModernCleanTemplate>).toBlob()` then `downloadBlob`
- `src/components/pdf/pdf-preview-panel.tsx` — right-panel host: "Preview" `<h2>` heading + `<ExportPdfButton>` + `<PdfPreview>` composition
- `src/__tests__/pdf/preview-panel.test.tsx` — smoke test: mocks `usePDF` and `fonts` side-effect, asserts heading and Export PDF button are in DOM

## Key decisions

- `iframe` for preview (not `PDFViewer`) — avoids Acrobat styling overhead, works cross-browser, no extra dependency
- Export reads non-debounced `store.getState().resume` — clicking Export immediately after typing gets the latest content, not an 800ms-stale snapshot
- `FALLBACK_RESUME` typed as `Resume` (not `as any`) — satisfies `@typescript-eslint/no-explicit-any`, passes lint
- Fonts registered via `import '@/lib/pdf/fonts'` side-effect — registration happens once at module load, not on every render cycle

## Test coverage

- preview-panel smoke test: 1 passing (heading + button in DOM)
- Full suite: 106 passing, 2 todo (template tests — jsdom limitation with react-pdf)
- Build: clean
- Lint: 0 errors (1 pre-existing warning in unrelated test file)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `FALLBACK_RESUME as any` caused lint error**
- Found during: Task 3 lint check
- Issue: `@typescript-eslint/no-explicit-any` error on the `as any` cast in pdf-preview.tsx
- Fix: Typed `FALLBACK_RESUME` explicitly as `Resume` — removes cast entirely
- Files modified: `src/components/pdf/pdf-preview.tsx`
- Commit: 6b20222 (same task commit)

## Known Stubs

None. All components wire to live store data.

## Threat Flags

None. No new network endpoints or auth paths introduced. PDF generation is client-side only.
