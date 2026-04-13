---
phase: 1
slug: foundation-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm vitest run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=verbose`
- **After every plan wave:** Run `pnpm vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FNDN-01 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FNDN-05 | — | N/A | unit | `pnpm vitest run src/types` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FNDN-03 | — | N/A | unit | `pnpm vitest run src/stores` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | FNDN-04 | — | N/A | unit | `pnpm vitest run src/lib/storage` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | FNDN-02 | — | N/A | build+manual | `pnpm build && pnpm dev` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration with path aliases matching tsconfig
- [ ] `src/__tests__/setup.ts` — shared test setup (localStorage mock for jsdom)
- [ ] `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom` — test framework install

*Note: Wave 0 is created by the planner as part of the planning process.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Three-panel layout visible on desktop | FNDN-02 | Visual layout verification | Open http://localhost:3000, verify 3 panels visible at 1280px width |
| Panels reflow on mobile | FNDN-02 | Responsive behavior | Resize to 768px, verify tabbed navigation appears |
| Panel resize handles work | D-02 | Drag interaction | Drag panel divider, verify panels resize |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
