# Architecture Research

**Domain:** AI Resume Builder with Live ATS Scoring
**Researched:** 2026-04-10
**Confidence:** HIGH

## System Overview

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                             |
|  +------------------+  +------------------+  +------------------+      |
|  | JD Input Panel   |  | Resume Editor    |  | Score Panel      |      |
|  | (paste + chips)  |  | (Tiptap v3)      |  | (live score +    |      |
|  |                  |  |                  |  |  suggestions)    |      |
|  +--------+---------+  +--------+---------+  +--------+---------+      |
|           |                     |                     |                |
+-----------+---------------------+---------------------+----------------+
|                         STATE LAYER (Zustand)                          |
|  +----------+  +------------+  +----------+  +---------+  +--------+  |
|  | resume   |  | jobDesc    |  | keywords |  | score   |  | ui     |  |
|  | slice    |  | slice      |  | slice    |  | slice   |  | slice  |  |
|  +----+-----+  +-----+------+  +----+-----+  +----+----+  +--------+  |
|       |               |              |              |                  |
+-----------+---------------------+---------------------+----------------+
|                         SERVICE LAYER                                  |
|  +------------------+  +------------------+  +------------------+      |
|  | AI Service       |  | Scoring Engine   |  | PDF Service      |      |
|  | (Vercel AI SDK)  |  | (deterministic)  |  | (@react-pdf)     |      |
|  +------------------+  +------------------+  +------------------+      |
|                                                                        |
+-----------+---------------------+---------------------+----------------+
|                         STORAGE LAYER                                  |
|  +------------------+  +------------------+                            |
|  | StorageAdapter   |  | API Routes       |                            |
|  | (localStorage    |  | (LLM proxy,      |                            |
|  |  -> Drizzle M2)  |  |  auth M2)        |                            |
|  +------------------+  +------------------+                            |
+-----------------------------------------------------------------------+
```

## Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| JD Input Panel | Accept job description text, display extracted keyword chips | React component, textarea + chip display |
| Resume Editor | Rich text editing with structured resume sections | Tiptap v3 with custom node extensions (ResumeDocument, ExperienceSection, etc.) |
| Score Panel | Display live ATS score, keyword breakdown, missing keywords, AI suggestions | React component subscribing to score slice |
| Zustand Store | Central state management with domain-specific slices | Zustand with slices pattern (resume, jobDesc, keywords, score, ui) |
| AI Service | LLM integration for keyword extraction and suggestion generation | Vercel AI SDK v6 with BYOK provider abstraction |
| Scoring Engine | Deterministic ATS score computation from keywords + resume text | Pure TypeScript module, no React dependency, <5ms per computation |
| PDF Service | Live PDF preview and ATS-friendly PDF export | @react-pdf/renderer imperative API (pdf().toBlob()), debounced 800ms |
| Storage Adapter | Persistence abstraction (localStorage M1, Drizzle+PostgreSQL M2) | Interface pattern enabling M1->M2 migration without consuming code changes |

## Recommended Project Structure

```
src/
  app/                          # Next.js App Router pages
    page.tsx                    # Three-panel editor (main page)
    layout.tsx                  # Root layout with providers
    api/
      ai/
        extract/route.ts        # LLM keyword extraction endpoint
        suggest/route.ts        # LLM suggestion generation endpoint
    dashboard/                  # M2: variant dashboard
      page.tsx
  components/
    editor/
      ResumeEditor.tsx          # Main Tiptap editor wrapper
      extensions/               # Custom Tiptap node extensions
        resume-document.ts      # ResumeDocument schema
        experience-section.ts   # ExperienceSection node
        education-section.ts    # EducationSection node
        skills-section.ts       # SkillsSection node
        contact-section.ts      # ContactInfo node
        suggestion-mark.ts      # Inline AI suggestion decoration
    jd-panel/
      JDInput.tsx               # Job description textarea
      KeywordChips.tsx          # Extracted keyword display
    score-panel/
      ScoreDisplay.tsx          # ATS score gauge/bar
      KeywordBreakdown.tsx      # Matched/missing keyword lists
      SuggestionList.tsx        # AI suggestion cards
    pdf-preview/
      PDFPreview.tsx            # Live PDF iframe display
      PDFExport.tsx             # Export button and download
    templates/
      classic.tsx               # M1: single ATS-safe template
  lib/
    store/
      index.ts                  # Zustand store with all slices
      slices/
        resume.ts               # Resume data slice
        job-description.ts      # JD text + extraction state
        keywords.ts             # Extracted keyword set
        score.ts                # ATS score computation results
        ui.ts                   # UI state (panels, modals)
    scoring/
      engine.ts                 # Main scoring function
      keyword-matcher.ts        # Fuzzy keyword matching logic
      format-checker.ts         # Formatting compliance checks
    ai/
      provider.ts               # AI SDK provider configuration
      extract-keywords.ts       # Keyword extraction prompt + schema
      generate-suggestions.ts   # Suggestion generation prompt
    pdf/
      render.ts                 # Imperative PDF rendering (pdf().toBlob())
      templates/
        classic.tsx             # PDF template using @react-pdf primitives
    storage/
      adapter.ts                # Storage interface definition
      local-storage.ts          # M1: localStorage implementation
      database.ts               # M2: Drizzle/PostgreSQL implementation
  data/
    keyword-aliases.json        # Fuzzy matching dictionary
  types/
    resume.ts                   # Resume, Experience, Education, Skills types
    job-description.ts          # JobDescription, KeywordSet, Keyword types
    variant.ts                  # M2: Variant, MasterSnapshot types
    scoring.ts                  # ScoreResult, ScoreBreakdown types
