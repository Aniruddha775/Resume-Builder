# Pitfalls Research

**Domain:** AI Resume Builder with Live ATS Scoring
**Researched:** 2026-04-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: @react-pdf/renderer Font Encoding Breaks ATS Parsing

**What goes wrong:**
Custom fonts produce PDFs that look correct visually but extract as garbled text in ATS parsers. Known open issue #3047 in @react-pdf/renderer. The PDF renders fine in a viewer but Workday/Greenhouse/Lever extract gibberish.

**Why it happens:**
Font subsetting and encoding in PDF generation is fragile. Custom fonts often use non-standard glyph mappings that PDF viewers handle gracefully but text extraction algorithms (used by ATS) do not.

**How to avoid:**
Use only built-in PDF fonts (Courier, Times-Roman, Helvetica) for M1. Add automated text-extraction CI tests that verify exported PDFs contain the expected text when parsed programmatically.

**Warning signs:**
PDF looks correct when opened, but copy-pasting text from it produces garbled characters.

**Phase to address:** Phase with PDF export (launch blocker). Automated CI test required before shipping.

---

### Pitfall 2: ATS Score False Confidence / Keyword Stuffing

**What goes wrong:**
Users trust the score blindly, stuff keywords unnaturally, and get rejected by modern ATS systems that use semantic matching and penalize keyword stuffing.

**Why it happens:**
Simple keyword match scoring rewards raw keyword count without considering context. Users optimize for the number, not for quality.

**How to avoid:**
- Call it "Keyword Match Score" not "ATS Score" (honest framing)
- Add keyword stuffing detection (flag when same keyword appears 5+ times)
- Weight contextual matches higher than raw string matches
- Show a warning when score is high but content reads unnaturally

**Warning signs:**
Users achieving 95+ scores with resumes that read like keyword salads.

**Phase to address:** Phase with scoring engine implementation.

---

### Pitfall 3: Tiptap Re-render Cascade Makes Editor Laggy

**What goes wrong:**
Every keystroke triggers store update, which triggers score recomputation, which triggers React re-render of the entire app including the editor, creating visible lag.

**Why it happens:**
Without proper component isolation, React propagates state changes through the entire tree. The editor, score panel, and PDF preview all re-render on every keystroke.

**How to avoid:**
- Isolate editor component with React.memo
- Scoring computation via debounced callback, not React state propagation
- Zustand selective subscriptions (score panel subscribes to score slice only)
- PDF preview on separate 800ms debounce

**Warning signs:**
Typing feels sluggish, especially with long resumes. Input lag >100ms.

**Phase to address:** Phase with editor implementation (architecture decision in Phase 1).

---

### Pitfall 4: localStorage Data Loss

**What goes wrong:**
User spends 30 minutes crafting a resume, browser clears localStorage (privacy mode, storage pressure, accidental clear), all work is lost.

**Why it happens:**
localStorage has no guarantees about persistence. Browsers can evict it under storage pressure. Private/incognito modes may clear it on tab close. Users accidentally clear browser data.

**How to avoid:**
- Consider IndexedDB via `idb` wrapper instead (more storage, better persistence)
- Schema versioning from day one (for migration between data model changes)
- Prominent "Export as JSON" button always visible
- Autosave indicator showing last save time
- Warning on data-destructive actions (clear, new resume without saving)

**Warning signs:**
Users reporting "my resume disappeared" in GitHub issues.

**Phase to address:** Phase with storage implementation (Phase 1).

---

### Pitfall 5: Next.js SSR Hydration Errors

**What goes wrong:**
Components that access browser APIs (localStorage, window) during server-side rendering cause hydration mismatches, console errors, and broken initial renders.

**Why it happens:**
Next.js App Router renders components on the server first. localStorage, window, and document don't exist on the server. Tiptap editor needs browser DOM.

**How to avoid:**
- All browser API access through useEffect only
- Zustand persist middleware for hydration-safe state management
- Tiptap: set `immediatelyRender: false` and `shouldRerenderOnTransaction: true`
- Use `'use client'` directive on all components that touch browser APIs
- Dynamic import for Tiptap editor component with `ssr: false` if needed

**Warning signs:**
Console errors about hydration mismatch on first page load. Content flash or layout shift.

**Phase to address:** Phase 1 (foundation). Must be solved before any localStorage or editor work.

---

### Pitfall 6: Bidirectional Tiptap Data Binding

**What goes wrong:**
Store changes are synced back into Tiptap via useEffect, causing cursor position resets, undo history corruption, and infinite update loops.

