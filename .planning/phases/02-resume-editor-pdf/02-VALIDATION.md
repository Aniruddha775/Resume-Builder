---
phase: 2
slug: resume-editor-pdf
status: draft
nyquist_compliant: false
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
| 02-01-01 | 01 | 1 | EDIT-01 | — | N/A | unit | `pnpm vitest run src/types/resume.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | EDIT-01 | — | N/A | unit | `pnpm vitest run src/extensions/ResumeSection.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | EDIT-02 | — | N/A | unit | `pnpm vitest run src/lib/store/resumeStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | EDIT-03 | — | N/A | unit | `pnpm vitest run src/lib/store/resumeStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | EDIT-04 | — | N/A | unit | `pnpm vitest run src/lib/store/resumeStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | EDIT-05 | — | N/A | unit | `pnpm vitest run src/lib/store/resumeStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PDF-01 | — | N/A | unit | `pnpm vitest run src/components/pdf/ResumeDocument.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | PDF-02 | — | N/A | unit | `pnpm vitest run src/components/pdf/ResumeDocument.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | PDF-03 | — | N/A | unit | `pnpm vitest run src/components/pdf/ResumeDocument.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-04 | 03 | 3 | PDF-04 | — | N/A | manual | Visual PDF export check | N/A | ⬜ pending |
| 02-03-05 | 03 | 3 | PDF-05 | — | N/A | unit | `pnpm vitest run src/lib/storage/localStorage.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 3 | EDIT-06 | — | N/A | unit | `pnpm vitest run src/lib/storage/localStorage.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 3 | EDIT-07 | — | N/A | unit | `pnpm vitest run src/lib/storage/localStorage.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/types/resume.test.ts` — stubs for EDIT-01 type schema validation
- [ ] `src/extensions/ResumeSection.test.ts` — stubs for Tiptap node schema
- [ ] `src/lib/store/resumeStore.test.ts` — stubs for EDIT-02 through EDIT-05 CRUD operations
- [ ] `src/components/pdf/ResumeDocument.test.tsx` — stubs for PDF-01, PDF-02, PDF-03 rendering
- [ ] `src/lib/storage/localStorage.test.ts` — stubs for PDF-05, EDIT-06, EDIT-07 autosave/persistence

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF exports with text-selectable content, single column, standard headings | PDF-04 | Requires visual PDF inspection and ATS parser check | Open exported PDF, verify text selection works; check headings are standard h1/h2; confirm single column layout |
| Live PDF preview updates within ~800ms | PDF-01 | Requires real-time interaction timing | Type in editor, observe preview panel update latency visually |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
