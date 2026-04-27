---
phase: 03-job-description-ats-scoring
generated_from: 03-RESEARCH.md §Validation Architecture
---

# Phase 03 Validation Architecture

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` |
| Quick run | `pnpm test -- --run src/__tests__/scoring/` |
| Full suite | `pnpm test` |

## Requirement → Test Map

| Req ID | Behavior | Test Type | File |
|--------|----------|-----------|------|
| JDSC-01 | Textarea controlled, char count updates, clear resets state | unit | `src/__tests__/ai/api-key-store.test.ts` |
| JDSC-02 | extractKeywords returns KeywordSet on success, error type on failure | unit (mock fetch) | `src/__tests__/ai/extract-keywords.test.ts` |
| JDSC-03 | Keyword chips render by category | component smoke | `src/__tests__/jd-panel/keyword-chips.test.tsx` |
| JDSC-04 | API key save/load/clear round-trips localStorage | unit | `src/__tests__/ai/api-key-store.test.ts` |
| JDSC-05 | Error states render for each error type | component smoke | `src/__tests__/ai/extract-keywords.test.ts` |
| SCORE-01 | computeAtsScore is synchronous, returns in <5ms | unit + timing | `src/__tests__/scoring/ats-scorer.test.ts` |
| SCORE-02 | Weights sum to 1.0; each category contributes correctly | unit | `src/__tests__/scoring/ats-scorer.test.ts` |
| SCORE-03 | matchKeywords("JS") returns true for "JavaScript" keyword | unit | `src/__tests__/scoring/fuse-matcher.test.ts` |
| SCORE-04 | ScorePanel renders ring + bars + chips without crash | component smoke | `src/__tests__/score-panel/score-panel.test.tsx` |
| SCORE-05 | useAtsScore debounces 300ms (vi.useFakeTimers) | unit | `src/__tests__/hooks/use-ats-score.test.ts` |
| SCORE-06 | setKeywords triggers score recompute via hook | integration | `src/__tests__/hooks/use-ats-score.test.ts` |

## Sampling Rate

- **Per task commit:** `pnpm test` (full suite)
- **Per wave merge:** `pnpm test && pnpm build`
- **Phase gate:** Full suite green + manual: paste real JD → keywords appear → edit resume → score updates within 300ms

## Wave 0 Gaps (all created in plans)

- `src/__tests__/scoring/ats-scorer.test.ts` — pure function tests, no mocks
- `src/__tests__/scoring/fuse-matcher.test.ts` — alias matching ("JS" → "JavaScript")
- `src/__tests__/scoring/formatting-checker.test.ts` — section presence checks
- `src/__tests__/ai/extract-keywords.test.ts` — mock fetch, error mapping
- `src/__tests__/ai/api-key-store.test.ts` — localStorage round-trip
- `src/__tests__/hooks/use-ats-score.test.ts` — 300ms debounce with fake timers