```

## Architectural Patterns

### Pattern 1: Zustand Slices with Selective Subscriptions

**What:** Split global state into domain slices. Components subscribe only to slices they need.
**When to use:** Multi-panel UIs where different panels depend on different data domains.
**Trade-offs:** Slightly more boilerplate than a single store, but prevents the editor re-rendering when only the score changes.

```typescript
// store/slices/score.ts
interface ScoreSlice {
  score: number;
  breakdown: ScoreBreakdown;
  recompute: (resumeText: string, keywords: KeywordSet) => void;
}

// In a component — only re-renders when score changes
const score = useStore((s) => s.score);
```

### Pattern 2: One-Directional Editor Data Flow

**What:** Tiptap writes to the store via `onUpdate` -> `editor.getJSON()`. The store never writes back to the editor except on initial load and explicit AI suggestion acceptance.
**When to use:** Any Tiptap integration.
**Trade-offs:** Requires explicit command API calls for AI suggestions, but prevents cursor jumps, undo corruption, and infinite update loops.

```typescript
// Editor writes to store
editor.on('update', ({ editor }) => {
  const json = editor.getJSON();
  useStore.getState().setResumeContent(json);
});

// AI suggestion acceptance writes to editor (not through store)
const acceptSuggestion = (pos: number, text: string) => {
  editor.chain().focus().insertContentAt(pos, text).run();
};
```

### Pattern 3: Storage Adapter Interface

**What:** Abstract persistence behind an interface. M1 implements localStorage, M2 swaps to database.
**When to use:** When you know the storage backend will change between milestones.
**Trade-offs:** Small upfront cost for interface definition, large payoff when migrating.

```typescript
interface StorageAdapter {
  saveResume(resume: Resume): Promise<void>;
  loadResume(id: string): Promise<Resume | null>;
  listResumes(): Promise<ResumeSummary[]>;
  deleteResume(id: string): Promise<void>;
}
```

## Data Flow

### Keyword Extraction Flow (one-time, on JD paste)

```
User pastes JD text
    |
    v
JD Panel component
    |
    v
Store: jobDescription slice (rawText)
    |
    v
API Route: /api/ai/extract
    |
    v