**Why it happens:**
Developers instinctively create two-way binding between state and editor. Tiptap's internal state management conflicts with external state writes.

**How to avoid:**
One-directional flow only: Editor -> Store via `onUpdate` -> `getJSON()`. Never store -> editor. Use Tiptap's command API for explicit writes (AI suggestion acceptance).

**Warning signs:**
Cursor jumps to beginning/end of document after accepting AI suggestion. Undo stops working or undoes unexpected changes.

**Phase to address:** Phase with editor implementation. Architecture decision, not a bug fix.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Direct OpenAI SDK calls instead of AI SDK | Faster initial implementation | N-provider maintenance when adding BYOK support | Never (AI SDK from day one) |
| Inline PDF rendering (`<PDFViewer>`) | Simpler code | 100-500ms main thread blocking per render | Never (imperative API from day one) |
| Single global Zustand store (no slices) | Less boilerplate | Editor re-renders on score changes, performance degrades | Only for prototype/spike |
| Skipping PDF text extraction tests | Faster CI | ATS compatibility bugs ship to users undetected | Never for production |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel AI SDK + Next.js API routes | Exposing user API key in client-side code | Proxy through API route, key sent in request header, never in client bundle |
| Tiptap v3 + Next.js 16 SSR | Importing Tiptap without `'use client'` directive | Mark editor component as client-only, set SSR-safe options |
| @react-pdf/renderer + Tailwind | Trying to use Tailwind classes in PDF templates | PDF templates use @react-pdf's own StyleSheet API, completely separate from Tailwind |
| Better Auth + Drizzle | Using Prisma schema generation commands with Drizzle | Better Auth has Drizzle-specific adapter, use it directly |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Scoring on every keystroke without debounce | UI freezes during fast typing | 300ms debounce on scoring recomputation | Resumes with 20+ bullet points |
| PDF re-render on every store change | Editor feels sluggish, browser tab memory spikes | 800ms debounce, imperative rendering, blob URL cleanup | Any resume longer than 1 page |
| Fuzzy keyword matching with large alias dictionary | Score computation exceeds 5ms target | Pre-index aliases into a Map on load, not per-computation lookup | Dictionary exceeds 500 entries |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing user API key in localStorage unencrypted | Key exposed to any XSS attack or browser extension | Encrypt at rest in M1 (even basic), use server-side encrypted storage in M2 |
| Passing resume content to LLM without sanitization | Prompt injection via malicious job descriptions | Sanitize JD input, use structured prompts with AI SDK generateObject() |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Score appears before keywords are extracted | User sees 0/100, panics, thinks tool is broken | Show "Analyzing job description..." state, only show score after extraction completes |
| No indication of what "good" score means | User doesn't know if 72 is good or bad | Add contextual guidance: "72 is decent. Most successful resumes score 75+. You're missing 3 hard requirements." |
| Missing keyword list without actionable guidance | User sees red items but doesn't know how to fix | Each missing keyword should suggest WHERE in the resume to add it and HOW to phrase it |

## "Looks Done But Isn't" Checklist

- [ ] **PDF Export:** Looks correct in PDF viewer but ATS extracts garbled text -- verify with automated text extraction test
- [ ] **Keyword Matching:** Matches "React" but misses "React.js" or "ReactJS" -- verify fuzzy matching covers common aliases
- [ ] **Score Calculation:** Shows 85/100 but weights don't sum to 1.0 -- verify all 5 components sum to exactly 1.0
- [ ] **Autosave:** Saves on timer but loses data on tab close -- add beforeunload handler for unsaved changes
- [ ] **Template Rendering:** Looks good with sample data but breaks with long names, empty sections, or 3-page resumes -- test edge cases
- [ ] **AI Suggestions:** Suggestions appear but accepting them breaks undo history -- verify Tiptap command API preserves undo stack

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Font encoding ATS breakage | PDF export phase | CI test: export PDF, extract text, compare to input |
| Score false confidence | Scoring engine phase | Manual review: generate 10 resumes, verify scores feel honest |
| Tiptap re-render cascade | Editor phase | Performance test: type in 50-bullet resume, verify <100ms input latency |
| localStorage data loss | Foundation phase | Test: clear storage, verify warning shown and export available |
| SSR hydration errors | Foundation phase | Test: hard refresh page, verify no console hydration errors |
| Bidirectional binding | Editor phase | Test: accept AI suggestion, verify cursor position and undo work |

---
*Pitfalls research for: AI Resume Builder*
*Researched: 2026-04-10*
