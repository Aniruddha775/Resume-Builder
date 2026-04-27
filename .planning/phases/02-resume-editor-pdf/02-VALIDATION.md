---
phase: 2
slug: resume-editor-pdf
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=verbose`
- **After every plan wave:** Run `pnpm vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | EDIT-04/05/06/07 (deps) | T-02-01-01, T-02-01-02 | mitigate (pinned versions, official registry) | build | `pnpm build` | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | EDIT-04/05 (slice CRUD) | T-02-01-06 | accept (crypto.randomUUID) | unit | `pnpm vitest run src/__tests__/store/resume-slice-crud.test.ts src/__tests__/store.test.ts` | ✅ created by task | ⬜ pending |
| 02-01-03 | 01 | 1 | EDIT-06/07 (fixture, hooks) | T-02-01-03, T-02-01-04, T-02-01-05 | mitigate (Zod validate on read; bounded 10s interval) | unit | `pnpm vitest run src/__tests__/data src/__tests__/hooks` | ✅ created by task | ⬜ pending |
| 02-01-04 | 01 | 1 | EDIT-04 (Tiptap nodes) | T-02-01-08, T-02-01-09 | mitigate (ProseMirror schema, safe renderHTML) | build+lint | `pnpm build && pnpm lint` | N/A | ⬜ pending |
| 02-02-01 | 02 | 2 | EDIT-01/03/04 (Tiptap mappers) | T-02-02-02 | mitigate (defensive filter on node type) | unit | `pnpm vitest run src/__tests__/tiptap` | ✅ created by task | ⬜ pending |
| 02-02-02 | 02 | 2 | EDIT-01/02/03 (editor mount) | T-02-02-01 | mitigate (ProseMirror schema, no dangerouslySetInnerHTML) | unit | `pnpm vitest run src/__tests__/editor` | ✅ created by task | ⬜ pending |
| 02-02-03 | 02 | 2 | EDIT-04/05/06 (sections) | T-02-02-03, T-02-02-07 | mitigate (Zod invariant enforced in handleCurrentChange; trim+dedup on skill tags) | unit+build+lint | `pnpm vitest run src/__tests__ && pnpm build && pnpm lint` | N/A | ⬜ pending |
| 02-03-01 | 03 | 2 | PDF-01/02/03/04 (fonts) | T-02-03-01 | mitigate (same-origin /fonts/, no CDN) | build | `pnpm build` + `test -f public/fonts/Inter-*.ttf` | ✅ created by task | ⬜ pending |
| 02-03-02 | 03 | 2 | PDF-03/04 (template + download) | T-02-03-02, T-02-03-06 | mitigate (Text primitives not HTML; TTF magic verified) | unit | `pnpm vitest run src/__tests__/pdf` | ✅ created by task | ⬜ pending |
| 02-03-03 | 03 | 2 | PDF-01/02/03/05 (preview+export) | T-02-03-04, T-02-03-05, T-02-03-08, T-02-03-09 | mitigate (800ms debounce; revokeObjectURL; 'use client' on consumers; no paywall/watermark) | unit+build+lint | `pnpm vitest run src/__tests__/pdf && pnpm build && pnpm lint` | ✅ created by task | ⬜ pending |
| 02-04-01 | 04 | 3 | EDIT-07 (bootstrap + SavedIndicator) | T-02-04-02, T-02-04-04 | mitigate (null-guard on bootstrap; integer counter not sensitive) | unit | `pnpm vitest run src/__tests__/editor/saved-indicator.test.tsx src/__tests__/app` | ✅ created by task | ⬜ pending |
| 02-04-02 | 04 | 3 | EDIT-01..07, PDF-01..05 (integration) | T-02-04-01, T-02-04-03 | accept (single-user M1; 10s interval low-cost) | unit+build+lint | `pnpm test && pnpm build && pnpm lint` | N/A | ⬜ pending |
| 02-04-03 | 04 | 3 | PDF-04 (manual visual) | T-02-04-05 | mitigate (exhaustive how-to-verify script) | manual | Run `pnpm dev`, follow Plan 04 Task 3 how-to-verify checklist | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Every task in the phase has an `<automated>` verify command pointing at an existing test file OR build/lint/dev gate. No Wave 0 test scaffolding is needed because each task's TDD behavior creates its own `*.test.ts(x)` file as part of its action list. Concretely:

- [x] Plan 01 Task 2 creates `src/__tests__/store/resume-slice-crud.test.ts`
- [x] Plan 01 Task 3 creates `src/__tests__/data/sample-resume.test.ts`, `src/__tests__/hooks/use-debounced-value.test.ts`, `src/__tests__/hooks/use-autosave.test.ts`
- [x] Plan 01 Task 4 is build+lint-gated (no test file — node modules are pure schema definitions exercised by Plan 02 Task 1's mapper tests)
- [x] Plan 02 Task 1 creates `src/__tests__/tiptap/schema.test.ts`
- [x] Plan 02 Task 2 creates `src/__tests__/editor/resume-editor.test.tsx` (+ inline `src/__tests__/editor/contact-form.test.tsx`)
- [x] Plan 02 Task 3 is build+lint-gated (inherits section-level CRUD coverage from Plan 01 Task 2 slice tests)
- [x] Plan 03 Task 1 is build+file-existence-gated (font TTFs are static assets)
- [x] Plan 03 Task 2 creates `src/__tests__/pdf/template.test.tsx`, `src/__tests__/pdf/download.test.ts`
- [x] Plan 03 Task 3 creates `src/__tests__/pdf/preview-panel.test.tsx`
- [x] Plan 04 Task 1 creates `src/__tests__/editor/saved-indicator.test.tsx`, `src/__tests__/app/resume-bootstrap.test.tsx`
- [x] Plan 04 Task 2 is build+lint+test-suite gated (relies on Task 1 tests plus prior plan coverage)
- [x] Plan 04 Task 3 is the manual human-verification checkpoint (D-01..D-17 end-to-end)

Every automated command listed in the Per-Task Verification Map resolves to a real path or a valid CLI gate once the task runs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF exports with text-selectable content, single column, standard headings | PDF-04 | Requires visual PDF inspection and ATS parser check | Open exported PDF, verify text selection works; check headings are standard ALL-CAPS with 0.5pt rule; confirm single column layout |
| Live PDF preview updates within ~800ms | PDF-01 | Requires real-time interaction timing | Type in editor, observe preview panel update latency visually (Plan 04 Task 3 step 3a) |
| Saved indicator flashes for ~2s after 10s autosave | EDIT-07 / D-15 | Requires real-time wait + visual check | Make an edit, wait 10s, observe header for green "Saved" chip flash (Plan 04 Task 3 step 4) |
| Mobile tab layout + Preview rename | D-01, D-02 | Requires browser resize below 1024px | Resize browser, verify three tabs JD / Editor / Preview (Plan 04 Task 3 step 6) |
| SAMPLE_RESUME seeds on fresh localStorage | D-16, D-17 | Requires localStorage clear + reload | Clear localStorage, reload, verify Alex Johnson appears (Plan 04 Task 3 step 7) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (all tests created by their own tasks; no external Wave 0 stubs needed)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] ESLint gate (`pnpm lint`) added to the final task of each wave per CLAUDE.md §Next.js 16 Specifics (no `next lint`)

**Approval:** approved (revision 2 — all BLOCKER issues resolved, all WARNING issues addressed)
</content>
</invoke>