Vercel AI SDK -> LLM Provider (OpenAI/Claude/etc)
    |
    v
Structured KeywordSet (Zod validated)
    |
    v
Store: keywords slice
    |
    v
Score Panel: displays keyword chips
    |
    v
Scoring Engine: initial score computation
    |
    v
Store: score slice -> Score Panel re-renders
```

### Live Scoring Flow (continuous, on every edit)

```
User types in editor
    |
    v
Tiptap onUpdate (debounced 300ms)
    |
    v
editor.getJSON() -> Store: resume slice
    |
    v
Scoring engine subscribes to resume + keywords slices
    |
    v
Deterministic score computation (<5ms)
    |
    v
Store: score slice
    |
    v
Score Panel re-renders (score, breakdown, missing keywords)
```

### PDF Preview Flow (debounced)

```
Store: resume slice changes
    |
    v
usePDFPreview hook (debounced 800ms)
    |
    v
pdf(<ResumeTemplate data={resume} />).toBlob()
    |
    v
URL.createObjectURL(blob)
    |
    v
iframe src update -> PDF visible to user
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | M1 architecture (client-side only, no backend). No changes needed. |
| 1k-10k users | M2 architecture (auth + database). Serverless functions handle load. |
| 10k-100k users | Add caching for LLM keyword extractions (same JD = same keywords). Connection pooling for database. |
| 100k+ users | Web worker for PDF rendering. Redis cache for common keyword sets. CDN for static assets. |

## Anti-Patterns

### Anti-Pattern 1: Bidirectional Editor Binding

**What people do:** Sync store changes back into Tiptap via useEffect.
**Why it's wrong:** Causes cursor position resets, undo history corruption, and infinite update loops.
**Do this instead:** One-directional flow. Editor -> Store only. Use Tiptap command API for explicit writes.

### Anti-Pattern 2: LLM in the Scoring Loop

**What people do:** Call the LLM on every keystroke to re-evaluate the resume.
**Why it's wrong:** 2-5 second latency per call, $0.01+ per call, rate limiting.
**Do this instead:** Two-stage architecture. LLM extracts keywords once. Local scoring runs on every edit.

### Anti-Pattern 3: Synchronous PDF Rendering in React Tree

**What people do:** Render `<PDFViewer>` component inline, which blocks main thread.
**Why it's wrong:** 100-500ms blocking per render makes the editor feel sluggish.
**Do this instead:** Imperative `pdf().toBlob()` with 800ms debounce, display in iframe.

## Build Order (Dependencies)

1. **Types + Store skeleton + Storage adapter** (no dependencies, everything imports these)
2. **Three-panel layout** (depends on types for prop interfaces)
3. **Resume Editor (Tiptap)** (depends on store, types)
4. **PDF Preview** (depends on store, resume types)
5. **Scoring Engine** (depends on types only, pure TS, can be built/tested independently)
6. **JD Input + Keyword Extraction** (depends on AI service, store)
7. **Score Display + Integration** (depends on scoring engine, keyword store)
8. **AI Suggestions** (depends on editor, keywords, scoring)
9. **Template + PDF Export** (depends on PDF service, resume types)

Items 3, 4, and 5 can be developed in parallel once items 1-2 are complete.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| LLM Provider (OpenAI/Claude/etc) | Vercel AI SDK via Next.js API route proxy | API key stored client-side, sent to proxy route, never exposed to browser network tab |
| Vercel (deployment) | `next build && next export` or Vercel CLI | M1 can be fully static export if API routes are edge functions |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Editor <-> Store | Tiptap onUpdate -> getJSON() -> store action | One-directional only |
| Store <-> Scoring | Store subscription triggers recompute | Zustand subscribe with selector |
| Store <-> PDF | Store subscription triggers debounced re-render | 800ms debounce, imperative API |
| Store <-> Storage | Autosave timer reads store, writes to adapter | 10-second interval |

---
*Architecture research for: AI Resume Builder*
*Researched: 2026-04-10*
